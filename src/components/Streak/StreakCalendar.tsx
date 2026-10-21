import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, Check, Cloud, CloudOff } from 'lucide-react';
import { useStreakStore } from '@/store/useStreakStore';
import { useLearningSyncContext } from '@/hooks/useLearningSync';
import {
  buildMonthCalendar,
  buildCurrentWeekDays,
  getMonthLabel,
  WEEKDAY_LABELS_MON_FIRST,
} from '@/utils/streak';
import type { CalendarDay } from '@/types/streak';
import { cn } from '@/utils/cn';

const WEEKDAY_LABELS_SUN_FIRST = ['日', '一', '二', '三', '四', '五', '六'];

type CalendarViewMode = 'week' | 'month';

interface StreakCalendarProps {
  className?: string;
}

function DayCell({ day, size = 'sm' }: { day: CalendarDay; size?: 'sm' | 'md' }) {
  const cellSize = size === 'md' ? 'w-9 h-9' : 'w-7 h-7';
  const iconSize = size === 'md' ? 14 : 12;
  const textSize = size === 'md' ? 'text-xs' : 'text-[10px]';

  return (
    <div
      className={cn('flex items-center justify-center', size === 'md' ? 'h-9' : 'h-7')}
      title={day.isCheckedIn ? `${day.dateKey} 已打卡` : day.dateKey}
    >
      <div
        className={cn(
          cellSize,
          'rounded-lg flex items-center justify-center border transition-all',
          day.isCheckedIn
            ? 'bg-[#58CC02] border-[#58CC02] border-b-2 border-b-[#46A302] text-white'
            : day.isFuture
              ? 'bg-[#fafafa] border-[#f0f0f0] text-[#e5e5e5]'
              : 'bg-white border-[#e5e5e5] text-[#afafaf]',
          day.isToday && !day.isCheckedIn && 'border-[#FF9600] ring-1 ring-[#FF9600]/40'
        )}
      >
        {day.isCheckedIn ? (
          <Check size={iconSize} strokeWidth={3} />
        ) : (
          <span className={cn(textSize, 'font-extrabold leading-none')}>
            {day.date.getDate()}
          </span>
        )}
      </div>
    </div>
  );
}

export function StreakCalendar({ className }: StreakCalendarProps) {
  const checkInDates = useStreakStore((state) => state.checkInDates);
  const streak = useStreakStore((state) => state.getStreak());
  const hasCheckedInToday = useStreakStore((state) => state.hasCheckedInToday());
  const { isLoggedIn, isConfigured, status, cloudUnavailable } = useLearningSyncContext();

  const now = new Date();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const weekDays = useMemo(
    () => buildCurrentWeekDays(checkInDates),
    [checkInDates]
  );

  const monthDays = useMemo(
    () => buildMonthCalendar(viewYear, viewMonth, checkInDates),
    [viewYear, viewMonth, checkInDates]
  );

  const checkedDaysThisWeek = useMemo(
    () => weekDays.filter((day) => day.isCheckedIn).length,
    [weekDays]
  );

  const checkedDaysThisMonth = useMemo(
    () => monthDays.filter((day) => day.isCurrentMonth && day.isCheckedIn).length,
    [monthDays]
  );

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    const isCurrentView =
      viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isCurrentView) return;

    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const canGoNextMonth =
    viewYear < now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  const weekRangeLabel = useMemo(() => {
    const start = weekDays[0]?.date;
    const end = weekDays[weekDays.length - 1]?.date;
    if (!start || !end) return '最近 7 天';
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${fmt(start)} - ${fmt(end)}`;
  }, [weekDays]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className={cn('surface-panel p-4 h-full flex flex-col', className)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex flex-col items-center justify-center border-b-[3px] flex-shrink-0',
              streak > 0 ? 'bg-[#FF9600] border-[#E08600]' : 'bg-[#e5e5e5] border-[#d0d0d0]'
            )}
          >
            <Flame
              size={14}
              className={cn(streak > 0 ? 'text-white' : 'text-[#afafaf]')}
              fill={streak > 0 ? 'currentColor' : 'none'}
            />
            <span
              className={cn(
                'text-sm font-extrabold leading-none',
                streak > 0 ? 'text-white' : 'text-[#afafaf]'
              )}
            >
              {streak}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-[#3c3c3c]">学习连胜</h2>
            <p className="text-xs font-semibold text-[#777777] mt-0.5 truncate">
              {hasCheckedInToday ? '今日已打卡' : '标记学习状态即可打卡'}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-extrabold text-[#58CC02]">
            {viewMode === 'week' ? checkedDaysThisWeek : checkedDaysThisMonth}
          </div>
          <div className="text-[10px] font-bold text-[#afafaf]">
            {viewMode === 'week' ? '本周打卡' : '本月打卡'}
          </div>
        </div>
      </div>

      {isConfigured && (
        <p className="text-[10px] font-bold text-[#afafaf] mb-2 flex items-center gap-1">
          {isLoggedIn ? (
            <>
              <Cloud
                size={10}
                className={
                  status === 'error'
                    ? 'text-[#FF4B4B]'
                    : cloudUnavailable || status === 'local_only'
                      ? 'text-[#FFC800]'
                      : 'text-[#58CC02]'
                }
              />
              {status === 'syncing' || status === 'loading'
                ? '同步中…'
                : status === 'error'
                  ? '同步失败，已保存本地'
                  : cloudUnavailable || status === 'local_only'
                    ? '打卡与学习进度已存本地（云端表待创建）'
                    : '已登录，跨设备自动同步'}
            </>
          ) : (
            <>
              <CloudOff size={10} />
              登录后可跨设备同步
            </>
          )}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mb-2">
        {viewMode === 'week' ? (
          <span className="text-sm font-extrabold text-[#3c3c3c] flex-1">
            本周
            <span className="text-xs font-semibold text-[#afafaf] ml-1.5">
              {weekRangeLabel}
            </span>
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={goPrevMonth}
              className="p-1 rounded-lg text-[#777777] hover:bg-[#f7f7f7] transition-colors"
              aria-label="上一月"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-extrabold text-[#3c3c3c] flex-1 text-center">
              {getMonthLabel(viewYear, viewMonth)}
            </span>
            <button
              type="button"
              onClick={goNextMonth}
              disabled={!canGoNextMonth}
              className={cn(
                'p-1 rounded-lg transition-colors',
                canGoNextMonth
                  ? 'text-[#777777] hover:bg-[#f7f7f7]'
                  : 'text-[#e5e5e5] cursor-not-allowed'
              )}
              aria-label="下一月"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        <div className="flex rounded-lg border-2 border-[#e5e5e5] p-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={cn(
              'px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-colors',
              viewMode === 'week'
                ? 'bg-[#58CC02] text-white'
                : 'text-[#777777] hover:bg-[#f7f7f7]'
            )}
          >
            周报
          </button>
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={cn(
              'px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-colors',
              viewMode === 'month'
                ? 'bg-[#58CC02] text-white'
                : 'text-[#777777] hover:bg-[#f7f7f7]'
            )}
          >
            月报
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS_MON_FIRST.map((label) => (
              <div
                key={label}
                className="text-center text-[10px] font-extrabold text-[#afafaf]"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 flex-1 content-start">
            {weekDays.map((day) => (
              <div key={day.dateKey} className="flex flex-col items-center gap-1">
                <DayCell day={day} size="md" />
                {day.isToday && (
                  <span className="text-[9px] font-bold text-[#FF9600]">今天</span>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAY_LABELS_SUN_FIRST.map((label) => (
              <div
                key={label}
                className="text-center text-[10px] font-extrabold text-[#afafaf]"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 flex-1 content-start">
            {monthDays.map((day) => {
              if (!day.isCurrentMonth) {
                return <div key={day.dateKey} className="h-7" aria-hidden />;
              }
              return <DayCell key={day.dateKey} day={day} />;
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
