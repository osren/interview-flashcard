import type { ApplicationStatus, RejectReason, StatusHistoryEntry } from '@/types/campus-job';
import { isRejectReason } from '@/data/campus-jobs/const';

export function isSameCalendarDay(isoA: string, isoB: string): boolean {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function deriveCurrentStatus(
  history: StatusHistoryEntry[]
): ApplicationStatus | null {
  if (history.length === 0) return null;
  return history[history.length - 1].status;
}

export function deriveCurrentRejectReason(
  history: StatusHistoryEntry[]
): RejectReason | undefined {
  if (history.length === 0) return undefined;
  const last = history[history.length - 1];
  if (last.status !== 'rejected') return undefined;
  return isRejectReason(last.rejectReason) ? last.rejectReason : undefined;
}

export function createStatusEntry(
  status: ApplicationStatus,
  at: string,
  note?: string,
  rejectReason?: RejectReason
): StatusHistoryEntry {
  return {
    id: crypto.randomUUID(),
    status,
    at,
    note,
    ...(status === 'rejected' && rejectReason ? { rejectReason } : {}),
  };
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}
