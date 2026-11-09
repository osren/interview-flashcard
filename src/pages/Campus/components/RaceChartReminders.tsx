import { useEffect, useMemo, useRef, useState } from 'react';
import type { CampusJobData, JobProgress } from '@/types/campus-job';
import { APPLICATION_STATUS_LABELS } from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  collectStageReminders,
  type StageReminderKind,
} from '@/utils/stage-reminders';
import { formatStageScheduledAt } from './StageDetailEditor';

interface RaceChartRemindersProps {
  jobs: CampusJobData[];
  getProgress: (jobId: string) => JobProgress | undefined;
}

const KIND_BADGE: Record<StageReminderKind, { label: string; className: string }> = {
  expired: { label: '已过期', className: 'bg-[#fff0f0] text-[#FF4B4B]' },
  todo: { label: '待办', className: 'bg-[#fff8e6] text-[#FF9600]' },
  completed: { label: '已完成', className: 'bg-[#eefbf0] text-[#58CC02]' },
};

export function RaceChartReminders({ jobs, getProgress }: RaceChartRemindersProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const jobProgress = useCampusJobStore((s) => s.jobProgress);

  const items = useMemo(
    () => collectStageReminders(jobs, getProgress),
    [jobs, getProgress, jobProgress]
  );

  const expiredCount = items.filter((i) => i.kind === 'expired').length;
  const todoCount = items.filter((i) => i.kind === 'todo').length;
  const completedCount = items.filter((i) => i.kind === 'completed').length;

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
        <span className="text-ink-secondary">·</span>
        <span className="text-[#58CC02] tabular-nums">{completedCount} 个已完成</span>
        <ChevronDown
          size={14}
          className={cn('text-ink-secondary transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-[min(100vw-2rem,380px)] max-h-72 overflow-y-auto rounded-xl border-2 border-[#e5e5e5] bg-white shadow-lg"
          role="listbox"
        >
          <div className="px-3 py-2 text-[10px] font-bold text-ink-secondary bg-[#fafafa] border-b border-[#e5e5e5]">
            测评 / 面试提醒（已终止岗位不计入）
          </div>
          <ul className="py-1">
            {items.map((item) => {
              const stageLabel = APPLICATION_STATUS_LABELS[item.status];
              const badge = KIND_BADGE[item.kind];
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
                        badge.className
                      )}
                    >
                      {badge.label}
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
