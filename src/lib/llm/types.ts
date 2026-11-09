export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

/** 模型返回的工具调用（arguments 是 JSON 字符串，调用方需自行 parse） */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/** 注册给模型的工具声明（JSON Schema） */
export interface LlmToolFunction {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface LlmTool {
  type: 'function';
  function: LlmToolFunction;
}

export type LlmToolChoice =
  | 'auto'
  | 'none'
  | { type: 'function'; function: { name: string } };

/**
 * 对话消息。按 role 判别，避免 tool 消息漏带 tool_call_id 这类低级错误。
 * assistant 带 tool_calls 时 content 允许为 null（OpenAI 兼容协议）。
 */
export type ChatMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; content: string; tool_call_id: string; name?: string };

export interface LlmCallOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  stream?: boolean;
  max_tokens?: number;
  response_format?: { type: string };
  tools?: LlmTool[];
  tool_choice?: LlmToolChoice;
  /** Agent 一轮对话的幂等标识：同一轮多次调用只扣一次额度 */
  turnId?: string;
}

export interface LlmProxyErrorBody {
  error?: string;
  detail?: string;
  quota?: {
    used: number;
    limit: number;
    remaining: number;
  };
}

/** 非流式响应（OpenAI 兼容 /chat/completions） */
export interface LlmResponseMessage {
  role: 'assistant';
  content: string | null;
  tool_calls?: ToolCall[];
}

export interface LlmChatChoice {
  index: number;
  message: LlmResponseMessage;
  finish_reason: string | null;
}

export interface LlmChatResponse {
  id?: string;
  model?: string;
  choices: LlmChatChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface LlmQuotaBalance {
  isAvailable: boolean;
  total: string | null;
  currency: string;
}

export interface LlmQuotaInfo {
  model: string;
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  balance: LlmQuotaBalance | null;
}
