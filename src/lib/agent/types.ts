import type { ChatMessage, LlmTool, ToolCall } from '@/lib/llm/types';

/** 工具执行时可用的上下文（目前无需网络，后续可注入 userId） */
export interface AgentToolContext {
  userId?: string;
}

/** 工具的统一返回：content 给模型，summary 给 UI 轨迹 */
export interface ToolResult {
  content: string;
  summary: string;
  isError?: boolean;
  truncated?: boolean;
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  /** JSON Schema（type: object），用于生成工具声明 */
  parameters: Record<string, unknown>;
  /** 写操作：不自动执行，交由 UI 二次确认 */
  requiresConfirm?: boolean;
  execute: (
    args: Record<string, unknown>,
    context: AgentToolContext
  ) => ToolResult | Promise<ToolResult>;
}

/** 模型一轮的回复，屏蔽底层 OpenAI 兼容结构 */
export interface AgentLlmReply {
  content: string | null;
  toolCalls: ToolCall[];
  finishReason?: string | null;
}

/** 注入模型客户端，便于单测与将来换供应商 */
export interface AgentLlmClient {
  call: (messages: ChatMessage[], tools: LlmTool[]) => Promise<AgentLlmReply>;
}

export type AgentEvent =
  | { type: 'step_start'; step: number }
  | { type: 'model_reply'; step: number; toolCallCount: number; content: string | null }
  | { type: 'tool_call'; step: number; name: string; args: string }
  | { type: 'tool_result'; step: number; name: string; result: ToolResult }
  | { type: 'pending_action'; step: number; name: string; args: Record<string, unknown>; summary: string }
  | { type: 'done'; reason: 'answered' | 'max_steps' | 'aborted' };

export interface AgentRunOptions {
  llm: AgentLlmClient;
  tools: AgentToolDefinition[];
  /** 最大循环轮数，默认 6 */
  maxSteps?: number;
  signal?: AbortSignal;
  context?: AgentToolContext;
  onEvent?: (event: AgentEvent) => void;
}

export interface AgentRunResult {
  /** 完整消息序列（含 tool 往返），可直接续跑 */
  messages: ChatMessage[];
  /** 最终回答；未收敛时为 null */
  answer: string | null;
  steps: number;
  reason: 'answered' | 'max_steps' | 'aborted';
}

export type { ChatMessage };
