import { useCallback, useRef, useState } from 'react';
import { runAgent } from '@/lib/agent/loop';
import { createLlmClient } from '@/lib/agent/llm-client';
import { runTool } from '@/lib/agent/registry';
import { agentTools } from '@/lib/agent/tools';
import { recordAgentTrace, type AgentTraceStep } from '@/lib/agent/trace';
import type { AgentEvent } from '@/lib/agent/types';
import { buildCampusAgentMessages } from '@/lib/llm/prompts/campus-agent';
import { useLlmQuota } from '@/hooks/useLlmQuota';
import { toAgentHistory, useAgentChatStore } from '@/store/useAgentChatStore';

const MAX_STEPS = 6;
const QUOTA_MSG = '今日 AI 额度已用完，请明日再试';

export type { AgentChatMessage } from '@/store/useAgentChatStore';

export interface AgentToolTrace {
  step: number;
  name: string;
  args: string;
  summary: string;
  isError?: boolean;
}

export interface AgentPendingAction {
  name: string;
  args: Record<string, unknown>;
  summary: string;
}

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface UseAgentChatOptions {
  enabled?: boolean;
}

export function useAgentChat({ enabled = true }: UseAgentChatOptions = {}) {
  // 消息存在持久化 store：关抽屉、刷新页面都还在，只滚动保留最近 20 条
  const messages = useAgentChatStore((state) => state.messages);
  const appendMessage = useAgentChatStore((state) => state.appendMessage);
  const clearMessages = useAgentChatStore((state) => state.clearMessages);

  const [traces, setTraces] = useState<AgentToolTrace[]>([]);
  const [pending, setPending] = useState<AgentPendingAction | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runningRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const {
    quota,
    refresh: refreshQuota,
    canUseAi,
    quotaReady,
    isQuotaExhausted,
  } = useLlmQuota({ enabled });

  const send = useCallback(
    async (rawInput: string) => {
      const input = rawInput.trim();
      if (!input || runningRef.current) return;

      // 额度还没取到时先放行，真正超限由 llm-proxy 返回 QUOTA_EXCEEDED
      if (quotaReady && !canUseAi) {
        setError(isQuotaExhausted ? QUOTA_MSG : '当前无法使用 AI，请先登录');
        return;
      }

      runningRef.current = true;
      setRunning(true);
      setError(null);
      setPending(null);
      setTraces([]);

      // 先取历史（不含本轮输入），再落用户消息，避免同一条被拼两次
      const historyBefore = toAgentHistory(useAgentChatStore.getState().messages);
      const turnId = newId('turn');
      appendMessage({ id: newId('user'), role: 'user', content: input });

      const workingHistory = buildCampusAgentMessages(historyBefore, input);
      const stepLog: AgentTraceStep[] = [];
      const toolNames: string[] = [];
      const startedAt = Date.now();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const llm = createLlmClient({ turnId });
        const result = await runAgent(
          {
            llm,
            tools: agentTools,
            maxSteps: MAX_STEPS,
            signal: controller.signal,
            onEvent: (event: AgentEvent) => {
              if (event.type === 'tool_call') {
                toolNames.push(event.name);
                stepLog.push({ step: event.step, tool: event.name, args: event.args.slice(0, 500) });
                setTraces((prev) => [
                  ...prev,
                  {
                    step: event.step,
                    name: event.name,
                    args: event.args.slice(0, 500),
                    summary: '执行中…',
                  },
                ]);
                return;
              }

              if (event.type === 'tool_result') {
                const last = stepLog[stepLog.length - 1];
                if (last && last.tool === event.name) {
                  last.summary = event.result.summary;
                  last.isError = event.result.isError;
                }
                setTraces((prev) => {
                  const next = [...prev];
                  for (let i = next.length - 1; i >= 0; i -= 1) {
                    if (next[i].name === event.name) {
                      next[i] = {
                        ...next[i],
                        summary: event.result.summary,
                        isError: event.result.isError,
                      };
                      break;
                    }
                  }
                  return next;
                });
                return;
              }

              if (event.type === 'pending_action') {
                setPending({ name: event.name, args: event.args, summary: event.summary });
              }
            },
          },
          workingHistory
        );

        if (result.answer) {
          appendMessage({
            id: newId('assistant'),
            role: 'assistant',
            content: result.answer ?? '',
          });
        }

        if (result.reason === 'max_steps') {
          appendMessage({
            id: newId('assistant'),
            role: 'assistant',
            content:
              '这轮查得有点久，我先停下。你可以把问题说得更具体一些，比如「我在 AI 面的岗位有哪些」。',
          });
        }

        void recordAgentTrace({
          turnId,
          steps: stepLog,
          toolNames,
          latencyMs: Date.now() - startedAt,
        });
        void refreshQuota();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'AI 请求失败');
      } finally {
        abortRef.current = null;
        runningRef.current = false;
        setRunning(false);
      }
    },
    [appendMessage, canUseAi, isQuotaExhausted, quotaReady, refreshQuota]
  );

  const confirmPending = useCallback(async () => {
    if (!pending || runningRef.current) return;
    const tool = agentTools.find((item) => item.name === pending.name);
    if (!tool) {
      setError(`工具「${pending.name}」不存在`);
      setPending(null);
      return;
    }

    runningRef.current = true;
    setRunning(true);
    try {
      const result = await runTool(tool, JSON.stringify(pending.args));
      setTraces((prev) => [
        ...prev,
        {
          step: prev.length + 1,
          name: tool.name,
          args: JSON.stringify(pending.args),
          summary: result.summary,
          isError: result.isError,
        },
      ]);
      appendMessage({
        id: newId('assistant'),
        role: 'assistant',
        content: result.isError ? `没改成：${result.summary}` : `已更新：${result.summary}`,
      });
      setPending(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '执行失败');
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }, [appendMessage, pending]);

  const dismissPending = useCallback(() => setPending(null), []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    clearMessages();
    setTraces([]);
    setPending(null);
    setError(null);
  }, [clearMessages]);

  return {
    messages,
    traces,
    pending,
    running,
    error,
    quota,
    canUseAi,
    isQuotaExhausted,
    send,
    confirmPending,
    dismissPending,
    cancel,
    reset,
    refreshQuota,
  };
}
