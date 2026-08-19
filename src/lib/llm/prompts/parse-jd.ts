import { CANDIDATE_CONTEXT } from './candidate-context';

const PARSE_JD_SYSTEM_PROMPT = `你是校招岗位解析器。根据 JD 文本输出 JSON（不要 Markdown）。
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

export function buildParseJdMessages(input: {
  company?: string;
  jd_text: string;
  job_url?: string;
}) {
  const userPrompt = [
    input.company ? `公司名称提示：${input.company}` : '',
    input.job_url ? `岗位 URL：${input.job_url}` : '',
    'JD 文本：',
    input.jd_text.slice(0, 12000),
  ].filter(Boolean).join('\n');

  return [
    { role: 'system' as const, content: PARSE_JD_SYSTEM_PROMPT },
    { role: 'user' as const, content: userPrompt },
  ];
}

export function extractJsonFromLlm(text: string): unknown {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? text.match(/```\s*([\s\S]*?)```/)?.[1];
  const raw = (fenced ?? text).trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) {
    throw new Error('LLM 未返回有效 JSON');
  }
  return JSON.parse(raw.slice(start, end + 1));
}
