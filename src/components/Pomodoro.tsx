import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw, X } from 'lucide-react';
import { usePomodoroStore } from '@/store';
import { cn } from '@/utils/cn';

const COLLAPSED_SIZE = 52;
const EXPANDED_SIZE = 128;
const POMODORO_POSITION_KEY = 'floating-pomodoro-position';

interface FloatingPosition {
  x: number;
  y: number;
}

function clampPosition(position: FloatingPosition, expanded: boolean): FloatingPosition {
  const width = expanded ? EXPANDED_SIZE : COLLAPSED_SIZE;
  const height = expanded ? 210 : COLLAPSED_SIZE;
  return {
    x: Math.max(8, Math.min(position.x, window.innerWidth - width - 8)),
    y: Math.max(8, Math.min(position.y, window.innerHeight - height - 8)),
  };
}

function initialFloatingPosition(): FloatingPosition {
  if (typeof window === 'undefined') return { x: 16, y: 100 };
  try {
    const saved = localStorage.getItem(POMODORO_POSITION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as FloatingPosition;
      if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) return clampPosition(parsed, false);
    }
  } catch {
    // Ignore unavailable or malformed position data.
  }
  const desktop = window.matchMedia('(min-width: 1024px)').matches;
  return desktop
    ? { x: 264, y: 96 }
    : clampPosition({ x: window.innerWidth - COLLAPSED_SIZE - 16, y: window.innerHeight - 220 }, false);
}

function TomatoStem({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C10.5 4 10 6 10 7c-2 0-4 2-4 4 0 3 2 5 4 7 1 1 2 2 2 4h4c0-2 1-3 2-4 2-2 4-4 4-7 0-2-2-4-4-4 0-1-.5-3-2-5z" />
    </svg>
  );
}

function TomatoTimerFace({
  size,
  minutes,
  seconds,
  progress,
  isBreak,
  showTime,
}: {
  size: number;
  minutes: number;
  seconds: number;
  progress: number;
  isBreak: boolean;
  showTime: boolean;
}) {
  const stemOffset = size * 0.08;
  const timeScale = size >= EXPANDED_SIZE ? 1 : 0.65;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 z-10',
          isBreak ? 'text-emerald-500' : 'text-emerald-600'
        )}
        style={{ top: -stemOffset }}
      >
        <TomatoStem />
      </div>

      <div
        className={cn(
          'relative w-full h-full rounded-full shadow-lg transition-colors duration-500',
          isBreak
            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
            : 'bg-gradient-to-br from-red-400 to-red-600'
        )}
      >
        <div
          className="absolute bg-white/30 rounded-full blur-sm"
          style={{ top: size * 0.12, left: size * 0.18, width: size * 0.28, height: size * 0.2 }}
        />

        {showTime && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                'font-mono font-bold leading-none',
                isBreak ? 'text-emerald-50' : 'text-red-50'
              )}
              style={{ fontSize: size * 0.22 * timeScale }}
            >
              {String(minutes).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'font-mono leading-none',
                isBreak ? 'text-emerald-100' : 'text-red-100'
              )}
              style={{ fontSize: size * 0.16 * timeScale }}
            >
              {String(seconds).padStart(2, '0')}
            </span>
          </div>
        )}

        {!showTime && (
          <div className="absolute inset-0 flex items-center justify-center text-2xl select-none">
            🍅
          </div>
        )}

        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={isBreak ? '#10b981' : '#ef4444'}
            strokeWidth="4"
            strokeDasharray={`${progress * 289} 289`}
            strokeLinecap="round"
            className="transition-all duration-300"
            opacity="0.45"
          />
        </svg>
      </div>
    </div>
  );
}

export function FloatingPomodoro() {
  const [position, setPosition] = useState<FloatingPosition>(initialFloatingPosition);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const {
    timeLeft,
    isRunning,
    isBreak,
    isSessionActive,
    workDuration,
    breakDuration,
    start,
    pause,
    cancel,
    restart,
    tick,
  } = usePomodoroStore();

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = isBreak ? breakDuration : workDuration;
  const progress = 1 - timeLeft / totalDuration;
  const isExpanded = isSessionActive;
  const size = isExpanded ? EXPANDED_SIZE : COLLAPSED_SIZE;
  const controlsFitToRight = position.x + 320 <= window.innerWidth - 8;

  useEffect(() => {
      setPosition((current) => clampPosition(current, isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    const handleResize = () => setPosition((current) => clampPosition(current, isExpanded));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const handleMainClick = () => {
    if (isSessionActive) {
      if (isRunning) {
        pause();
      } else {
        start();
      }
      return;
    }
    start();
  };

  const handleDragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(deltaX, deltaY) < 5) return;
    drag.moved = true;
    setPosition(clampPosition({ x: drag.originX + deltaX, y: drag.originY + deltaY }, isExpanded));
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) {
      suppressClickRef.current = true;
      const finalPosition = clampPosition({
        x: drag.originX + event.clientX - drag.startX,
        y: drag.originY + event.clientY - drag.startY,
      }, isExpanded);
      setPosition(finalPosition);
      try { localStorage.setItem(POMODORO_POSITION_KEY, JSON.stringify(finalPosition)); } catch { /* Ignore unavailable storage. */ }
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
    dragRef.current = null;
  };

  return (
    <div className={`fixed z-50 flex flex-col gap-2 ${controlsFitToRight ? 'items-start' : 'items-end'}`} style={{ left: position.x, top: position.y, touchAction: 'none' }}>
      <div className="relative">
        {isExpanded && (
          <button
            type="button"
            onClick={cancel}
            className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-[#777777] text-white flex items-center justify-center hover:bg-[#555555] shadow-md transition-colors"
            title="取消番茄钟"
            aria-label="取消番茄钟"
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}

        <motion.button
          type="button"
          onClick={(event) => {
            if (suppressClickRef.current) {
              event.preventDefault();
              suppressClickRef.current = false;
              return;
            }
            handleMainClick();
          }}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          layout
          animate={{ width: size, height: size }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className={cn(
            'relative cursor-grab active:cursor-grabbing touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58CC02] focus-visible:ring-offset-2 rounded-full',
            isRunning && !isBreak && 'animate-pulse'
          )}
          title={
            isSessionActive
              ? isRunning
                ? '按住拖动移动；点击暂停'
                : '按住拖动移动；点击继续'
              : '按住拖动移动；点击开始专注'
          }
          aria-label={
            isSessionActive
              ? isRunning
                ? '暂停番茄钟'
                : '继续番茄钟'
              : '开始番茄钟'
          }
        >
          {isRunning && !isBreak && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400/30 blur-xl"
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <TomatoTimerFace
            size={size}
            minutes={minutes}
            seconds={seconds}
            progress={progress}
            isBreak={isBreak}
            showTime={isExpanded}
          />
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex max-w-[calc(100vw-16px)] flex-wrap items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-white/95 px-2 py-1.5 shadow-sm backdrop-blur"
          >
            <span
              className={cn(
                'text-xs font-extrabold px-2 py-0.5 rounded-full',
                isBreak ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
              )}
            >
              {isBreak ? '休息' : '专注'}
              {!isRunning && ' · 已暂停'}
            </span>

            <button
              type="button"
              onClick={isRunning ? pause : start}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-[#4b4b4b] hover:bg-[#f7f7f7] transition-colors"
              title={isRunning ? '暂停' : '继续'}
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
              {isRunning ? '暂停' : '继续'}
            </button>

            <button
              type="button"
              onClick={restart}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-[#777777] hover:bg-[#f7f7f7] transition-colors"
              title="重置并重新计时"
            >
              <RotateCcw size={12} />
              重置
            </button>

            <button
              type="button"
              onClick={cancel}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-[#FF4B4B] hover:bg-[#fff0f0] transition-colors"
              title="取消番茄钟"
            >
              <X size={12} />
              取消
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PomodoroCountProps {
  compact?: boolean;
}

export function PomodoroCount({ compact = false }: PomodoroCountProps) {
  const { completedCount } = usePomodoroStore();

  if (completedCount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border-t border-[#fecaca] bg-[#fff5f5]',
        compact ? 'justify-center' : 'justify-start'
      )}
      title={`已完成 ${completedCount} 个番茄钟`}
    >
      <span className="text-sm leading-none">🍅</span>
      <span className="text-xs font-extrabold text-[#ef4444] tabular-nums">
        {completedCount}
      </span>
      {!compact && (
        <span className="text-[10px] font-bold text-[#999999]">个番茄</span>
      )}
    </motion.div>
  );
}

/** @deprecated Use FloatingPomodoro + PomodoroCount instead */
export function Pomodoro({ compact = false }: { compact?: boolean }) {
  return <PomodoroCount compact={compact} />;
}
