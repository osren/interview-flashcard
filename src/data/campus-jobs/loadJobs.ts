import type { CampusJobData, JobCategory } from '@/types/campus-job';
import { getTierFromMatch } from './const';

interface RawJobJson {
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
    job_category: string;
    jd_responsibilities: string[];
    jd_requirements: string[];
    jd_summary: string;
    requirements_summary: string;
    tech_stack: string[];
    education: string;
    major: string;
  };
  match: {
    qualified: boolean;
    category: string;
    batch_type: string;
    confidence: number;
    reason: string;
  };
}

const jobModules = import.meta.glob('../../../docs/秋招岗位/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, RawJobJson>;

function slugify(value: string): string {
  return value.replace(/[^\w\u4e00-\u9fff-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function buildJobId(company: string, position: string, location: string): string {
  return `${slugify(company)}__${slugify(position)}__${slugify(location)}`;
}

function normalizeCategory(category: string): JobCategory {
  const allowed: JobCategory[] = ['frontend', 'agent_dev', 'ai_fullstack', 'ai_app', 'other'];
  return allowed.includes(category as JobCategory) ? (category as JobCategory) : 'other';
}

function loadBuiltinJobs(): CampusJobData[] {
  return Object.entries(jobModules).map(([filePath, raw]) => {
    const id = buildJobId(raw.basic.company, raw.basic.position, raw.basic.location);
    const category = normalizeCategory(raw.match.category || raw.extended.job_category);
    const tier = getTierFromMatch(raw.match.qualified, raw.match.confidence);

    return {
      id,
      source: 'builtin',
      basic: raw.basic,
      details: raw.details,
      extended: {
        ...raw.extended,
        job_category: category,
      },
      match: {
        ...raw.match,
        category,
      },
      tier,
    };
  });
}

export const builtinCampusJobs = loadBuiltinJobs();

export function getJobsByCompany(jobs: CampusJobData[]): Map<string, CampusJobData[]> {
  const map = new Map<string, CampusJobData[]>();
  for (const job of jobs) {
    const list = map.get(job.basic.company) ?? [];
    list.push(job);
    map.set(job.basic.company, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => b.match.confidence - a.match.confidence);
  }
  return map;
}

export { buildJobId };
