/**
 * DeepSeek（OpenAI 兼容）/chat/completions 的请求装配与上游转发。
 * 抽到这里是为了让 llm-proxy 只负责鉴权、配额与流式分流，
 * 也方便后续给 Agent 增加 tools / tool_choice 时只改一处。
 */

export const DEFAULT_CHAT_MODEL = 'deepseek-chat';
export const DEFAULT_TEMPERATURE = 0.7;

const UPSTREAM_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface UpstreamChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  /** assistant 发起工具调用时携带 */
  tool_calls?: unknown[];
  /** role=tool 时必填，对应 tool_calls[].id */
  tool_call_id?: string;
  name?: string;
}

export interface LlmProxyRequestBody {
  model?: string;
  messages: UpstreamChatMessage[];
  temperature?: number;
  stream?: boolean;
  max_tokens?: number;
  response_format?: unknown;
  tools?: unknown[];
  tool_choice?: unknown;
}

/** 真正发给上游的请求体：只包含白名单字段，避免把任意字段透传过去 */
export interface UpstreamChatPayload {
  model: string;
  messages: UpstreamChatMessage[];
  temperature: number;
  stream: boolean;
  max_tokens?: number;
  response_format?: unknown;
  tools?: unknown[];
  tool_choice?: unknown;
}

export function buildUpstreamPayload(body: LlmProxyRequestBody): UpstreamChatPayload {
  const payload: UpstreamChatPayload = {
    model: body.model ?? DEFAULT_CHAT_MODEL,
    messages: body.messages,
    temperature: body.temperature ?? DEFAULT_TEMPERATURE,
    stream: body.stream ?? false,
  };

  // 可选字段仅在传入时出现，保证普通对话的请求体与改造前逐字段一致
  if (body.max_tokens !== undefined) payload.max_tokens = body.max_tokens;
  if (body.response_format !== undefined) payload.response_format = body.response_format;
  if (Array.isArray(body.tools) && body.tools.length > 0) payload.tools = body.tools;
  if (body.tool_choice !== undefined) payload.tool_choice = body.tool_choice;

  return payload;
}

export function forwardChatCompletion(
  payload: UpstreamChatPayload,
  apiKey: string,
  fetcher: typeof fetch = fetch
): Promise<Response> {
  return fetcher(UPSTREAM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
