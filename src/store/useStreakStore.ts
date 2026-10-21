import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckInDateKey } from '@/types/streak';
import { calculateStreak, formatDateKey } from '@/utils/streak';

interface StreakStoreState {
  checkInDates: Record<CheckInDateKey, true>;
  recordCheckIn: (date?: Date) => void;
  getStreak: () => number;
  hasCheckedInToday: () => boolean;
  getSyncPayload: () => { checkInDates: Record<CheckInDateKey, true> };
  importSyncedState: (checkInDates: Record<CheckInDateKey, true>) => void;
}

export const useStreakStore = create<StreakStoreState>()(
  persist(
    (set, get) => ({
      checkInDates: {},

      recordCheckIn: (date = new Date()) => {
        const key = formatDateKey(date);
        if (get().checkInDates[key]) return;
        set((state) => ({
          checkInDates: { ...state.checkInDates, [key]: true },
        }));
      },

      getStreak: () => calculateStreak(get().checkInDates),

      hasCheckedInToday: () => {
        const todayKey = formatDateKey(new Date());
        return Boolean(get().checkInDates[todayKey]);
      },

      getSyncPayload: () => ({
        checkInDates: get().checkInDates,
      }),

      importSyncedState: (checkInDates) => set({ checkInDates }),
    }),
    {
      name: 'streak-storage',
      partialize: (state) => ({ checkInDates: state.checkInDates }),
    }
  )
);

/** Call when user records learning progress (card status update) */
export function recordLearningCheckIn(): void {
  useStreakStore.getState().recordCheckIn();
}
