import type {
  CampusJobData,
  CustomCompany,
  JobProgress,
} from '@/types/campus-job';
import { supabase } from '@/lib/supabase/client';

export interface CampusJobSyncPayload {
  customCompanies: CustomCompany[];
  customJobs: CampusJobData[];
  jobProgress: Record<string, JobProgress>;
  lastSelectedJobId: string | null;
}

interface CampusJobSyncRow {
  user_id: string;
  payload: CampusJobSyncPayload;
  updated_at: string;
}

const EMPTY_PAYLOAD: CampusJobSyncPayload = {
  customCompanies: [],
  customJobs: [],
  jobProgress: {},
  lastSelectedJobId: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizePayload(raw: unknown): CampusJobSyncPayload {
  if (!isRecord(raw)) {
    return { ...EMPTY_PAYLOAD };
  }

  return {
    customCompanies: Array.isArray(raw.customCompanies)
      ? (raw.customCompanies as CustomCompany[])
      : [],
    customJobs: Array.isArray(raw.customJobs) ? (raw.customJobs as CampusJobData[]) : [],
    jobProgress: isRecord(raw.jobProgress)
      ? (raw.jobProgress as Record<string, JobProgress>)
      : {},
    lastSelectedJobId:
      typeof raw.lastSelectedJobId === 'string' ? raw.lastSelectedJobId : null,
  };
}

function progressTimestamp(progress: JobProgress | undefined): number {
  if (!progress) return 0;
  const updatedAt = Date.parse(progress.updatedAt);
  if (!Number.isNaN(updatedAt)) return updatedAt;
  const lastEntry = progress.statusHistory[progress.statusHistory.length - 1];
  const entryAt = lastEntry ? Date.parse(lastEntry.at) : Number.NaN;
  return Number.isNaN(entryAt) ? 0 : entryAt;
}

export function mergeCampusJobPayload(
  local: CampusJobSyncPayload,
  remote: CampusJobSyncPayload | null
): CampusJobSyncPayload {
  if (!remote) {
    return local;
  }

  const jobProgress: Record<string, JobProgress> = { ...remote.jobProgress };
  for (const [jobId, localProgress] of Object.entries(local.jobProgress)) {
    const remoteProgress = jobProgress[jobId];
    if (
      !remoteProgress ||
      progressTimestamp(localProgress) > progressTimestamp(remoteProgress)
    ) {
      jobProgress[jobId] = localProgress;
    }
  }

  const customJobs = new Map<string, CampusJobData>();
  for (const job of remote.customJobs) {
    customJobs.set(job.id, job);
  }
  for (const job of local.customJobs) {
    customJobs.set(job.id, job);
  }

  const customCompanies = new Map<string, CustomCompany>();
  for (const company of remote.customCompanies) {
    customCompanies.set(company.id, company);
  }
  for (const company of local.customCompanies) {
    customCompanies.set(company.id, company);
  }

  return {
    customCompanies: [...customCompanies.values()],
    customJobs: [...customJobs.values()],
    jobProgress,
    lastSelectedJobId: remote.lastSelectedJobId ?? local.lastSelectedJobId,
  };
}

export async function fetchCampusJobSync(
  userId: string
): Promise<CampusJobSyncPayload | null> {
  const { data, error } = await supabase
    .from('campus_job_sync')
    .select('payload')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return normalizePayload((data as Pick<CampusJobSyncRow, 'payload'>).payload);
}

export async function saveCampusJobSync(
  userId: string,
  payload: CampusJobSyncPayload
): Promise<string> {
  const { data, error } = await supabase
    .from('campus_job_sync')
    .upsert(
      {
        user_id: userId,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('updated_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Pick<CampusJobSyncRow, 'updated_at'>).updated_at;
}
