import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/client';
import { getAccessToken } from './call';
import type { LlmQuotaInfo } from './types';

export type { LlmQuotaInfo };

export async function fetchLlmQuota(): Promise<LlmQuotaInfo> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('请先登录后再查看 AI 额度');
  }

  let response: Response;
  try {
    response = await fetch(`${getSupabaseUrl()}/functions/v1/llm-quota`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: getSupabaseAnonKey(),
      },
    });
  } catch (error) {
    const hint = error instanceof Error ? error.message : '网络请求失败';
    throw new Error(`额度查询失败（${hint}）`);
  }

  let payload: LlmQuotaInfo & { error?: string; detail?: string; code?: string };
  try {
    payload = await response.json() as LlmQuotaInfo & { error?: string; detail?: string; code?: string };
  } catch {
    throw new Error(`额度查询返回异常 (${response.status})`);
  }

  if (!response.ok) {
    if (response.status === 404 || payload.code === 'NOT_FOUND') {
      throw new Error('额度查询服务未部署，请执行：supabase functions deploy llm-quota --no-verify-jwt');
    }
    throw new Error(payload.detail ?? payload.error ?? `额度查询失败 (${response.status})`);
  }

  return payload;
}

export function formatLlmQuotaLabel(quota: LlmQuotaInfo): string {
  return `${quota.model} · 今日剩余 ${quota.remaining}/${quota.dailyLimit} 次`;
}

export function formatLlmBalanceLabel(quota: LlmQuotaInfo): string | null {
  if (!quota.balance?.total) return null;
  const symbol = quota.balance.currency === 'USD' ? '$' : '¥';
  return `账户余额 ${symbol}${quota.balance.total}`;
}

export async function resetLlmQuotaToday(): Promise<LlmQuotaInfo> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('请先登录后再重置 AI 额度');
  }

  let response: Response;
  try {
    response = await fetch(`${getSupabaseUrl()}/functions/v1/llm-quota`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: getSupabaseAnonKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'reset_today' }),
    });
  } catch (error) {
    const hint = error instanceof Error ? error.message : '网络请求失败';
    throw new Error(`额度重置失败（${hint}）`);
  }

  let payload = await response.json() as LlmQuotaInfo & {
    error?: string;
    detail?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.detail ?? payload.error ?? `额度重置失败 (${response.status})`);
  }

  return payload;
}
