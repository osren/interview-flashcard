import type { LlmTool } from '@/lib/llm/types';
import type { AgentToolContext, AgentToolDefinition, ToolResult } from './types';

/** 单条工具结果的字符上限，防止一次把上下文打爆 */
export const MAX_TOOL_RESULT_CHARS = 2000;

export interface ToolRegistry {
  definitions: AgentToolDefinition[];
  schemas: LlmTool[];
  get: (name: string) => AgentToolDefinition | undefined;
  names: string[];
}

export function toLlmTools(tools: AgentToolDefinition[]): LlmTool[] {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export function createToolRegistry(tools: AgentToolDefinition[]): ToolRegistry {
  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  return {
    definitions: tools,
    schemas: toLlmTools(tools),
    get: (name) => byName.get(name),
    names: tools.map((tool) => tool.name),
  };
}

export function truncateToolContent(content: string): { content: string; truncated: boolean } {
  if (content.length <= MAX_TOOL_RESULT_CHARS) {
    return { content, truncated: false };
  }
  return {
    content: `${content.slice(0, MAX_TOOL_RESULT_CHARS)}…（内容过长已截断）`,
    truncated: true,
  };
}

/**
 * 执行工具并吞掉所有异常：异常会转成内容回喂给模型，而不是中断整轮对话。
 * arguments 是模型给的 JSON 字符串，解析失败同样回喂。
 */
export async function runTool(
  tool: AgentToolDefinition,
  rawArguments: string,
  context: AgentToolContext = {}
): Promise<ToolResult> {
  let args: Record<string, unknown>;
  try {
    const parsed = rawArguments.trim() ? JSON.parse(rawArguments) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('参数必须是 JSON 对象');
    }
    args = parsed as Record<string, unknown>;
  } catch (error) {
    const message = error instanceof Error ? error.message : '参数解析失败';
    return {
      content: JSON.stringify({ error: `工具「${tool.name}」参数解析失败：${message}` }),
      summary: `参数解析失败：${message}`,
      isError: true,
    };
  }

  try {
    const result = await tool.execute(args, context);
    const short = truncateToolContent(result.content);
    return short.truncated
      ? { ...result, content: short.content, truncated: true }
      : result;
  } catch (error) {
    const message = error instanceof Error ? error.message : '工具执行失败';
    return {
      content: JSON.stringify({ error: `工具「${tool.name}」执行失败：${message}` }),
      summary: `执行失败：${message}`,
      isError: true,
    };
  }
}
