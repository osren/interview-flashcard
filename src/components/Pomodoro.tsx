import { useEffect, useState } from 'react';
import { usePomodoroStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X } from 'lucide-react';

export function Pomodoro() {
  const {
    timeLeft,
    isRunning,
    isBreak,
    completedCount,
    workDuration,
    toggle,
    reset,
    tick,
  } = usePomodoroStore();

  const [isExpanded, setIsExpanded] = useState(false);

  // 计时器
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(tick, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = isBreak
    ? 1 - timeLeft / (5 * 60)
    : 1 - timeLeft / workDuration;

  return (
    <>
      {/* 桌面端番茄钟 */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-2">
          {/* 番茄钟主体 */}
          <button
            onClick={toggle}
            className={`relative group cursor-pointer focus:outline-none ${
              isRunning ? 'animate-pulse' : ''
            }`}
            title={isRunning ? '暂停' : '开始'}
          >
            {/* 番茄梗 */}
            <div
              className={`absolute -top-1 left-1/2 -translate-x-1/2 z-10 ${
                isBreak ? 'text-emerald-500' : 'text-emerald-600'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C10.5 4 10 6 10 7c-2 0-4 2-4 4 0 3 2 5 4 7 1 1 2 2 2 4h4c0-2 1-3 2-4 2-2 4-4 4-7 0-2-2-4-4-4 0-1-.5-3-2-5z"/>
                <path d="M12 2c-1.5 2-2 4-2 5 2 0 4 2 4 4 0 3-2 5-4 7-1 1-2 2-2 4h4c0-2 1-3 2-4 2-2 4-4 4-7 0-2-2-4-4-4 0-1 .5-3 2-5-1.5-1.5-2.5-2-4-2s-2.5.5-4 2z" fillOpacity="0.6"/>
              </svg>
            </div>

            {/* 番茄主体 */}
            <div
              className={`relative w-14 h-14 rounded-full transition-all duration-300 shadow-md group-hover:shadow-lg ${
                isBreak
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                  : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}
            >
              {/* 高光 */}
              <div className="absolute top-2 left-3 w-4 h-3 bg-white/30 rounded-full blur-sm" />

              {/* 时间显示 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`font-mono font-bold text-sm leading-none ${
                    isBreak ? 'text-emerald-50' : 'text-red-50'
                  }`}
                >
                  {String(minutes).padStart(2, '0')}
                </span>
                <span
                  className={`font-mono text-xs leading-none ${
                    isBreak ? 'text-emerald-100' : 'text-red-100'
                  }`}
                >
                  {String(seconds).padStart(2, '0')}
                </span>
              </div>

              {/* 进度环 */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 56 56"
              >
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  fill="none"
                  stroke={isBreak ? '#10b981' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${progress * 163.4} 163.4`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                  opacity="0.4"
                />
              </svg>
            </div>

            {/* 悬停提示 */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {isRunning ? '暂停' : '开始'}
              </span>
            </div>
          </button>

          {/* 状态标签 */}
          <div className="flex flex-col">
            <span
              className={`text-xs font-medium ${
                isBreak ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {isBreak ? '休息' : '专注'}
            </span>
            <button
              onClick={reset}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-left"
              title="重置"
            >
              重置
            </button>
          </div>
        </div>

        {/* 完成次数 */}
        {completedCount > 0 && (
          <div className="flex items-center gap-0.5 ml-1">
            {Array.from({ length: Math.min(completedCount, 5) }).map((_, i) => (
              <span
                key={i}
                className="text-sm leading-none"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                🍅
              </span>
            ))}
            {completedCount > 5 && (
              <span className="text-xs text-gray-500 ml-0.5">+{completedCount - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* 移动端悬浮按钮 */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-64"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isBreak ? 'bg-emerald-500' : 'bg-red-500'
                    } ${isRunning ? 'animate-pulse' : ''}`}
                  />
                  <span className={`font-medium ${
                    isBreak ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {isBreak ? '休息时间' : '专注中'}
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              {/* 计时器显示 */}
              <div className="text-center mb-4">
                <div className={`text-5xl font-mono font-bold ${
                  isBreak ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  第 {completedCount + 1} 个番茄钟
                </div>
              </div>

              {/* 进度条 */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-300 ${
                    isBreak ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              {/* 控制按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={toggle}
                  className={`flex-1 py-3 rounded-xl font-medium text-white transition-colors ${
                    isBreak
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isRunning ? '暂停' : '开始'}
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-3 rounded-xl font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  重置
                </button>
              </div>

              {/* 完成记录 */}
              {completedCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500 mb-2">今日完成</div>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: Math.min(completedCount, 10) }).map((_, i) => (
                      <span key={i} className="text-lg">🍅</span>
                    ))}
                    {completedCount > 10 && (
                      <span className="text-sm text-gray-500">+{completedCount - 10}</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 悬浮按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isBreak
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
              : 'bg-gradient-to-br from-red-400 to-red-600'
          } ${isRunning ? 'animate-pulse' : ''}`}
        >
          <Timer size={24} className="text-white" />
        </button>
      </div>
    </>
  );
}
