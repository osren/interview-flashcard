import { corsHeaders, jsonResponse, requireUser } from '../_shared/auth.ts';
import { CANDIDATE_CONTEXT } from '../_shared/candidate.ts';

const PARSE_PROMPT = `你是校招岗位解析器。根据 JD 文本输出 JSON（不要 Markdown）。
候选人背景：
${CANDIDATE_CONTEXT}

输出结构必须是：
{
  "basic": { "position": "", "company": "", "location": "" },
  "details": { "job_url": null, "company_logo": null, "salaryMin": null, "salaryMax": null },
  "extended": {
    "graduation_year": "2027",
    "recruitment_batch": "custom",
    "employment_type": "校招",
    "job_category": "frontend | agent_dev | ai_fullstack | ai_app | other",
    "jd_responsibilities": [],
    "jd_requirements": [],
    "jd_summary": "",
    "requirements_summary": "",
    "tech_stack": [],
    "education": "",
    "major": ""
  },
  "match": {
    "qualified": true,
    "category": "frontend | agent_dev | ai_fullstack | ai_app | other",
    "batch_type": "custom",
    "confidence": 0.0,
    "reason": ""
  }
}

规则：
- job_category 与 match.category 保持一致
- confidence 为 0-1
- qualified 结合候选人真实技能判断，不要因为缺少后端/算法就一律否决前端岗
- 字段缺失用空字符串 / 空数组 / null`;

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
      company?: string;
      jd_text?: string;
      job_url?: string;
    };
    const jdText = body.jd_text?.trim() ?? '';
    if (!jdText) {
      return jsonResponse({ error: 'jd_text is required' }, 400);
    }

    const userPrompt = [
      body.company ? `公司名称提示：${body.company}` : '',
      body.job_url ? `岗位 URL：${body.job_url}` : '',
      'JD 文本：',
      jdText.slice(0, 12000),
    ].filter(Boolean).join('\n');

    const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: PARSE_PROMPT },
          { role: 'user', content: userPrompt },
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
    const content = data.choices?.[0]?.message?.content ?? '';
    const parsed = extractJson(content);
    return jsonResponse({ ok: true, job: parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Parse failed';
    return jsonResponse({ error: message }, 500);
  }
});
