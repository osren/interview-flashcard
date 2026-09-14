import { corsHeaders, jsonResponse, requireUser } from '../_shared/auth.ts';
import { CANDIDATE_CONTEXT } from '../_shared/candidate.ts';
import {
  consumeUserQuota,
  createServiceClient,
  quotaExceededResponse,
} from '../_shared/quota.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const auth = await requireUser(req);
  if (auth.error) return auth.error;

  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!deepseekApiKey) {
    return jsonResponse({ error: 'DEEPSEEK_API_KEY not configured' }, 500);
  }

  let body: { prompt: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { prompt } = body;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return jsonResponse({ error: 'Missing or empty prompt' }, 400);
  }

  const supabase = createServiceClient();
  const quotaCheck = await consumeUserQuota(supabase, auth.userId, 1);
  if (!quotaCheck.ok) return quotaExceededResponse(quotaCheck.remaining);

  try {
    const systemPrompt = `你是一名资深面试教练，擅长帮助候选人准备面试自我介绍。

候选人背景信息：
${CANDIDATE_CONTEXT}

请根据简历内容生成一份专业、自然、流畅的面试自我介绍口述稿。`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepseek API error:', response.status, errorText);
      return jsonResponse(
        { error: `Deepseek API error: ${response.status}` },
        response.status
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return jsonResponse({ error: 'No content returned from LLM' }, 500);
    }

    return jsonResponse({ content }, 200);
  } catch (error) {
    console.error('generate-intro error:', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});
