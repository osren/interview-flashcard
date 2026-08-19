import type { ApplicationStatus, CampusJobData } from '@/types/campus-job';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
} from '@/data/campus-jobs';
import { getFurthestProgressIndex } from '../utils';

interface ProgressRaceChartProps {
  jobs: CampusJobData[];
  getProgress: (jobId: string) => { status: ApplicationStatus; statusHistory: { status: ApplicationStatus }[] } | undefined;
}

const STATUS_COLUMNS = [...APPLICATION_STATUS_ORDER, 'rejected' as ApplicationStatus];
const ROW_HEIGHT = 40;
const LEFT_LABEL_WIDTH = 240;
const RIGHT_PADDING = 24;
const TOP_PADDING = 52;
const BOTTOM_PADDING = 32;

export function ProgressRaceChart({ jobs, getProgress }: ProgressRaceChartProps) {
  if (jobs.length === 0) {
    return (
      <div className="surface-panel p-12 text-center text-ink-secondary text-base">
        {'\u6682\u65e0\u5df2\u8bb0\u5f55\u8fdb\u5ea6\u7684\u5c97\u4f4d\uff0c\u8bf7\u5728\u300c\u79cb\u62db\u804c\u4f4d\u300d\u4e2d\u6807\u8bb0\u72b6\u6001'}
      </div>
    );
  }

  const chartWidth = 720;
  const colWidth = (chartWidth - LEFT_LABEL_WIDTH - RIGHT_PADDING) / STATUS_COLUMNS.length;
  const chartHeight = TOP_PADDING + jobs.length * ROW_HEIGHT + BOTTOM_PADDING;

  return (
    <div className="surface-panel p-4 overflow-x-auto">
      <svg
        width={chartWidth}
        height={chartHeight}
        className="min-w-[720px]"
        role="img"
        aria-label={'\u6c42\u804c\u8fdb\u5ea6\u7ade\u8d5b\u56fe'}
      >
        {STATUS_COLUMNS.map((status, i) => {
          const x = LEFT_LABEL_WIDTH + i * colWidth + colWidth / 2;
          return (
            <g key={status}>
              <text
                x={x}
                y={28}
                textAnchor="middle"
                className="fill-ink-secondary text-xs font-bold"
              >
                {APPLICATION_STATUS_LABELS[status]}
              </text>
              <line
                x1={LEFT_LABEL_WIDTH + i * colWidth}
                y1={TOP_PADDING - 8}
                x2={LEFT_LABEL_WIDTH + i * colWidth}
                y2={chartHeight - BOTTOM_PADDING}
                stroke="#e5e5e5"
                strokeWidth={1}
              />
            </g>
          );
        })}

        {jobs.map((job, rowIndex) => {
          const progress = getProgress(job.id);
          if (!progress) return null;
          const status = progress.status;
          const history = progress.statusHistory;
          const y = TOP_PADDING + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
          const endIndex =
            status === 'rejected'
              ? getFurthestProgressIndex(status, history)
              : APPLICATION_STATUS_ORDER.indexOf(status);
          const startX = LEFT_LABEL_WIDTH + colWidth / 2;
          const endX = LEFT_LABEL_WIDTH + endIndex * colWidth + colWidth / 2;
          const color =
            status === 'rejected'
              ? APPLICATION_STATUS_COLORS.rejected
              : APPLICATION_STATUS_COLORS[status];

          const label = (
            <>
              <text x={8} y={y + 4} className="fill-ink-primary text-xs font-semibold">
                {job.basic.company}
              </text>
              <text x={8} y={y + 18} className="fill-ink-secondary text-[11px]">
                {job.basic.position.length > 14
                  ? `${job.basic.position.slice(0, 14)}…`
                  : job.basic.position}
              </text>
            </>
          );

          return (
            <g key={job.id}>
              {job.details.job_url ? (
                <a
                  href={job.details.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:opacity-80"
                >
                  <title>{`打开招聘页：${job.basic.company} · ${job.basic.position}`}</title>
                  <rect
                    x={0}
                    y={y - ROW_HEIGHT / 2 + 2}
                    width={LEFT_LABEL_WIDTH - 8}
                    height={ROW_HEIGHT - 4}
                    fill="transparent"
                  />
                  {label}
                </a>
              ) : (
                label
              )}

              <line
                x1={startX}
                y1={y}
                x2={LEFT_LABEL_WIDTH + (STATUS_COLUMNS.length - 1) * colWidth + colWidth / 2}
                y2={y}
                stroke="#f0f0f0"
                strokeWidth={4}
                strokeLinecap="round"
              />

              {endIndex >= 0 && (
                <line
                  x1={startX}
                  y1={y}
                  x2={Math.max(endX, startX)}
                  y2={y}
                  stroke={color}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              )}

              {STATUS_COLUMNS.map((colStatus, i) => {
                if (i > endIndex && status !== 'rejected') return null;
                if (status === 'rejected' && i > endIndex && colStatus !== 'rejected') return null;

                const cx = LEFT_LABEL_WIDTH + i * colWidth + colWidth / 2;
                const reached = i <= endIndex || (status === 'rejected' && colStatus === 'rejected');
                const isRejectedStop = status === 'rejected' && colStatus === 'rejected';

                if (!reached && !isRejectedStop) return null;

                const dotColor = isRejectedStop
                  ? APPLICATION_STATUS_COLORS.rejected
                  : i === endIndex
                    ? color
                    : APPLICATION_STATUS_COLORS[colStatus];

                return (
                  <circle
                    key={`${job.id}-${colStatus}`}
                    cx={cx}
                    cy={y}
                    r={isRejectedStop ? 6 : i === endIndex ? 5 : 3}
                    fill={dotColor}
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-3 mt-2 px-2 text-sm text-ink-secondary">
        {STATUS_COLUMNS.map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: APPLICATION_STATUS_COLORS[s] }}
            />
            {APPLICATION_STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
