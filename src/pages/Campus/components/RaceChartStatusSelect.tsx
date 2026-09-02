import type { ApplicationStatus, RejectReason } from '@/types/campus-job';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  REJECT_REASON_LABELS,
  REJECT_REASON_ORDER,
  formatApplicationStatusLabel,
  isRejectReason,
} from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { cn } from '@/utils/cn';

interface RaceChartStatusSelectProps {
  jobId: string;
  status: ApplicationStatus;
  rejectReason?: RejectReason;
}

function encodeStatusValue(status: ApplicationStatus, rejectReason?: RejectReason): string {
  if (status === 'rejected' && rejectReason) {
    return `rejected:${rejectReason}`;
  }
  return status;
}

function decodeStatusValue(value: string): { status: ApplicationStatus; rejectReason?: RejectReason } {
  if (value.startsWith('rejected:')) {
    const reason = value.slice('rejected:'.length);
    return {
      status: 'rejected',
      rejectReason: isRejectReason(reason) ? reason : undefined,
    };
  }
  return { status: value as ApplicationStatus };
}

export function RaceChartStatusSelect({ jobId, status, rejectReason }: RaceChartStatusSelectProps) {
  const setJobStatus = useCampusJobStore((s) => s.setJobStatus);
  const color = APPLICATION_STATUS_COLORS[status];

  return (
    <select
      value={encodeStatusValue(status, rejectReason)}
      onChange={(e) => {
        const { status: nextStatus, rejectReason: nextReason } = decodeStatusValue(e.target.value);
        setJobStatus(jobId, nextStatus, undefined, nextReason);
      }}
      onClick={(e) => e.stopPropagation()}
      title="切换投递状态"
      aria-label="切换投递状态"
      className={cn(
        'flex-shrink-0 max-w-[108px] rounded-lg border-2 bg-white px-1.5 py-1',
        'text-[11px] font-bold leading-tight cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[color:var(--status-color)]'
      )}
      style={{
        color,
        borderColor: `${color}66`,
        ['--status-color' as string]: color,
      }}
    >
      {APPLICATION_STATUS_ORDER.map((optionStatus) => (
        <option key={optionStatus} value={optionStatus}>
          {APPLICATION_STATUS_LABELS[optionStatus]}
        </option>
      ))}
      <optgroup label="已终止">
        {REJECT_REASON_ORDER.map((reason) => (
          <option key={reason} value={`rejected:${reason}`}>
            {REJECT_REASON_LABELS[reason]}
          </option>
        ))}
      </optgroup>
      {status === 'rejected' && !rejectReason && (
        <option value="rejected">{formatApplicationStatusLabel('rejected')}</option>
      )}
    </select>
  );
}
