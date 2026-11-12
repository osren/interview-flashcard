import type { Company, InterviewQuestion, InterviewResumeSource } from '@/types/interview';
import { supabase } from '@/lib/supabase/client';
import { useInterviewStore } from '@/store/useInterviewStore';

export interface InterviewSyncPayload {
  companies: Company[];
  favoriteQuestions: InterviewQuestion[];
  /** 生成面经时注入的简历来源，null 表示跟随简历模块默认口径 */
  aiResumeSource: InterviewResumeSource | null;
}

interface InterviewSyncRow {
  user_id: string;
  payload: InterviewSyncPayload;
  updated_at: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeResumeSource(value: unknown): InterviewResumeSource | null {
  if (!isRecord(value)) return null;
  const kind = value.kind;
  const id = value.id;
  if ((kind !== 'pdf' && kind !== 'markdown') || typeof id !== 'string' || !id) return null;
  return { kind, id };
}

function normalizePayload(value: unknown): InterviewSyncPayload {
  if (!isRecord(value)) return { companies: [], favoriteQuestions: [], aiResumeSource: null };
  return {
    companies: Array.isArray(value.companies) ? (value.companies as Company[]) : [],
    favoriteQuestions: Array.isArray(value.favoriteQuestions)
      ? (value.favoriteQuestions as InterviewQuestion[])
      : [],
    aiResumeSource: normalizeResumeSource(value.aiResumeSource),
  };
}

function isTableMissing(error: { code?: string; message?: string }): boolean {
  return error.code === 'PGRST205' ||
    (typeof error.message === 'string' && error.message.includes("Could not find the table 'public.interview_sync'"));
}

export async function fetchInterviewSync(userId: string): Promise<{ payload: InterviewSyncPayload; updatedAt: string } | null> {
  const { data, error } = await supabase
    .from('interview_sync')
    .select('payload, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    if (isTableMissing(error)) return null;
    throw new Error(error.message);
  }
  return data ? {
    payload: normalizePayload((data as Pick<InterviewSyncRow, 'payload'>).payload),
    updatedAt: (data as Pick<InterviewSyncRow, 'updated_at'>).updated_at,
  } : null;
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
  const { companies, favoriteQuestions, aiResumeSource } = useInterviewStore.getState();
  return { companies, favoriteQuestions, aiResumeSource };
}

export function applyInterviewSyncPayload(payload: InterviewSyncPayload): void {
  useInterviewStore.setState({
    companies: payload.companies,
    favoriteQuestions: payload.favoriteQuestions,
    aiResumeSource: payload.aiResumeSource,
  });
}
