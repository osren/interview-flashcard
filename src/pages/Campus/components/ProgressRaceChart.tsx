import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react';
import type {
  ApplicationStatus,
  CampusJobData,
  JobProgress,
  RejectReason,
  StageDetail,
} from '@/types/campus-job';
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  APPLICATION_STATUS_SHORT_LABELS,
  isStageDetailStatus,
} from '@/data/campus-jobs';
import { getFurthestProgressIndex } from '../utils';
import { RaceChartStatusSelect } from './RaceChartStatusSelect';
import { StageDetailEditor, StageDetailTooltip } from './StageDetailEditor';
import { cn } from '@/utils/cn';

interface ProgressRaceChartProps {
  jobs: CampusJobData[];
  getProgress: (
    jobId: string
  ) =>
    | {
        status: ApplicationStatus;
        statusHistory: { status: ApplicationStatus }[];
        rejectReason?: RejectReason;
        stageDetails?: JobProgress['stageDetails'];
      }
    | undefined;
}

const STATUS_COLUMNS = [...APPLICATION_STATUS_ORDER, 'rejected' as ApplicationStatus];
const ROW_HEIGHT = 68;
const LEFT_LABEL_WIDTH = 290;
const RIGHT_PADDING = 16;
const TOP_PADDING = 60;
const BOTTOM_PADDING = 32;
const CHART_WIDTH = 1080;
/** 上下多渲染几行，避免快速滚动时露出空白 */
const OVERSCAN = 4;

function truncateLabel(value: string, maxChars: number): string {
  return value.length > maxChars ? `${value.slice(0, maxChars)}…` : value;
}

function hasStageInfo(detail?: StageDetail): boolean {
  return Boolean(detail?.link || detail?.scheduledAt || detail?.completed);
}

export function ProgressRaceChart({ jobs, getProgress }: ProgressRaceChartProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    jobId: string;
    company: string;
    position: string;
    status: ApplicationStatus;
    detail?: StageDetail;
  } | null>(null);

  // —— 定高虚拟列表状态 ——
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(560);

  // 监听可视区高度（窗口缩放、Tab 切换都会变）
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight || 560);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 滚动事件用 rAF 节流，每帧最多更新一次 scrollTop
  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(el.scrollTop);
    });
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const handleDotEnter = useCallback((key: string) => {
    setHoveredKey(key);
  }, []);

  const handleDotLeave = useCallback((key: string) => {
    setHoveredKey((prev) => (prev === key ? null : prev));
  }, []);

  if (jobs.length === 0) {
    return (
      <div className="surface-panel p-12 text-center text-ink-secondary text-base">
        {'\u6682\u65e0\u5df2\u8bb0\u5f55\u8fdb\u5ea6\u7684\u5c97\u4f4d\uff0c\u8bf7\u5728\u300c\u79cb\u62db\u804c\u4f4d\u300d\u4e2d\u6807\u8bb0\u72b6\u6001'}
      </div>
    );
  }

  const svgWidth = CHART_WIDTH - LEFT_LABEL_WIDTH;
  const colWidth = (svgWidth - RIGHT_PADDING) / STATUS_COLUMNS.length;
  const totalHeight = TOP_PADDING + jobs.length * ROW_HEIGHT + BOTTOM_PADDING;

  // —— 虚拟窗口：只渲染 [startRow, endRow) 这几行 ——
  // 行 i 的中心点 y = TOP_PADDING + i*ROW_HEIGHT + ROW_HEIGHT/2
  // 反解：可见行 = floor((scrollTop - TOP_PADDING)/ROW_HEIGHT) 到 ceil((scrollTop - TOP_PADDING + viewportHeight)/ROW_HEIGHT)
  const startRow = Math.max(0, Math.floor((scrollTop - TOP_PADDING) / ROW_HEIGHT) - OVERSCAN);
  const endRow = Math.min(
    jobs.length,
    Math.ceil((scrollTop - TOP_PADDING + viewportHeight) / ROW_HEIGHT) + OVERSCAN
  );
  const visibleRows: number[] = [];
  for (let i = startRow; i < endRow; i += 1) visibleRows.push(i);

  return (
    <div className="surface-panel p-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ height: 'min(70vh, 640px)', overflowY: 'auto', overflowX: 'auto' }}
      >
        <div style={{ position: 'relative', width: CHART_WIDTH, height: totalHeight }}>
          {/* 吸顶表头：滚动时固定在可视区顶部 */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              height: TOP_PADDING,
              width: CHART_WIDTH,
              backgroundColor: '#ffffff',
            }}
          >
            {STATUS_COLUMNS.map((status, i) => (
              <div
                key={status}
                style={{
                  position: 'absolute',
                  left: LEFT_LABEL_WIDTH + i * colWidth + colWidth / 2,
                  top: 24,
                  transform: 'translateX(-50%)',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#6B7280',
                  whiteSpace: 'nowrap',
                }}
              >
                {APPLICATION_STATUS_SHORT_LABELS[status]}
              </div>
            ))}
          </div>

          {/* 主 SVG：列分隔线画全高，每个岗位的连线/圆点只画可视行 */}
          <svg
            width={svgWidth}
            height={totalHeight}
            style={{ position: 'absolute', left: LEFT_LABEL_WIDTH, top: 0 }}
            role="img"
            aria-label={'\u6c42\u804c\u8fdb\u5ea6\u7ade\u8d5b\u56fe'}
          >
            {STATUS_COLUMNS.map((status, i) => (
              <line
                key={status}
                x1={i * colWidth}
                y1={TOP_PADDING - 8}
                x2={i * colWidth}
                y2={totalHeight - BOTTOM_PADDING}
                stroke="#e5e5e5"
                strokeWidth={1}
              />
            ))}

            {visibleRows.map((rowIndex) => {
              const job = jobs[rowIndex];
              const progress = getProgress(job.id);
              if (!progress) return null;
              const status = progress.status;
              const history = progress.statusHistory;
              const y = TOP_PADDING + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
              const rowEnd =
                status === 'rejected'
                  ? getFurthestProgressIndex(status, history)
                  : APPLICATION_STATUS_ORDER.indexOf(status);
              const startX = colWidth / 2;
              const endX = rowEnd * colWidth + colWidth / 2;
              const color =
                status === 'rejected'
                  ? APPLICATION_STATUS_COLORS.rejected
                  : APPLICATION_STATUS_COLORS[status];

              return (
                <g key={job.id}>
                  <line
                    x1={startX}
                    y1={y}
                    x2={(STATUS_COLUMNS.length - 1) * colWidth + colWidth / 2}
                    y2={y}
                    stroke="#f0f0f0"
                    strokeWidth={4}
                    strokeLinecap="round"
                  />

                  {rowEnd >= 0 && (
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
                    if (i > rowEnd && status !== 'rejected') return null;
                    if (status === 'rejected' && i > rowEnd && colStatus !== 'rejected') {
                      return null;
                    }

                    const reached =
                      i <= rowEnd || (status === 'rejected' && colStatus === 'rejected');
                    const isRejectedStop = status === 'rejected' && colStatus === 'rejected';
                    if (!reached && !isRejectedStop) return null;

                    // 可编辑阶段的圆点用 HTML overlay 渲染，不在 SVG 里画
                    if (isStageDetailStatus(colStatus)) return null;

                    const cx = i * colWidth + colWidth / 2;
                    const dotColor = isRejectedStop
                      ? APPLICATION_STATUS_COLORS.rejected
                      : i === rowEnd
                        ? color
                        : APPLICATION_STATUS_COLORS[colStatus];

                    return (
                      <circle
                        key={`${job.id}-${colStatus}`}
                        cx={cx}
                        cy={y}
                        r={isRejectedStop ? 6 : i === rowEnd ? 5 : 3}
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

          {/* 左侧公司/职位标签：只渲染可视行 */}
          {visibleRows.map((rowIndex) => {
            const job = jobs[rowIndex];
            const progress = getProgress(job.id);
            if (!progress) return null;

            const title = `${job.basic.company} · ${job.basic.position}`;
            const labelContent = (
              <>
                <p className="font-bold text-[17px] text-ink-primary truncate leading-tight">
                  {truncateLabel(job.basic.company, 12)}
                </p>
                <p className="text-[16px] text-ink-secondary truncate leading-tight mt-0.5">
                  {truncateLabel(job.basic.position, 14)}
                </p>
              </>
            );

            return (
              <div
                key={job.id}
                style={{
                  position: 'absolute',
                  top: TOP_PADDING + rowIndex * ROW_HEIGHT,
                  left: 0,
                  width: LEFT_LABEL_WIDTH,
                  height: ROW_HEIGHT,
                }}
                className="flex items-center gap-2 px-2"
              >
                <div className="min-w-0 flex-1">
                  {job.details.job_url ? (
                    <a
                      href={job.details.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`打开招聘页：${title}`}
                      className="block hover:opacity-80"
                    >
                      {labelContent}
                    </a>
                  ) : (
                    labelContent
                  )}
                </div>
                <RaceChartStatusSelect
                  jobId={job.id}
                  status={progress.status}
                  rejectReason={progress.rejectReason}
                />
              </div>
            );
          })}

          {/* 阶段详情圆点（HTML overlay）：只渲染可视行 */}
          {visibleRows.map((rowIndex) => {
            const job = jobs[rowIndex];
            const progress = getProgress(job.id);
            if (!progress) return null;
            const status = progress.status;
            const history = progress.statusHistory;
            const y = TOP_PADDING + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
            const rowEnd =
              status === 'rejected'
                ? getFurthestProgressIndex(status, history)
                : APPLICATION_STATUS_ORDER.indexOf(status);
            const color =
              status === 'rejected'
                ? APPLICATION_STATUS_COLORS.rejected
                : APPLICATION_STATUS_COLORS[status];

            return STATUS_COLUMNS.map((colStatus, i) => {
              if (!isStageDetailStatus(colStatus)) return null;
              if (i > rowEnd) return null;

              const cx = LEFT_LABEL_WIDTH + i * colWidth + colWidth / 2;
              const isCurrent = i === rowEnd && status !== 'rejected';
              const detail = progress.stageDetails?.[colStatus];
              const filled = hasStageInfo(detail);
              const key = `${job.id}-${colStatus}`;
              const showTip = hoveredKey === key;
              const size = isCurrent || filled ? 12 : 8;
              const dotColor = isCurrent ? color : APPLICATION_STATUS_COLORS[colStatus];

              return (
                <div
                  key={key}
                  className={cn('absolute', showTip && 'z-50')}
                  style={{
                    left: cx,
                    top: y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => handleDotEnter(key)}
                  onMouseLeave={() => handleDotLeave(key)}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        jobId: job.id,
                        company: job.basic.company,
                        position: job.basic.position,
                        status: colStatus,
                        detail,
                      })
                    }
                    className={cn(
                      'rounded-full border-2 border-white shadow-sm transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#58CC02]',
                      filled &&
                        (detail?.completed
                          ? 'ring-2 ring-offset-1 ring-[#58CC02]/50'
                          : 'ring-2 ring-offset-1 ring-[#1CB0F6]/40')
                    )}
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: dotColor,
                    }}
                    title={`编辑${APPLICATION_STATUS_LABELS[colStatus]}链接与时间`}
                    aria-label={`编辑${APPLICATION_STATUS_LABELS[colStatus]}链接与时间`}
                  />
                  {showTip && (
                    <StageDetailTooltip
                      status={colStatus}
                      detail={detail}
                      placement={rowIndex === 0 ? 'bottom' : 'top'}
                    />
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>

      <div className={cn('flex flex-wrap gap-2 mt-2 px-2 text-xs text-ink-secondary')}>
        {STATUS_COLUMNS.map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: APPLICATION_STATUS_COLORS[s] }}
            />
            {APPLICATION_STATUS_SHORT_LABELS[s]}
          </span>
        ))}
        <span className="text-ink-secondary/80">· 悬停素质测评～Offer 圆点可查看链接/时间，点击可编辑</span>
      </div>

      {editing && (
        <StageDetailEditor
          jobId={editing.jobId}
          company={editing.company}
          position={editing.position}
          status={editing.status}
          detail={editing.detail}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
