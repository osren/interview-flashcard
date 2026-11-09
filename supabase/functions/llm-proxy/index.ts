import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  consumeUserQuota,
  createServiceClient,
  quotaExceededResponse,
} from '../_shared/quota.ts';
import {
  buildUpstreamPayload,
  forwardChatCompletion,
  type LlmProxyRequestBody,
} from '../_shared/llm.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      return jsonResponse({ error: 'LLM not configured' }, 500);
    }

    const body = (await req.json()) as LlmProxyRequestBody;
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonResponse({ error: 'messages is required' }, 400);
    }

    const admin = createServiceClient();
    const quotaResult = await consumeUserQuota(admin, user.id);
    if (!quotaResult.ok) {
      return quotaExceededResponse(quotaResult);
    }

    const payload = buildUpstreamPayload(body);
    const upstream = await forwardChatCompletion(payload, deepseekApiKey);

    if (!upstream.ok) {
      const detail = await upstream.text();
      return jsonResponse({ error: 'Upstream LLM error', detail }, upstream.status);
    }

    if (payload.stream) {
      return new Response(upstream.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const data = await upstream.json();
    return jsonResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: message }, 500);
  }
});
