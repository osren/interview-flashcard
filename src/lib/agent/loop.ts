import type { ChatMessage } from '@/lib/llm/types';
import { createToolRegistry, runTool } from './registry';
import type { AgentEvent, AgentRunOptions, AgentRunResult, AgentToolContext, ToolResult } from './types';

const DEFAULT_MAX_STEPS = 6;

/**
 * 工具调用循环：
 *   messages → 模型 → 有 tool_calls 就执行并回填 → 再问模型 → 直到模型给出正文或触顶。
 * 纯函数式，模型与工具都由外部注入，因此可脱离 React / store 单测。
 */
export async function runAgent(
  options: AgentRunOptions,
  messages: ChatMessage[]
): Promise<AgentRunResult> {
  const { llm, tools, maxSteps = DEFAULT_MAX_STEPS, signal, onEvent } = options;
  const registry = createToolRegistry(tools);
  const context: AgentToolContext = options.context ?? {};
  const working: ChatMessage[] = [...messages];

  const emit = (event: AgentEvent) => {
    onEvent?.(event);
  };

  for (let step = 1; step <= maxSteps; step += 1) {
    if (signal?.aborted) {
      emit({ type: 'done', reason: 'aborted' });
      return { messages: working, answer: null, steps: step - 1, reason: 'aborted' };
    }

    emit({ type: 'step_start', step });
    const reply = await llm.call(working, registry.schemas);
    const toolCalls = reply.toolCalls;

    emit({
      type: 'model_reply',
      step,
      toolCallCount: toolCalls.length,
      content: reply.content,
    });

    // 没有工具调用：模型认为可以直接回答，收工
    if (toolCalls.length === 0) {
      const answer = reply.content ?? null;
      if (answer !== null) {
        working.push({ role: 'assistant', content: answer });
      }
      emit({ type: 'done', reason: 'answered' });
      return { messages: working, answer, steps: step, reason: 'answered' };
    }

    // assistant 的 tool_calls 必须原样记录，后面每个 tool 结果才能对上 id
    working.push({ role: 'assistant', content: reply.content, tool_calls: toolCalls });

    for (const call of toolCalls) {
      if (signal?.aborted) {
        emit({ type: 'done', reason: 'aborted' });
        return { messages: working, answer: null, steps: step, reason: 'aborted' };
      }

      const toolName = call.function.name;
      const rawArguments = call.function.arguments;
      const tool = registry.get(toolName);

      emit({ type: 'tool_call', step, name: toolName, args: rawArguments });

      let result: ToolResult;
      if (!tool) {
        result = {
          content: JSON.stringify({
            error: `未知工具「${toolName}」，可用工具：${registry.names.join('、')}`,
          }),
          summary: '未知工具',
          isError: true,
        };
      } else if (tool.requiresConfirm) {
        // 写操作只提案，等用户点确认后由 UI 执行
        let args: Record<string, unknown> = {};
        try {
          const parsed = rawArguments ? JSON.parse(rawArguments) : {};
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            args = parsed as Record<string, unknown>;
          }
        } catch {
          // 参数解析失败时不提案，直接回喂错误
          args = {};
        }
        emit({ type: 'pending_action', step, name: toolName, args, summary: `待确认：${toolName}` });
        result = {
          content: JSON.stringify({
            status: 'pending_user_confirmation',
            note: `「${toolName}」是写操作，已提交给用户确认，未实际执行。不要假设已经完成。`,
          }),
          summary: '等待用户确认',
        };
      } else {
        result = await runTool(tool, rawArguments, context);
      }

      emit({ type: 'tool_result', step, name: toolName, result });
      working.push({
        role: 'tool',
        content: result.content,
        tool_call_id: call.id,
        name: toolName,
      });
    }
  }

  emit({ type: 'done', reason: 'max_steps' });
  return { messages: working, answer: null, steps: maxSteps, reason: 'max_steps' };
}
