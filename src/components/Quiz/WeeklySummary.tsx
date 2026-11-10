import { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { masteryLabel } from '@/lib/quiz/mastery';
import type { WeeklyReport } from '@/lib/quiz/report';
import { cn } from '@/utils/cn';

interface WeeklySummaryProps {
  report: WeeklyReport;
  /** 点某个薄弱考点，跳到对应卡片 */
  onOpenPoint: (cardId: string) => void;
}

export function WeeklySummary({ report, onOpenPoint }: WeeklySummaryProps) {
  const [open, setOpen] = useState(false);

  // 这周没练、也没有可以指出的薄弱点，就不占位置
  if (report.attempts === 0 && report.weakest.length === 0) return null;

  const deltaColor =
    report.delta > 0 ? '#58CC02' : report.delta < 0 ? '#FF4B4B' : '#9CA3AF';
  const deltaText = report.delta > 0 ? `+${report.delta}` : `${report.delta}`;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <TrendingUp size={16} className="text-gray-500 dark:text-gray-300" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-xs font-bold text-gray-800 dark:text-white">本周小结</span>
          <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {report.attempts === 0
              ? '这周还没练过题，抽一轮就有数据了'
              : `${report.attempts} 题次 · 掌握度 ${report.startRatio}% → ${report.ratio}%`}
            {report.attempts > 0 && (
              <span className="ml-1 font-bold" style={{ color: deltaColor }}>
                {deltaText}
              </span>
            )}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/40 px-2 py-2 text-center">
              <div className="text-base font-black text-gray-900 dark:text-white">
                {report.attempts}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">题次</div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/40 px-2 py-2 text-center">
              <div className="text-base font-black text-gray-900 dark:text-white">
                {report.activeDays}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">活跃天</div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/40 px-2 py-2 text-center">
              <div className="text-base font-black text-gray-900 dark:text-white">
                {report.attempts > 0 ? `${report.accuracy}%` : '—'}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">本周正确率</div>
            </div>
          </div>

          {report.weakest.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                最该回头看的考点
              </div>
              <div className="space-y-1.5">
                {report.weakest.map((point) => (
                  <button
                    key={point.cardId}
                    onClick={() => onOpenPoint(point.cardId)}
                    className="w-full flex items-start gap-2 rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2 text-left hover:border-[#58CC02] transition-colors"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs text-gray-800 dark:text-gray-100 leading-relaxed">
                        {point.point}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">
                        {point.wrongCount > 0 ? `本周错 ${point.wrongCount} 次` : '还没答对过'} ·{' '}
                        {masteryLabel(point.strength)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
            掌握度由作答记录回放而来，只统计当前收藏的题
          </div>
        </div>
      )}
    </div>
  );
}
