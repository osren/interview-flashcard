import type { ApplicationStatus } from '@/types/campus-job';
import { APPLICATION_STATUS_ORDER } from '@/data/campus-jobs';

export function getFurthestProgressIndex(
  status: ApplicationStatus,
  statusHistory: { status: ApplicationStatus }[]
): number {
  if (status === 'rejected') {
    let max = 0;
    for (const entry of statusHistory) {
      if (entry.status === 'rejected') continue;
      const normalized =
        (entry.status as string) === 'saved' ? 'applied' : entry.status;
      const idx = APPLICATION_STATUS_ORDER.indexOf(normalized);
      if (idx >= 0) max = Math.max(max, idx);
    }
    return max;
  }
  const idx = APPLICATION_STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export {
  isSameCalendarDay,
  deriveCurrentStatus,
  deriveCurrentRejectReason,
  createStatusEntry,
  formatDateTime,
  formatDate,
} from '@/utils/campus-job-status';
