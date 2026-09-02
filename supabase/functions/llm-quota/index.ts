import { corsHeaders, jsonResponse, requireUser } from '../_shared/auth.ts';
import {
  createServiceClient,
  fetchDeepSeekBalance,
  getDailyLimit,
  getDefaultModel,
  getUserQuota,
  isQuotaAdmin,
  resetTodayQuota,
} from '../_shared/quota.ts';

async function buildQuotaResponse(userId: string) {
  const admin = createServiceClient();
  const quota = await getUserQuota(admin, userId);
  const model = getDefaultModel();
  const dailyLimit = getDailyLimit();

  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  const balance = deepseekApiKey ? await fetchDeepSeekBalance(deepseekApiKey) : null;

  return {
    model,
    dailyLimit,
    usedToday: quota.used,
    remaining: quota.remaining,
    balance: balance
      ? {
          isAvailable: balance.isAvailable,
          total: balance.totalBalance,
          currency: balance.currency,
        }
      : null,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await requireUser(req);
  if (auth.error) return auth.error;

  const user = auth.user!;

  if (req.method === 'GET') {
    return jsonResponse(await buildQuotaResponse(user.id));
  }

  if (req.method === 'POST') {
    if (!isQuotaAdmin(user.email)) {
      return jsonResponse({ error: 'Forbidden', detail: '仅开发者账号可重置额度' }, 403);
    }

    try {
      const admin = createServiceClient();
      const clearedRows = await resetTodayQuota(admin);
      const quota = await buildQuotaResponse(user.id);
      return jsonResponse({
        ok: true,
        clearedRows,
        message: `已重置今日 AI 额度（清除 ${clearedRows} 条用量记录）`,
        ...quota,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset failed';
      return jsonResponse({ error: message }, 500);
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
});
