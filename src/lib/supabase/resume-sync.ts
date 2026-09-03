import type { MarkdownResume, Resume, ResumeSyncPayload } from '@/store/useResumeStore';
import {
  DEFAULT_INTRO_SCRIPT,
  RESUME_PRIMARY_ID,
  defaultPrimaryMarkdown,
  useResumeStore,
} from '@/store/useResumeStore';
import { supabase } from '@/lib/supabase/client';

export type { ResumeSyncPayload };

interface ResumeSyncRow {
  user_id: string;
  payload: ResumeSyncPayload;
  updated_at: string;
}

const EMPTY_PAYLOAD: ResumeSyncPayload = {
  resumes: [],
  introScript: DEFAULT_INTRO_SCRIPT,
  markdownResumes: [defaultPrimaryMarkdown],
  primaryResumeId: RESUME_PRIMARY_ID,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeResume(raw: unknown): Resume | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  if (typeof raw.data !== 'string' || typeof raw.uploadTime !== 'number') return null;
  return {
    id: raw.id,
    name: raw.name,
    data: raw.data,
    uploadTime: raw.uploadTime,
  };
}

function normalizeMarkdownResume(raw: unknown): MarkdownResume | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== 'string' || typeof raw.title !== 'string') return null;
  if (typeof raw.content !== 'string' || typeof raw.createdAt !== 'number') return null;
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    createdAt: raw.createdAt,
    ...(typeof raw.sourceResumeId === 'string' ? { sourceResumeId: raw.sourceResumeId } : {}),
    ...(typeof raw.targetJobId === 'string' ? { targetJobId: raw.targetJobId } : {}),
    ...(typeof raw.jdSnapshot === 'string' ? { jdSnapshot: raw.jdSnapshot } : {}),
  };
}

function normalizePayload(raw: unknown): ResumeSyncPayload {
  if (!isRecord(raw)) return { ...EMPTY_PAYLOAD };

  const resumes = Array.isArray(raw.resumes)
    ? raw.resumes.map(normalizeResume).filter((item): item is Resume => item !== null)
    : [];

  const markdownResumes = Array.isArray(raw.markdownResumes)
    ? raw.markdownResumes
        .map(normalizeMarkdownResume)
        .filter((item): item is MarkdownResume => item !== null)
    : [defaultPrimaryMarkdown];

  const hasPrimary = markdownResumes.some((item) => item.id === RESUME_PRIMARY_ID);
  const mergedMarkdown = hasPrimary
    ? markdownResumes
    : [defaultPrimaryMarkdown, ...markdownResumes];

  const primaryResumeId =
    typeof raw.primaryResumeId === 'string' &&
    mergedMarkdown.some((item) => item.id === raw.primaryResumeId)
      ? raw.primaryResumeId
      : RESUME_PRIMARY_ID;

  return {
    resumes,
    introScript: typeof raw.introScript === 'string' ? raw.introScript : DEFAULT_INTRO_SCRIPT,
    markdownResumes: mergedMarkdown,
    primaryResumeId,
  };
}

function mergeResumes(local: Resume[], remote: Resume[]): Resume[] {
  const map = new Map<string, Resume>();
  for (const resume of remote) map.set(resume.id, resume);
  for (const resume of local) {
    const existing = map.get(resume.id);
    if (!existing || resume.uploadTime >= existing.uploadTime) {
      map.set(resume.id, resume);
    }
  }
  return [...map.values()];
}

function mergeMarkdownResumes(
  local: MarkdownResume[],
  remote: MarkdownResume[]
): MarkdownResume[] {
  const map = new Map<string, MarkdownResume>();
  for (const resume of remote) map.set(resume.id, resume);
  for (const resume of local) map.set(resume.id, resume);
  if (!map.has(RESUME_PRIMARY_ID)) {
    map.set(RESUME_PRIMARY_ID, defaultPrimaryMarkdown);
  }
  return [...map.values()];
}

function mergeIntroScript(local: string, remote: string): string {
  const localEdited = local.trim() !== DEFAULT_INTRO_SCRIPT.trim();
  const remoteEdited = remote.trim() !== DEFAULT_INTRO_SCRIPT.trim();
  if (localEdited && remoteEdited) {
    return local.length >= remote.length ? local : remote;
  }
  if (localEdited) return local;
  if (remoteEdited) return remote;
  return local;
}

function mergePrimaryResumeId(
  local: string,
  remote: string,
  markdownResumes: MarkdownResume[]
): string {
  const ids = new Set(markdownResumes.map((item) => item.id));
  if (ids.has(local)) return local;
  if (ids.has(remote)) return remote;
  return RESUME_PRIMARY_ID;
}

export function mergeResumePayload(
  local: ResumeSyncPayload,
  remote: ResumeSyncPayload | null
): ResumeSyncPayload {
  if (!remote) return local;

  const markdownResumes = mergeMarkdownResumes(local.markdownResumes, remote.markdownResumes);

  return {
    resumes: mergeResumes(local.resumes, remote.resumes),
    introScript: mergeIntroScript(local.introScript, remote.introScript),
    markdownResumes,
    primaryResumeId: mergePrimaryResumeId(
      local.primaryResumeId,
      remote.primaryResumeId,
      markdownResumes
    ),
  };
}

function isSupabaseTableMissingError(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'PGRST205' ||
    (typeof error.message === 'string' &&
      error.message.includes("Could not find the table 'public.resume_sync'"))
  );
}

export async function fetchResumeSync(userId: string): Promise<ResumeSyncPayload | null> {
  const { data, error } = await supabase
    .from('resume_sync')
    .select('payload')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (isSupabaseTableMissingError(error)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  return normalizePayload((data as Pick<ResumeSyncRow, 'payload'>).payload);
}

export async function saveResumeSync(
  userId: string,
  payload: ResumeSyncPayload
): Promise<string | null> {
  const { data, error } = await supabase
    .from('resume_sync')
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
    if (isSupabaseTableMissingError(error)) return null;
    throw new Error(error.message);
  }

  return (data as Pick<ResumeSyncRow, 'updated_at'>).updated_at;
}

export function isResumeSyncTableMissingError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('resume_sync') || error.message.includes('PGRST205');
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return isSupabaseTableMissingError(error as { code?: string; message?: string });
  }
  return false;
}

export function buildResumeSyncPayload(): ResumeSyncPayload {
  return useResumeStore.getState().getSyncPayload();
}

export function applyResumeSyncPayload(payload: ResumeSyncPayload): void {
  useResumeStore.getState().importSyncedState(payload);
}
