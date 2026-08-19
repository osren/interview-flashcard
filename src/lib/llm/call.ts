import { getSupabaseAnonKey, getSupabaseUrl, supabase } from '@/lib/supabase/client';
import type { ChatMessage, LlmCallOptions, LlmProxyErrorBody } from './types';

export type { ChatMessage, LlmCallOptions };

async function parseLlmError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as LlmProxyErrorBody;
    if (body.detail) return `${body.error ?? 'LLM 请求失败'}: ${body.detail}`;
    return body.error ?? `LLM 请求失败 (${response.status})`;
  } catch {
    return `LLM 请求失败 (${response.status})`;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function callLlm(options: LlmCallOptions): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('请先登录后再使用 AI 功能');
  }

  let response: Response;
  try {
    response = await fetch(`${getSupabaseUrl()}/functions/v1/llm-proxy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: getSupabaseAnonKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model ?? 'deepseek-chat',
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        stream: options.stream ?? false,
        max_tokens: options.max_tokens,
        response_format: options.response_format,
      }),
    });
  } catch (error) {
    const hint = error instanceof Error ? error.message : '网络请求失败';
    throw new Error(`AI 请求失败（${hint}）。请检查网络或 Supabase 配置`);
  }

  return response;
}

export async function callLlmJson<T>(options: Omit<LlmCallOptions, 'stream'>): Promise<T> {
  const response = await callLlm({ ...options, stream: false });
  if (!response.ok) {
    throw new Error(await parseLlmError(response));
  }
  return response.json() as Promise<T>;
}

export async function* streamLlm(options: Omit<LlmCallOptions, 'stream'>): AsyncGenerator<string> {
  const response = await callLlm({ ...options, stream: true });
  if (!response.ok) {
    throw new Error(await parseLlmError(response));
  }
  if (!response.body) {
    throw new Error('LLM 流式响应为空');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const payload = JSON.parse(trimmed.slice(6)) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const chunk = payload.choices?.[0]?.delta?.content;
        if (chunk) yield chunk;
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}
