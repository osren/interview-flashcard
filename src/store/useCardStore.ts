import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardStatus, FlashCard } from '@/types';

interface CardState {
  // 当前卡片状态
  isFlipped: boolean;
  currentIndex: number;
  cards: FlashCard[];

  // 筛选状态
  filter: string;
  searchQuery: string;

  // Actions
  setCards: (cards: FlashCard[]) => void;
  flip: () => void;
  resetFlip: () => void;
  setCurrentIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  updateCardStatus: (cardId: string, status: CardStatus) => void;
  getProgress: () => { mastered: number; total: number; percentage: number };
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      isFlipped: false,
      currentIndex: 0,
      cards: [],
      filter: 'all',
      searchQuery: '',

      setCards: (cards) => set({ cards }),

      flip: () => set((state) => ({ isFlipped: !state.isFlipped })),

      resetFlip: () => set({ isFlipped: false }),

      setCurrentIndex: (index) => set({ currentIndex: index, isFlipped: false }),

      next: () => set((state) => ({
        currentIndex: Math.min(state.currentIndex + 1, state.cards.length - 1),
        isFlipped: false,
      })),

      prev: () => set((state) => ({
        currentIndex: Math.max(state.currentIndex - 1, 0),
        isFlipped: false,
      })),

      setFilter: (filter) => set({ filter }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      updateCardStatus: (cardId, status) => set((state) => ({
        cards: state.cards.map((card) =>
          card.id === cardId ? { ...card, status } : card
        ),
      })),

      getProgress: () => {
        const { cards } = get();
        const mastered = cards.filter((c) => c.status === 'mastered').length;
        const total = cards.length;
        const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
        return { mastered, total, percentage };
      },
    }),
    {
      name: 'card-storage',
      partialize: (state) => ({
        cards: state.cards.map((c) => ({ id: c.id, status: c.status })),
      }),
    }
  )
);
