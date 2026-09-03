import { useEffect, useRef, useState } from 'react';
import type { ApplicationStatus, StageDetail } from '@/types/campus-job';
import {
  APPLICATION_STATUS_LABELS,
  getStageDetailFieldLabels,
} from '@/data/campus-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';
import { ExternalLink, X } from 'lucide-react';

interface StageDetailEditorProps {
  jobId: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  detail?: StageDetail;
  onClose: () => void;
}

function toDatetimeLocalValue(value?: string): string {
  if (!value) return '';
  // already datetime-local shaped
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function StageDetailEditor({
  jobId,
  company,
  position,
  status,
  detail,
  onClose,
}: StageDetailEditorProps) {
  const setStageDetail = useCampusJobStore((s) => s.setStageDetail);
  const labels = getStageDetailFieldLabels(status);
  const [link, setLink] = useState(detail?.link ?? '');
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocalValue(detail?.scheduledAt));
  const linkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    linkRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = () => {
    let normalizedLink = link.trim();
    if (normalizedLink && !/^https?:\/\//i.test(normalizedLink)) {
      normalizedLink = `https://${normalizedLink}`;
    }
    setStageDetail(jobId, status, {
      link: normalizedLink || undefined,
      scheduledAt: scheduledAt.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div
        className="bg-white rounded-2xl border-2 border-[#e5e5e5] w-full max-w-md shadow-xl overflow-hidden"
        role="dialog"
        aria-labelledby="stage-detail-title"
      >
        <div className="flex items-start justify-between p-4 border-b border-[#e5e5e5]">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#58CC02] truncate">{company}</p>
            <h3 id="stage-detail-title" className="font-extrabold text-lg text-ink-primary">
              {APPLICATION_STATUS_LABELS[status]}
            </h3>
            <p className="text-sm text-ink-secondary truncate">{position}</p>
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

        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm font-bold text-ink-primary block mb-1.5">{labels.link}</label>
            <input
              ref={linkRef}
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border-2 border-[#e5e5e5] text-sm focus:outline-none focus:border-[#58CC02]"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-ink-primary block mb-1.5">{labels.time}</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-[#e5e5e5] text-sm focus:outline-none focus:border-[#58CC02]"
            />
          </div>
          <p className="text-xs text-ink-secondary">留空并保存可清除该阶段信息</p>
        </div>

        <div className="p-4 pt-0 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#58CC02] text-white text-sm font-bold hover:opacity-90"
          >
            保存
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border-2 border-[#e5e5e5] text-sm font-bold text-ink-secondary"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

export function formatStageScheduledAt(value?: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    const [date, time] = value.slice(0, 16).split('T');
    return `${date} ${time}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface StageDetailTooltipProps {
  status: ApplicationStatus;
  detail?: StageDetail;
}

export function StageDetailTooltip({ status, detail }: StageDetailTooltipProps) {
  const labels = getStageDetailFieldLabels(status);
  const hasLink = Boolean(detail?.link);
  const hasTime = Boolean(detail?.scheduledAt);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full z-20 w-max max-w-[220px] pb-2">
      <div className="rounded-xl border-2 border-[#e5e5e5] bg-white px-3 py-2 shadow-lg text-left">
        <p className="text-[10px] font-bold text-ink-secondary mb-1">
          {APPLICATION_STATUS_LABELS[status]}
        </p>
        {hasLink ? (
          <a
            href={detail!.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1CB0F6] hover:underline"
          >
            <ExternalLink size={11} className="flex-shrink-0" />
            {labels.link}
          </a>
        ) : (
          <p className="text-xs text-ink-secondary">{labels.link}：未填写</p>
        )}
        <p className="text-xs text-ink-primary mt-1">
          <span className="text-ink-secondary">{labels.time}：</span>
          {hasTime ? formatStageScheduledAt(detail!.scheduledAt) : '未填写'}
        </p>
        {!hasLink && (
          <p className="text-[10px] text-ink-secondary mt-1.5">点击圆点可编辑</p>
        )}
      </div>
    </div>
  );
}
