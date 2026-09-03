import { useEffect, useMemo, useRef, useState } from 'react';
import type { ApplicationStatus, CampusJobData, JobProgress } from '@/types/campus-job';
import {
  APPLICATION_STATUS_LABELS,
  STAGE_DETAIL_STATUSES,
} from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatStageScheduledAt } from './StageDetailEditor';

/** 待办/过期提醒覆盖的阶段（不含 Offer） */
const REMINDER_STATUSES: ApplicationStatus[] = STAGE_DETAIL_STATUSES.filter(
  (s) => s !== 'offer'
);

export interface StageReminderItem {
  key: string;
  jobId: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  link?: string;
  scheduledAt?: string;
  expired: boolean;
}

function parseStageTime(value?: string): number | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    const t = Date.parse(value.slice(0, 16));
    return Number.isNaN(t) ? null : t;
  }
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

export function collectStageReminders(
  jobs: CampusJobData[],
  getProgress: (jobId: string) => JobProgress | undefined,
  now = Date.now()
): StageReminderItem[] {
  const items: StageReminderItem[] = [];

  for (const job of jobs) {
    const progress = getProgress(job.id);
    if (!progress || progress.status === 'rejected') continue;
    if (!REMINDER_STATUSES.includes(progress.status)) continue;

    const detail = progress.stageDetails?.[progress.status];
    if (!detail?.link && !detail?.scheduledAt) continue;

    const timeMs = parseStageTime(detail.scheduledAt);
    // 有时间才参与过期/待办统计；仅有链接也进列表，算待办
    const expired = timeMs !== null && timeMs < now;

    items.push({
      key: `${job.id}-${progress.status}`,
      jobId: job.id,
      company: job.basic.company,
      position: job.basic.position,
      status: progress.status,
      link: detail.link,
      scheduledAt: detail.scheduledAt,
      expired,
    });
  }

  return items.sort((a, b) => {
    if (a.expired !== b.expired) return a.expired ? -1 : 1;
    const ta = parseStageTime(a.scheduledAt) ?? Number.MAX_SAFE_INTEGER;
    const tb = parseStageTime(b.scheduledAt) ?? Number.MAX_SAFE_INTEGER;
    if (ta !== tb) return ta - tb;
    return a.company.localeCompare(b.company, 'zh-CN');
  });
}

interface RaceChartRemindersProps {
  jobs: CampusJobData[];
  getProgress: (jobId: string) => JobProgress | undefined;
}

export function RaceChartReminders({ jobs, getProgress }: RaceChartRemindersProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const jobProgress = useCampusJobStore((s) => s.jobProgress);

  const items = useMemo(
    () => collectStageReminders(jobs, getProgress),
    [jobs, getProgress, jobProgress]
  );

  const expiredCount = items.filter((i) => i.expired).length;
  const todoCount = items.filter((i) => !i.expired).length;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative z-30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border-2 bg-white px-3 py-1.5 text-xs font-bold shadow-sm',
          'hover:bg-[#fafafa] transition-colors',
          open ? 'border-[#58CC02]' : 'border-[#e5e5e5]'
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-[#FF4B4B] tabular-nums">{expiredCount} 个已过期</span>
        <span className="text-ink-secondary">·</span>
        <span className="text-[#FF9600] tabular-nums">{todoCount} 个待办</span>
        <ChevronDown
          size={14}
          className={cn('text-ink-secondary transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-[min(100vw-2rem,360px)] max-h-72 overflow-y-auto rounded-xl border-2 border-[#e5e5e5] bg-white shadow-lg"
          role="listbox"
        >
          <div className="px-3 py-2 text-[10px] font-bold text-ink-secondary bg-[#fafafa] border-b border-[#e5e5e5]">
            未完成的测评 / 面试
          </div>
          <ul className="py-1">
            {items.map((item) => {
              const stageLabel = APPLICATION_STATUS_LABELS[item.status];
              return (
                <li
                  key={item.key}
                  className="px-3 py-2.5 border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-ink-primary min-w-0 leading-relaxed">
                      <span className="truncate inline">
                        {item.company}-{item.position}
                      </span>
                      <span className="text-ink-secondary font-normal"> | </span>
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[#1CB0F6] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {stageLabel}
                          <ExternalLink size={10} className="flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-ink-secondary">{stageLabel}</span>
                      )}
                    </p>
                    <span
                      className={cn(
                        'flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                        item.expired
                          ? 'bg-[#fff0f0] text-[#FF4B4B]'
                          : 'bg-[#fff8e6] text-[#FF9600]'
                      )}
                    >
                      {item.expired ? '已过期' : '待办'}
                    </span>
                  </div>
                  {item.scheduledAt && (
                    <p className="text-[10px] text-ink-secondary mt-1 tabular-nums">
                      {formatStageScheduledAt(item.scheduledAt)}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
