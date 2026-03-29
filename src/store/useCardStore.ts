import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardStatus, FlashCard } from '@/types';

interface CardState {
  // 当前卡片状态
  isFlipped: boolean;
  currentIndex: number;
  cards: FlashCard[];
  currentChapterId: string | null;

  // 筛选状态
  filter: string;
  searchQuery: string;

  // 所有章节的卡片进度（用于首页统计）
  allCardProgress: Record<string, CardStatus>;

  // 每个章节的当前位置记忆
  chapterPositions: Record<string, number>;

  // 最后访问的章节（用于底部导航恢复）
  lastVisitedCoreChapter: string | null;
  lastVisitedProject: string | null;
  lastVisitedAlgorithm: string | null;

  // Actions
  setCards: (cards: FlashCard[]) => void;
  setCurrentChapterId: (chapterId: string | null) => void;
  flip: () => void;
  resetFlip: () => void;
  setCurrentIndex: (index: number) => void;
  saveChapterPosition: (chapterId: string, index: number) => void;
  getChapterPosition: (chapterId: string) => number;
  next: () => void;
  prev: () => void;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  updateCardStatus: (cardId: string, status: CardStatus) => void;
  getProgress: () => { mastered: number; total: number; percentage: number };
  setLastVisitedCoreChapter: (chapterId: string | null) => void;
  setLastVisitedProject: (projectId: string | null) => void;
  setLastVisitedAlgorithm: (type: string | null) => void;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      isFlipped: false,
      currentIndex: 0,
      cards: [],
      currentChapterId: null,
      filter: 'all',
      searchQuery: '',
      allCardProgress: {},
      chapterPositions: {},
      lastVisitedCoreChapter: null,
      lastVisitedProject: null,
      lastVisitedAlgorithm: null,

      setCards: (cards) => set({ cards }),

      setCurrentChapterId: (chapterId) => set({ currentChapterId: chapterId }),

      flip: () => set((state) => ({ isFlipped: !state.isFlipped })),

      resetFlip: () => set({ isFlipped: false }),

      setCurrentIndex: (index) => set({ currentIndex: index, isFlipped: false }),

      saveChapterPosition: (chapterId, index) => set((state) => ({
        chapterPositions: {
          ...state.chapterPositions,
          [chapterId]: index,
        },
      })),

      getChapterPosition: (chapterId) => {
        return get().chapterPositions[chapterId] || 0;
      },

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

      updateCardStatus: (cardId, status) => set((state) => {
        // 更新当前章节的 cards
        const updatedCards = state.cards.map((card) =>
          card.id === cardId ? { ...card, status } : card
        );
        // 同时更新 allCardProgress（用于首页统计）
        const updatedAllProgress = {
          ...state.allCardProgress,
          [cardId]: status,
        };
        return {
          cards: updatedCards,
          allCardProgress: updatedAllProgress,
        };
      }),

      getProgress: () => {
        const { cards } = get();
        const mastered = cards.filter((c) => c.status === 'mastered').length;
        const total = cards.length;
        const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
        return { mastered, total, percentage };
      },

      setLastVisitedCoreChapter: (chapterId) => set({ lastVisitedCoreChapter: chapterId }),
      setLastVisitedProject: (projectId) => set({ lastVisitedProject: projectId }),
      setLastVisitedAlgorithm: (type) => set({ lastVisitedAlgorithm: type }),
    }),
    {
      name: 'card-storage',
      partialize: (state) => ({
        cards: state.cards.map((c) => ({ id: c.id, status: c.status })),
        allCardProgress: state.allCardProgress,
        chapterPositions: state.chapterPositions,
        lastVisitedCoreChapter: state.lastVisitedCoreChapter,
        lastVisitedProject: state.lastVisitedProject,
        lastVisitedAlgorithm: state.lastVisitedAlgorithm,
      }),
    }
  )
);
