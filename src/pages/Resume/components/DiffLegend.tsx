import { cn } from '@/utils/cn';

interface DiffLegendProps {
  className?: string;
}

/**
 * 顶部色卡图例：标识删除/新增/未改动 三类片段。
 */
export function DiffLegend({ className }: DiffLegendProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 text-xs text-[#4b4b4b]',
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm bg-[#fde2e2] ring-1 ring-[#f5b5b5]" />
        删除段（左侧可见）
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm bg-[#dcfce7] ring-1 ring-[#86efac]" />
        新增段（右侧可见）
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm bg-[#eef2ff] ring-1 ring-[#c7d2fe]" />
        未改动
      </span>
    </div>
  );
}
