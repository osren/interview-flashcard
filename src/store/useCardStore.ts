import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardStatus, FlashCard } from '@/types';

interface CardState {
  // 当前卡片状态
  isFlipped: boolean;
  currentIndex: number;
  cards: FlashCard[];

  // 自定义卡片（用户添加的）
  customCards: FlashCard[];

  // 修改过的卡片（用户编辑过答案的）
  modifiedCards: Record<string, Partial<FlashCard>>;

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

  // 自定义卡片 Actions
  addCustomCard: (card: FlashCard) => void;
  updateCustomCard: (cardId: string, updates: Partial<FlashCard>) => void;
  deleteCustomCard: (cardId: string) => void;

  // 修改卡片 Actions
  updateCardAnswer: (cardId: string, updates: Partial<FlashCard>) => void;
  resetCardAnswer: (cardId: string) => void;
  getCardWithModifications: (card: FlashCard) => FlashCard;

  // 获取合并后的卡片列表（静态数据 + 自定义卡片）
  getMergedCards: (module: string, chapterId: string, staticCards: FlashCard[]) => FlashCard[];
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      isFlipped: false,
      currentIndex: 0,
      cards: [],
      customCards: [],
      modifiedCards: {},
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

      // 自定义卡片 Actions
      addCustomCard: (card) => set((state) => ({
        customCards: [...state.customCards, { ...card, id: `custom-${Date.now()}` }],
      })),

      updateCustomCard: (cardId, updates) => set((state) => ({
        customCards: state.customCards.map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      })),

      deleteCustomCard: (cardId) => set((state) => ({
        customCards: state.customCards.filter((card) => card.id !== cardId),
      })),

      // 修改卡片 Actions
      updateCardAnswer: (cardId, updates) => set((state) => ({
        modifiedCards: {
          ...state.modifiedCards,
          [cardId]: { ...state.modifiedCards[cardId], ...updates },
        },
      })),

      resetCardAnswer: (cardId) => set((state) => {
        const { [cardId]: _, ...rest } = state.modifiedCards;
        return { modifiedCards: rest };
      }),

      getCardWithModifications: (card) => {
        const { modifiedCards } = get();
        const modification = modifiedCards[card.id];
        if (modification) {
          return { ...card, ...modification };
        }
        return card;
      },

      // 获取合并后的卡片列表（静态数据 + 自定义卡片）
      getMergedCards: (module: string, chapterId: string, staticCards: FlashCard[]) => {
        const { customCards, modifiedCards } = get();
        // 筛选出属于该模块/章节的自定义卡片
        const moduleCustomCards = customCards.filter(
          (c) => c.module === module && c.chapterId === chapterId
        );
        // 应用修改后的自定义卡片
        const appliedCustomCards = moduleCustomCards.map((c) => {
          const mod = modifiedCards[c.id];
          return mod ? { ...c, ...mod } : c;
        });
        return [...staticCards, ...appliedCustomCards];
      },
    }),
    {
      name: 'card-storage',
      partialize: (state) => ({
        cards: state.cards.map((c) => ({ id: c.id, status: c.status })),
        customCards: state.customCards,
        modifiedCards: state.modifiedCards,
      }),
    }
  )
);
