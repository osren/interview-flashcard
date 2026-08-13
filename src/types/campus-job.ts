export type ApplicationStatus =
  | 'applied'
  | 'screen'
  | 'interview'
  | 'offer'
  | 'rejected';

export type JobCategory = 'frontend' | 'agent_dev' | 'ai_fullstack' | 'ai_app' | 'other';

export type JobTier = 'S' | 'A' | 'B' | 'edge' | 'skip';

export interface CampusJobMatch {
  qualified: boolean;
  category: JobCategory;
  batch_type: string;
  confidence: number;
  reason: string;
}

export interface CampusJobData {
  id: string;
  source: 'builtin' | 'custom';
  basic: {
    position: string;
    company: string;
    location: string;
  };
  details: {
    job_url: string | null;
    company_logo: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
  };
  extended: {
    graduation_year: string;
    recruitment_batch: string;
    employment_type: string;
    job_category: JobCategory;
    jd_responsibilities: string[];
    jd_requirements: string[];
    jd_summary: string;
    requirements_summary: string;
    tech_stack: string[];
    education: string;
    major: string;
  };
  match: CampusJobMatch;
  tier: JobTier;
}

export interface StatusHistoryEntry {
  id: string;
  status: ApplicationStatus;
  at: string;
  note?: string;
}

export interface JobProgress {
  jobId: string;
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  updatedAt: string;
}

export interface CustomCompany {
  id: string;
  name: string;
  color: string;
}

export interface CustomJobInput {
  company: string;
  position: string;
  location: string;
  job_url?: string;
  job_category?: JobCategory;
  jd_summary?: string;
  requirements_summary?: string;
  tech_stack?: string[];
  qualified?: boolean;
  confidence?: number;
  reason?: string;
}

export type CampusTab = 'dashboard' | 'jobs' | 'progress';
