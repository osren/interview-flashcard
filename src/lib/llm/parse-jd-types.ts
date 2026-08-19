import type { JobCategory } from '@/types/campus-job';

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
