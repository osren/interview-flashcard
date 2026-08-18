import { corsHeaders, jsonResponse, requireUser } from '../_shared/auth.ts';
import { CANDIDATE_CONTEXT } from '../_shared/candidate.ts';

function extractJson(text: string): unknown {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? text.match(/```\s*([\s\S]*?)```/)?.[1];
  const raw = (fenced ?? text).trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('LLM did not return JSON');
  return JSON.parse(raw.slice(start, end + 1));
}

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
    return jsonResponse({ error: 'LLM not configured' }, 500);
  }

  try {
    const body = (await req.json()) as {
      resume_markdown?: string;
      jd_text?: string;
      company?: string;
      position?: string;
    };

    const resume = body.resume_markdown?.trim() ?? '';
    const jd = body.jd_text?.trim() ?? '';
    if (!resume || !jd) {
      return jsonResponse({ error: 'resume_markdown and jd_text are required' }, 400);
    }

    const system = `你是简历优化助手。只改表述、关键词与顺序，禁止捏造经历、公司、数字或技能。
候选人背景（事实边界）：
${CANDIDATE_CONTEXT}

只输出 JSON：
{
  "optimized_markdown": "完整 Markdown 简历",
  "changes_summary": ["改动1", "改动2"]
}`;

    const user = [
      body.company ? `目标公司：${body.company}` : '',
      body.position ? `目标岗位：${body.position}` : '',
      'JD：',
      jd.slice(0, 8000),
      '当前简历 Markdown：',
      resume.slice(0, 12000),
    ].filter(Boolean).join('\n');

    const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return jsonResponse({ error: 'Upstream LLM error', detail }, upstream.status);
    }

    const data = await upstream.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const parsed = extractJson(data.choices?.[0]?.message?.content ?? '') as {
      optimized_markdown?: string;
      changes_summary?: string[];
    };

    return jsonResponse({
      optimized_markdown: parsed.optimized_markdown ?? '',
      changes_summary: parsed.changes_summary ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Optimize failed';
    return jsonResponse({ error: message }, 500);
  }
});
