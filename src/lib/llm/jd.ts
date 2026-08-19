import type { CustomJobInput, JobCategory } from '@/types/campus-job';
import { callLlmJson } from './call';
import { invokeEdgeFunction } from './invoke';
import { buildParseJdMessages, extractJsonFromLlm } from './prompts/parse-jd';
import type { FetchJdResult, ParsedJobPayload } from './parse-jd-types';

export type { FetchJdResult, ParsedJobPayload } from './parse-jd-types';

const CATEGORIES: JobCategory[] = ['frontend', 'agent_dev', 'ai_fullstack', 'ai_app', 'other'];

function asCategory(value: string | undefined): JobCategory {
  return CATEGORIES.includes(value as JobCategory) ? (value as JobCategory) : 'other';
}

export async function fetchJdFromUrl(url: string): Promise<FetchJdResult> {
  try {
    return await invokeEdgeFunction<FetchJdResult>('fetch-jd-url', { url });
  } catch (error) {
    const message = error instanceof Error ? error.message : '抓取失败';
    if (message.includes('未部署') || message.includes('NOT_FOUND') || message.includes('Failed to fetch')) {
      return {
        ok: false,
        error: 'URL 抓取服务未部署，请直接粘贴 JD 文本',
        fallback: 'paste',
      };
    }
    throw error;
  }
}

export async function parseJdText(input: {
  company?: string;
  jd_text: string;
  job_url?: string;
}): Promise<ParsedJobPayload> {
  const jdText = input.jd_text.trim();
  if (!jdText) {
    throw new Error('jd_text 不能为空');
  }

  const data = await callLlmJson<{
    choices?: Array<{ message?: { content?: string } }>;
  }>({
    model: 'deepseek-chat',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: buildParseJdMessages({ ...input, jd_text: jdText }),
  });

  const content = data.choices?.[0]?.message?.content ?? '';
  return extractJsonFromLlm(content) as ParsedJobPayload;
}

export function parsedJobToInput(
  parsed: ParsedJobPayload,
  fallback: { company?: string; job_url?: string }
): CustomJobInput {
  const company = parsed.basic?.company?.trim() || fallback.company?.trim() || '未命名公司';
  const position = parsed.basic?.position?.trim() || '未命名岗位';
  const location = parsed.basic?.location?.trim() || '未填写';
  const category = asCategory(parsed.match?.category || parsed.extended?.job_category);

  return {
    company,
    position,
    location,
    job_url: parsed.details?.job_url || fallback.job_url,
    job_category: category,
    jd_summary: parsed.extended?.jd_summary ?? '',
    requirements_summary: parsed.extended?.requirements_summary ?? '',
    tech_stack: parsed.extended?.tech_stack ?? [],
    jd_responsibilities: parsed.extended?.jd_responsibilities ?? [],
    jd_requirements: parsed.extended?.jd_requirements ?? [],
    education: parsed.extended?.education ?? '',
    major: parsed.extended?.major ?? '',
    qualified: parsed.match?.qualified ?? true,
    confidence: parsed.match?.confidence ?? 0.5,
    reason: parsed.match?.reason ?? 'AI 解析',
  };
}
