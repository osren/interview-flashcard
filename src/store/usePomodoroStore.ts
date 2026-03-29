import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PomodoroState {
  timeLeft: number; // 剩余秒数
  isRunning: boolean;
  isBreak: boolean; // false=学习中, true=休息中
  completedCount: number; // 完成的番茄钟次数
  workDuration: number; // 工作时长（秒）
  breakDuration: number; // 休息时长（秒）

  // Actions
  toggle: () => void;
  reset: () => void;
  tick: () => void;
  complete: () => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      timeLeft: 25 * 60,
      isRunning: false,
      isBreak: false,
      completedCount: 0,
      workDuration: 25 * 60,
      breakDuration: 5 * 60,

      toggle: () => set((state) => ({ isRunning: !state.isRunning })),

      reset: () => set({
        isRunning: false,
        isBreak: false,
        timeLeft: get().workDuration,
      }),

      tick: () => {
        const { timeLeft, isRunning, isBreak, workDuration, breakDuration, completedCount } = get();
        if (!isRunning) return;

        if (timeLeft <= 1) {
          // 时间到，切换状态
          const willBeBreak = !isBreak;
          const newTimeLeft = willBeBreak ? breakDuration : workDuration;
          const newCompletedCount = willBeBreak ? completedCount + 1 : completedCount;
          set({
            timeLeft: newTimeLeft,
            isBreak: willBeBreak,
            isRunning: false,
            completedCount: newCompletedCount,
          });
        } else {
          set({ timeLeft: timeLeft - 1 });
        }
      },

      complete: () => {
        const { isBreak, workDuration, breakDuration, completedCount } = get();
        const newIsBreak = !isBreak;
        set({
          isBreak: newIsBreak,
          timeLeft: newIsBreak ? breakDuration : workDuration,
          isRunning: false,
          completedCount: isBreak ? completedCount : completedCount + 1,
        });
      },
    }),
    {
      name: 'pomodoro-storage',
      partialize: (state) => ({
        completedCount: state.completedCount,
        workDuration: state.workDuration,
        breakDuration: state.breakDuration,
      }),
    }
  )
);
