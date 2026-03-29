import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardProgress, LearningProgress } from '@/types';

interface ProgressState extends LearningProgress {
  updateProgress: (cardId: string, progress: Partial<CardProgress>) => void;
  getCardProgress: (cardId: string) => CardProgress | undefined;
  incrementMastered: () => void;
  decrementMastered: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      cardProgress: {},
      totalMastered: 0,
      totalCards: 0,
      lastVisited: undefined,

      updateProgress: (cardId, progress) =>
        set((state) => {
          const existing = state.cardProgress[cardId] || {
            status: 'unvisited',
            reviewCount: 0,
          };

          const newProgress = {
            ...existing,
            ...progress,
            lastReviewed: Date.now(),
            reviewCount: existing.reviewCount + 1,
          };

          return {
            cardProgress: {
              ...state.cardProgress,
              [cardId]: newProgress,
            },
          };
        }),

      getCardProgress: (cardId) => get().cardProgress[cardId],

      incrementMastered: () =>
        set((state) => ({ totalMastered: state.totalMastered + 1 })),

      decrementMastered: () =>
        set((state) => ({
          totalMastered: Math.max(0, state.totalMastered - 1),
        })),
    }),
    { name: 'progress-storage' }
  )
);
