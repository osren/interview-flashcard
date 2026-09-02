import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  isSessionActive: boolean;
  completedCount: number;
  workDuration: number;
  breakDuration: number;

  start: () => void;
  pause: () => void;
  cancel: () => void;
  restart: () => void;
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
      isSessionActive: false,
      completedCount: 0,
      workDuration: 25 * 60,
      breakDuration: 5 * 60,

      start: () =>
        set({
          isRunning: true,
          isSessionActive: true,
        }),

      pause: () => set({ isRunning: false }),

      cancel: () =>
        set({
          isRunning: false,
          isSessionActive: false,
          isBreak: false,
          timeLeft: get().workDuration,
        }),

      restart: () =>
        set({
          isRunning: true,
          isSessionActive: true,
          isBreak: false,
          timeLeft: get().workDuration,
        }),

      reset: () =>
        set({
          isRunning: false,
          isSessionActive: false,
          isBreak: false,
          timeLeft: get().workDuration,
        }),

      tick: () => {
        const { timeLeft, isRunning, isBreak, workDuration, breakDuration, completedCount } = get();
        if (!isRunning) return;

        if (timeLeft <= 1) {
          const willBeBreak = !isBreak;
          const newTimeLeft = willBeBreak ? breakDuration : workDuration;
          const newCompletedCount = willBeBreak ? completedCount + 1 : completedCount;
          set({
            timeLeft: newTimeLeft,
            isBreak: willBeBreak,
            isRunning: false,
            isSessionActive: false,
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
          isSessionActive: false,
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
