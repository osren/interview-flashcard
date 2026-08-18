import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/client';
import { getAccessToken } from './call';

export async function invokeEdgeFunction<T>(
  name: string,
  body: unknown
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('请先登录后再使用 AI 功能');
  }

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: getSupabaseAnonKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json() as T & { error?: string; detail?: string };
  if (!response.ok) {
    throw new Error(payload.detail ? `${payload.error}: ${payload.detail}` : (payload.error ?? `${name} 请求失败`));
  }
  return payload;
}
