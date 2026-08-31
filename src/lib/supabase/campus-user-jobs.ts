import type { CampusJobData } from '@/types/campus-job';
import { supabase } from '@/lib/supabase/client';

interface CampusUserJobRow {
  user_id: string;
  job_id: string;
  job_data: CampusJobData;
  source: 'custom' | 'builtin';
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
    source: job.source === 'builtin' ? 'builtin' : 'custom',
  };
}

export async function fetchUserCampusJobs(userId: string): Promise<CampusJobData[]> {
  const { data, error } = await supabase
    .from('campus_user_jobs')
    .select('job_id, job_data, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const jobs: CampusJobData[] = [];
  for (const row of data ?? []) {
    const job = normalizeJobData((row as Pick<CampusUserJobRow, 'job_data'>).job_data);
    if (job) {
      jobs.push(job);
    }
  }

  return jobs;
}

export async function upsertUserCampusJobs(
  userId: string,
  jobs: CampusJobData[]
): Promise<void> {
  if (jobs.length === 0) {
    return;
  }

  const now = new Date().toISOString();
  const rows = jobs.map((job) => ({
    user_id: userId,
    job_id: job.id,
    job_data: job,
    source: job.source === 'builtin' ? 'builtin' : 'custom',
    updated_at: now,
  }));

  const { error } = await supabase
    .from('campus_user_jobs')
    .upsert(rows, { onConflict: 'user_id,job_id' });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteUserCampusJob(userId: string, jobId: string): Promise<void> {
  const { error } = await supabase
    .from('campus_user_jobs')
    .delete()
    .eq('user_id', userId)
    .eq('job_id', jobId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function syncUserCampusJobsToCloud(
  userId: string,
  jobs: CampusJobData[]
): Promise<void> {
  const remoteJobs = await fetchUserCampusJobs(userId);
  const remoteIds = new Set(remoteJobs.map((job) => job.id));
  const localIds = new Set(jobs.map((job) => job.id));

  const toDelete = [...remoteIds].filter((id) => !localIds.has(id));
  await Promise.all(toDelete.map((jobId) => deleteUserCampusJob(userId, jobId)));
  await upsertUserCampusJobs(userId, jobs);
}

export function mergeCustomJobs(
  localJobs: CampusJobData[],
  remoteJobs: CampusJobData[],
  legacyPayloadJobs: CampusJobData[] = []
): CampusJobData[] {
  const merged = new Map<string, CampusJobData>();

  for (const job of legacyPayloadJobs) {
    merged.set(job.id, job);
  }
  for (const job of remoteJobs) {
    merged.set(job.id, job);
  }
  for (const job of localJobs) {
    merged.set(job.id, job);
  }

  return [...merged.values()];
}
