import type { CampusJobData } from '@/types/campus-job';
import { supabase } from '@/lib/supabase/client';

interface CampusJobCatalogRow {
  id: string;
  job_data: CampusJobData;
  is_active: boolean;
  updated_at: string;
}

function normalizeJobData(raw: unknown): CampusJobData | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const job = raw as CampusJobData;
  if (typeof job.id !== 'string' || typeof job.basic !== 'object' || job.basic === null) {
    return null;
  }

  return {
    ...job,
    source: 'builtin',
  };
}

export async function fetchCampusJobCatalog(): Promise<CampusJobData[]> {
  const { data, error } = await supabase
    .from('campus_job_catalog')
    .select('id, job_data, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const jobs: CampusJobData[] = [];
  for (const row of data ?? []) {
    const job = normalizeJobData((row as Pick<CampusJobCatalogRow, 'job_data'>).job_data);
    if (job) {
      jobs.push({ ...job, id: (row as Pick<CampusJobCatalogRow, 'id'>).id });
    }
  }

  jobs.sort((a, b) => b.match.confidence - a.match.confidence);
  return jobs;
}
