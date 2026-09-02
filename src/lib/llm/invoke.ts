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

  let response: Response;
  try {
    response = await fetch(`${getSupabaseUrl()}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: getSupabaseAnonKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    const hint = error instanceof Error ? error.message : '网络请求失败';
    throw new Error(
      `${name} 请求失败（${hint}）。请确认 Edge Function 已部署：supabase functions deploy ${name} --no-verify-jwt`
    );
  }

  let payload: T & { error?: string; detail?: string; message?: string; code?: string };
  try {
    payload = await response.json() as T & { error?: string; detail?: string; message?: string; code?: string };
  } catch {
    throw new Error(`${name} 返回异常 (${response.status})，请检查 Supabase Edge Function 是否已部署`);
  }

  if (!response.ok) {
    if (response.status === 429 && payload.error === 'QUOTA_EXCEEDED') {
      throw new Error(payload.detail ?? '今日 AI 额度已用完，请明日再试');
    }
    if (response.status === 404 || payload.code === 'NOT_FOUND') {
      throw new Error(
        `Edge Function「${name}」未部署。请在项目根目录执行：supabase functions deploy ${name} --no-verify-jwt`
      );
    }
    throw new Error(
      payload.detail
        ? `${payload.error ?? payload.message}: ${payload.detail}`
        : (payload.error ?? payload.message ?? `${name} 请求失败 (${response.status})`)
    );
  }

  return payload;
}
