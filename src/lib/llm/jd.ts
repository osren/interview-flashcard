import type { CustomJobInput, JobCategory } from '@/types/campus-job';
import { invokeEdgeFunction } from './invoke';

export interface FetchJdResult {
  ok: boolean;
  text?: string;
  error?: string;
  fallback?: 'paste';
}

export interface ParsedJobPayload {
  basic?: {
    position?: string;
    company?: string;
    location?: string;
  };
  details?: {
    job_url?: string | null;
  };
  extended?: {
    job_category?: JobCategory | string;
    jd_responsibilities?: string[];
    jd_requirements?: string[];
    jd_summary?: string;
    requirements_summary?: string;
    tech_stack?: string[];
    education?: string;
    major?: string;
    graduation_year?: string;
    recruitment_batch?: string;
    employment_type?: string;
  };
  match?: {
    qualified?: boolean;
    category?: JobCategory | string;
    confidence?: number;
    reason?: string;
  };
}

const CATEGORIES: JobCategory[] = ['frontend', 'agent_dev', 'ai_fullstack', 'ai_app', 'other'];

function asCategory(value: string | undefined): JobCategory {
  return CATEGORIES.includes(value as JobCategory) ? (value as JobCategory) : 'other';
}

export async function fetchJdFromUrl(url: string): Promise<FetchJdResult> {
  return invokeEdgeFunction<FetchJdResult>('fetch-jd-url', { url });
}

export async function parseJdText(input: {
  company?: string;
  jd_text: string;
  job_url?: string;
}): Promise<ParsedJobPayload> {
  const result = await invokeEdgeFunction<{ ok: boolean; job: ParsedJobPayload }>('parse-jd', input);
  return result.job;
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
