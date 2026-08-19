export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface LlmCallOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  stream?: boolean;
  max_tokens?: number;
  response_format?: { type: string };
}

export interface LlmProxyErrorBody {
  error?: string;
  detail?: string;
}
