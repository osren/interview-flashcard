import fs from 'fs';
import path from 'path';

const root = path.resolve('src/pages/Campus/components');

function write(name, content) {
  fs.writeFileSync(path.join(root, name), content, 'utf8');
}

write('JobStatusPanel.tsx', `import { useState } from 'react';
import type { ApplicationStatus, CampusJobData } from '@/types/campus-job';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
} from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { formatDateTime, isSameCalendarDay } from '../utils';
import { X, Clock, ChevronRight, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface JobStatusPanelProps {
  job: CampusJobData;
  onClose: () => void;
}

export function JobStatusPanel({ job, onClose }: JobStatusPanelProps) {
  const { getProgress, setJobStatus, clearJobStatus } = useCampusJobStore();
  const progress = getProgress(job.id);
  const currentStatus = progress?.status;
  const [note, setNote] = useState('');

  const handleSelect = (status: ApplicationStatus) => {
    setJobStatus(job.id, status, note.trim() || undefined);
    setNote('');
  };

  const handleClearAll = () => {
    if (confirm('\\u786e\\u5b9a\\u6e05\\u9664\\u8be5\\u5c97\\u4f4d\\u7684\\u5168\\u90e8\\u8fdb\\u5ea6\\u8bb0\\u5f55\\u5417\\uff1f')) {
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
            aria-label="\\u5173\\u95ed"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div>
            <p className="text-sm font-bold text-ink-primary mb-1">\\u66f4\\u65b0\\u72b6\\u6001</p>
            <p className="text-xs text-ink-secondary mb-2">
              \\u518d\\u6b21\\u70b9\\u51fb\\u5f53\\u524d\\u72b6\\u6001\\u53ef\\u64a4\\u9500\\uff08\\u540c\\u4e00\\u5929\\u5185\\uff09\\uff1b\\u5207\\u6362\\u72b6\\u6001\\u4f1a\\u65b0\\u589e\\u8bb0\\u5f55
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[...APPLICATION_STATUS_ORDER, 'rejected' as ApplicationStatus].map((status) => (
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
                      \\u518d\\u6b21\\u70b9\\u51fb\\u64a4\\u9500
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-ink-primary block mb-1.5">
              \\u5907\\u6ce8\\uff08\\u53ef\\u9009\\uff09
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="\\u5907\\u6ce8\\u8bf4\\u660e / HR \\u53cd\\u9988"
              className="w-full px-3 py-2 rounded-xl border-2 border-[#e5e5e5] text-sm focus:outline-none focus:border-[#58CC02]"
            />
          </div>

          {progress && progress.statusHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                  <Clock size={14} />
                  \\u72b6\\u6001\\u65f6\\u95f4\\u7ebf
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-xs font-bold text-red-500 hover:underline"
                >
                  <Trash2 size={12} />
                  \\u6e05\\u9664\\u5168\\u90e8
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
                          {APPLICATION_STATUS_LABELS[entry.status]}
                        </span>
                        <span className="text-ink-secondary ml-2">{formatDateTime(entry.at)}</span>
                        {entry.note && (
                          <p className="text-ink-secondary mt-0.5 text-xs">{entry.note}</p>
                        )}
                      </div>
                      {canUndoEntry && (
                        <button
                          type="button"
                          onClick={() => setJobStatus(job.id, entry.status)}
                          className="flex items-center gap-0.5 text-[10px] font-bold text-ink-secondary hover:text-red-500 flex-shrink-0 px-1.5 py-1 rounded-lg hover:bg-red-50"
                          title="\\u64a4\\u9500\\u6b64\\u8bb0\\u5f55"
                        >
                          <RotateCcw size={12} />
                          \\u64a4\\u9500
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
`);

console.log('done');
