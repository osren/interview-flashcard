import { useEffect, useRef, useState } from 'react';
import type { ApplicationStatus, CampusJobData, RejectReason } from '@/types/campus-job';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  REJECT_REASON_LABELS,
  REJECT_REASON_ORDER,
  formatApplicationStatusLabel,
} from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { formatDateTime, isSameCalendarDay } from '../utils';
import { X, Clock, ChevronRight, RotateCcw, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { campusStrings } from '../strings';

interface JobStatusPanelProps {
  job: CampusJobData;
  onClose: () => void;
}

export function JobStatusPanel({ job, onClose }: JobStatusPanelProps) {
  const { getProgress, setJobStatus, clearJobStatus } = useCampusJobStore();
  const progress = getProgress(job.id);
  const currentStatus = progress?.status;
  const currentRejectReason = progress?.rejectReason;
  const [note, setNote] = useState('');
  const [rejectMenuOpen, setRejectMenuOpen] = useState(false);
  const rejectMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rejectMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (rejectMenuRef.current && !rejectMenuRef.current.contains(event.target as Node)) {
        setRejectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [rejectMenuOpen]);

  const handleSelect = (status: ApplicationStatus, rejectReason?: RejectReason) => {
    if (status === 'rejected' && !rejectReason) {
      setRejectMenuOpen((open) => !open);
      return;
    }
    setJobStatus(job.id, status, note.trim() || undefined, rejectReason);
    setNote('');
    setRejectMenuOpen(false);
  };

  const handleClearAll = () => {
    if (confirm('确定清除该岗位的全部进度记录吗？')) {
      clearJobStatus(job.id);
      onClose();
    }
  };

  const canUndoCurrent =
    currentStatus &&
    progress &&
    progress.statusHistory.length > 0 &&
    (() => {
      const last = progress.statusHistory[progress.statusHistory.length - 1];
      return last.status === currentStatus && isSameCalendarDay(last.at, new Date().toISOString());
    })();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex items-start justify-between p-4 border-b border-[#e5e5e5]">
          <div>
            <p className="text-sm font-bold text-[#58CC02]">{job.basic.company}</p>
            <h3 className="font-extrabold text-lg text-ink-primary">{job.basic.position}</h3>
            <p className="text-sm text-ink-secondary">{job.basic.location}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#f7f7f7] text-ink-secondary"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div>
            <p className="text-sm font-bold text-ink-primary mb-1">更新状态</p>
            <p className="text-xs text-ink-secondary mb-2">
              再次点击当前状态可撤销（同一天内）；「已终止」需选择具体原因，便于后续统计
            </p>
            <div className="grid grid-cols-2 gap-2">
              {APPLICATION_STATUS_ORDER.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleSelect(status)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all text-left',
                    currentStatus === status
                      ? 'border-current text-white'
                      : 'border-[#e5e5e5] hover:border-current/30 text-ink-primary'
                  )}
                  style={
                    currentStatus === status
                      ? {
                          backgroundColor: APPLICATION_STATUS_COLORS[status],
                          borderColor: APPLICATION_STATUS_COLORS[status],
                        }
                      : undefined
                  }
                >
                  {APPLICATION_STATUS_LABELS[status]}
                  {currentStatus === status && canUndoCurrent && (
                    <span className="block text-[10px] font-normal opacity-90 mt-0.5">
                      再次点击撤销
                    </span>
                  )}
                </button>
              ))}

              <div className="relative col-span-1" ref={rejectMenuRef}>
                <button
                  type="button"
                  onClick={() => handleSelect('rejected')}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all text-left flex items-center justify-between gap-1',
                    currentStatus === 'rejected'
                      ? 'border-current text-white'
                      : 'border-[#e5e5e5] hover:border-current/30 text-ink-primary',
                    rejectMenuOpen && currentStatus !== 'rejected' && 'border-[#FF4B4B]'
                  )}
                  style={
                    currentStatus === 'rejected'
                      ? {
                          backgroundColor: APPLICATION_STATUS_COLORS.rejected,
                          borderColor: APPLICATION_STATUS_COLORS.rejected,
                        }
                      : undefined
                  }
                >
                  <span className="min-w-0 truncate">
                    {currentStatus === 'rejected'
                      ? formatApplicationStatusLabel('rejected', currentRejectReason)
                      : '已终止'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn('flex-shrink-0 transition-transform', rejectMenuOpen && 'rotate-180')}
                  />
                </button>

                {rejectMenuOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-10 rounded-xl border-2 border-[#e5e5e5] bg-white shadow-lg overflow-hidden">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-ink-secondary bg-[#fafafa] border-b border-[#e5e5e5]">
                      选择终止原因
                    </div>
                    {REJECT_REASON_ORDER.map((reason) => {
                      const selected =
                        currentStatus === 'rejected' && currentRejectReason === reason;
                      return (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => handleSelect('rejected', reason)}
                          className={cn(
                            'w-full text-left px-3 py-2.5 text-sm font-bold transition-colors',
                            selected
                              ? 'bg-[#FF4B4B] text-white'
                              : 'text-ink-primary hover:bg-[#fff0f0]'
                          )}
                        >
                          {REJECT_REASON_LABELS[reason]}
                          {selected && canUndoCurrent && (
                            <span className="block text-[10px] font-normal opacity-90 mt-0.5">
                              再次点击撤销
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-ink-primary block mb-1.5">
              备注（可选）
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={campusStrings.notePlaceholder}
              className="w-full px-3 py-2 rounded-xl border-2 border-[#e5e5e5] text-sm focus:outline-none focus:border-[#58CC02]"
            />
          </div>

          {progress && progress.statusHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                  <Clock size={14} />
                  状态时间线
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-xs font-bold text-red-500 hover:underline"
                >
                  <Trash2 size={12} />
                  清除全部
                </button>
              </div>
              <div className="space-y-2">
                {[...progress.statusHistory].reverse().map((entry, i) => {
                  const isLatest = i === 0;
                  const canUndoEntry =
                    isLatest && isSameCalendarDay(entry.at, new Date().toISOString());

                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-2 text-sm p-2.5 rounded-xl bg-[#f7f7f7]"
                    >
                      <ChevronRight
                        size={14}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: APPLICATION_STATUS_COLORS[entry.status] }}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-bold"
                          style={{ color: APPLICATION_STATUS_COLORS[entry.status] }}
                        >
                          {formatApplicationStatusLabel(entry.status, entry.rejectReason)}
                        </span>
                        <span className="text-ink-secondary ml-2">{formatDateTime(entry.at)}</span>
                        {entry.note && (
                          <p className="text-ink-secondary mt-0.5 text-xs">{entry.note}</p>
                        )}
                      </div>
                      {canUndoEntry && (
                        <button
                          type="button"
                          onClick={() => setJobStatus(job.id, entry.status, undefined, entry.rejectReason)}
                          className="flex items-center gap-0.5 text-[10px] font-bold text-ink-secondary hover:text-red-500 flex-shrink-0 px-1.5 py-1 rounded-lg hover:bg-red-50"
                          title="撤销此记录"
                        >
                          <RotateCcw size={12} />
                          撤销
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
