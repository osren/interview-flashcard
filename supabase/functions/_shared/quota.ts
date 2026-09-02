import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AiQuotaSnapshot {
  used: number;
  limit: number;
  remaining: number;
}

export interface AiQuotaConsumeResult extends AiQuotaSnapshot {
  ok: boolean;
}

export interface DeepSeekBalanceSnapshot {
  isAvailable: boolean;
  totalBalance: string | null;
  currency: string;
}

export function getDailyLimit(): number {
  const raw = Deno.env.get('AI_DAILY_LIMIT') ?? '50';
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
}

export function getDefaultModel(): string {
  return Deno.env.get('AI_DEFAULT_MODEL') ?? 'deepseek-chat';
}

export function createServiceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(url, key);
}

export async function getUserQuota(
  admin: SupabaseClient,
  userId: string
): Promise<AiQuotaSnapshot> {
  const limit = getDailyLimit();
  const { data, error } = await admin.rpc('get_ai_quota', {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error || !data) {
    return { used: 0, limit, remaining: limit };
  }

  const payload = data as AiQuotaSnapshot;
  return {
    used: payload.used ?? 0,
    limit: payload.limit ?? limit,
    remaining: payload.remaining ?? limit,
  };
}

export async function consumeUserQuota(
  admin: SupabaseClient,
  userId: string
): Promise<AiQuotaConsumeResult> {
  const limit = getDailyLimit();
  const { data, error } = await admin.rpc('try_consume_ai_quota', {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to consume AI quota');
  }

  const payload = data as AiQuotaConsumeResult;
  return {
    ok: Boolean(payload.ok),
    used: payload.used ?? 0,
    limit: payload.limit ?? limit,
    remaining: payload.remaining ?? 0,
  };
}

export async function fetchDeepSeekBalance(apiKey: string): Promise<DeepSeekBalanceSnapshot | null> {
  try {
    const response = await fetch('https://api.deepseek.com/user/balance', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return null;

    const data = await response.json() as {
      is_available?: boolean;
      balance_infos?: Array<{
        currency?: string;
        total_balance?: string;
      }>;
    };

    const info = data.balance_infos?.[0];
    return {
      isAvailable: Boolean(data.is_available),
      totalBalance: info?.total_balance ?? null,
      currency: info?.currency ?? 'CNY',
    };
  } catch {
    return null;
  }
}

export function quotaExceededResponse(quota: AiQuotaSnapshot): Response {
  return new Response(
    JSON.stringify({
      error: 'QUOTA_EXCEEDED',
      detail: `今日 AI 额度已用完（${quota.used}/${quota.limit}），请明日再试`,
      quota,
    }),
    {
      status: 429,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json',
      },
    }
  );
}
