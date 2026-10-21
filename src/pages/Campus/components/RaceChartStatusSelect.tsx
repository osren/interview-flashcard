import { ChevronDown } from 'lucide-react';
import type { ApplicationStatus, RejectReason } from '@/types/campus-job';
import {
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

const SELECT_COLOR = '#6B7280';

export function RaceChartStatusSelect({ jobId, status, rejectReason }: RaceChartStatusSelectProps) {
  const setJobStatus = useCampusJobStore((s) => s.setJobStatus);
  const currentLabel = formatApplicationStatusLabel(status, rejectReason);

  return (
    <div className="relative flex-shrink-0 w-7 h-7">
      <select
        value={encodeStatusValue(status, rejectReason)}
        onChange={(e) => {
          const { status: nextStatus, rejectReason: nextReason } = decodeStatusValue(e.target.value);
          setJobStatus(jobId, nextStatus, undefined, nextReason);
        }}
        onClick={(e) => e.stopPropagation()}
        title={`切换投递状态（当前：${currentLabel}）`}
        aria-label={`切换投递状态，当前 ${currentLabel}`}
        className={cn(
          'absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
        )}
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
      <div
        className="w-7 h-7 flex items-center justify-center rounded-lg border-2 pointer-events-none"
        style={{ borderColor: `${SELECT_COLOR}44`, color: SELECT_COLOR }}
        aria-hidden="true"
      >
        <ChevronDown size={14} strokeWidth={2.5} />
      </div>
    </div>
  );
}
