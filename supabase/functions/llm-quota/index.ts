import { corsHeaders, jsonResponse, requireUser } from '../_shared/auth.ts';
import {
  createServiceClient,
  fetchDeepSeekBalance,
  getDailyLimit,
  getDefaultModel,
  getUserQuota,
} from '../_shared/quota.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const auth = await requireUser(req);
  if (auth.error) return auth.error;

  const admin = createServiceClient();
  const quota = await getUserQuota(admin, auth.user!.id);
  const model = getDefaultModel();
  const dailyLimit = getDailyLimit();

  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  const balance = deepseekApiKey ? await fetchDeepSeekBalance(deepseekApiKey) : null;

  return jsonResponse({
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
  });
});
