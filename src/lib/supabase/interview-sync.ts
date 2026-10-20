import type { Company, InterviewQuestion } from '@/types/interview';
import { supabase } from '@/lib/supabase/client';
import { useInterviewStore } from '@/store/useInterviewStore';

export interface InterviewSyncPayload {
  companies: Company[];
  favoriteQuestions: InterviewQuestion[];
}

interface InterviewSyncRow {
  user_id: string;
  payload: InterviewSyncPayload;
  updated_at: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizePayload(value: unknown): InterviewSyncPayload {
  if (!isRecord(value)) return { companies: [], favoriteQuestions: [] };
  return {
    companies: Array.isArray(value.companies) ? (value.companies as Company[]) : [],
    favoriteQuestions: Array.isArray(value.favoriteQuestions)
      ? (value.favoriteQuestions as InterviewQuestion[])
      : [],
  };
}

function isTableMissing(error: { code?: string; message?: string }): boolean {
  return error.code === 'PGRST205' ||
    (typeof error.message === 'string' && error.message.includes("Could not find the table 'public.interview_sync'"));
}

export async function fetchInterviewSync(userId: string): Promise<InterviewSyncPayload | null> {
  const { data, error } = await supabase
    .from('interview_sync')
    .select('payload')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    if (isTableMissing(error)) return null;
    throw new Error(error.message);
  }
  return data ? normalizePayload((data as Pick<InterviewSyncRow, 'payload'>).payload) : null;
}

export async function saveInterviewSync(userId: string, payload: InterviewSyncPayload): Promise<string | null> {
  const { data, error } = await supabase
    .from('interview_sync')
    .upsert({ user_id: userId, payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select('updated_at')
    .single();
  if (error) {
    if (isTableMissing(error)) return null;
    throw new Error(error.message);
  }
  return (data as Pick<InterviewSyncRow, 'updated_at'>).updated_at;
}

export function isInterviewSyncTableMissingError(error: unknown): boolean {
  if (error instanceof Error) return error.message.includes('interview_sync') || error.message.includes('PGRST205');
  return typeof error === 'object' && error !== null && 'code' in error &&
    isTableMissing(error as { code?: string; message?: string });
}

export function buildInterviewSyncPayload(): InterviewSyncPayload {
  const { companies, favoriteQuestions } = useInterviewStore.getState();
  return { companies, favoriteQuestions };
}

export function applyInterviewSyncPayload(payload: InterviewSyncPayload): void {
  useInterviewStore.setState({
    companies: payload.companies,
    favoriteQuestions: payload.favoriteQuestions,
  });
}
