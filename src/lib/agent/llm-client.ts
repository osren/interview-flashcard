import { callLlmJson } from '@/lib/llm/call';
import type { LlmChatResponse } from '@/lib/llm/types';
import type { AgentLlmClient, AgentLlmReply } from './types';

interface LlmClientOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 把现有 llm-proxy 适配成 Agent 需要的 LlmClient。
 * 工具规划轮固定非流式（流式下 tool_calls 分片难拼），最终回答的流式由 UI 层单独处理。
 */
export function createLlmClient(options: LlmClientOptions = {}): AgentLlmClient {
  return {
    call: async (messages, tools): Promise<AgentLlmReply> => {
      const response = await callLlmJson<LlmChatResponse>({
        messages,
        tools,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        model: options.model,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1024,
      });

      const choice = response.choices?.[0];
      return {
        content: choice?.message?.content ?? null,
        toolCalls: choice?.message?.tool_calls ?? [],
        finishReason: choice?.finish_reason ?? null,
      };
    },
  };
}
