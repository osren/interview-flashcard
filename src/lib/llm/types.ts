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
  quota?: {
    used: number;
    limit: number;
    remaining: number;
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
