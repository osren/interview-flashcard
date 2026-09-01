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

const jobModuleLoaders = import.meta.glob('../../../docs/秋招岗位/**/*.json', {
  import: 'default',
}) as Record<string, () => Promise<RawJobJson>>;

function slugify(value: string): string {
  return value.replace(/[^\w\u4e00-\u9fff-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function buildJobId(company: string, position: string, location: string, disambiguator?: string): string {
  const base = `${slugify(company)}__${slugify(position)}__${slugify(location)}`;
  if (!disambiguator) {
    return base;
  }
  return `${base}__${slugify(disambiguator)}`;
}

function normalizeCategory(category: string): JobCategory {
  const allowed: JobCategory[] = ['frontend', 'agent_dev', 'ai_fullstack', 'ai_app', 'other'];
  return allowed.includes(category as JobCategory) ? (category as JobCategory) : 'other';
}

function normalizeJobs(entries: Array<[string, RawJobJson]>): CampusJobData[] {
  const usedIds = new Set<string>();

  return entries.map(([filePath, raw]) => {
    const fileStem = filePath.split(/[/\\]/).pop()?.replace(/\.json$/i, '') ?? '';
    const baseId = buildJobId(raw.basic.company, raw.basic.position, raw.basic.location);
    const id = usedIds.has(baseId)
      ? buildJobId(raw.basic.company, raw.basic.position, raw.basic.location, fileStem)
      : baseId;
    usedIds.add(id);
    const category = normalizeCategory(raw.match.category || raw.extended.job_category);
    const tier = getTierFromMatch(raw.match.qualified, raw.match.confidence);

    return {
      id,
      source: 'builtin' as const,
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

let cachedLocalJobs: CampusJobData[] | null = null;
let loadingPromise: Promise<CampusJobData[]> | null = null;

/** Lazy-load local JSON catalog (offline fallback). Cached after first load. */
export async function ensureLocalCampusCatalog(): Promise<CampusJobData[]> {
  if (cachedLocalJobs) return cachedLocalJobs;
  if (loadingPromise) return loadingPromise;

  loadingPromise = Promise.all(
    Object.entries(jobModuleLoaders).map(async ([path, loader]) => {
      const raw = await loader();
      return [path, raw] as [string, RawJobJson];
    })
  ).then((entries) => {
    cachedLocalJobs = normalizeJobs(entries);
    return cachedLocalJobs;
  });

  return loadingPromise;
}

/** Empty until ensureLocalCampusCatalog() resolves — avoids eager JSON in main bundle. */
export const localBuiltinCampusJobs: CampusJobData[] = [];

/** @deprecated Use store catalogJobs or getAllJobs(); kept for offline fallback init */
export const builtinCampusJobs = localBuiltinCampusJobs;

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
