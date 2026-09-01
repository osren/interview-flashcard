import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardStatus, FlashCard } from '@/types';
import { migratePersistedCardStatuses } from './migrateCardStatuses';
import { recordLearningCheckIn } from './useStreakStore';
import { isRemembered, resolveCardStatus, normalizeCardStatus } from '@/utils/cardStatus';

interface CardState {
  // 当前卡片状态
  isFlipped: boolean;
  currentIndex: number;
  cards: FlashCard[];

  // 各卡片掌握状态 (cardId -> status)，与当前章节列表解耦
  cardStatuses: Record<string, CardStatus>;

  // 各模块/章节的浏览进度 (module-chapterId -> currentIndex)
  cardProgress: Record<string, number>;

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

  // 章节进度管理
  saveCardProgress: (module: string, chapterId: string, index: number) => void;
  getCardProgress: (module: string, chapterId: string) => number;

  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  updateCardStatus: (cardId: string, status: CardStatus) => void;
  getProgress: () => { remembered: number; total: number; percentage: number };

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

  // 收藏卡片
  favorites: FlashCard[];
  toggleFavorite: (card: FlashCard) => void;
  isFavorited: (cardId: string) => boolean;

  importSyncedState: (payload: {
    cardStatuses: Record<string, CardStatus>;
    cardProgress: Record<string, number>;
    customCards: FlashCard[];
    modifiedCards: Record<string, Partial<FlashCard>>;
    favorites: FlashCard[];
  }) => void;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      isFlipped: false,
      currentIndex: 0,
      cards: [],
      cardStatuses: {},
      cardProgress: {},
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

      saveCardProgress: (module, chapterId, index) => set((state) => ({
        cardProgress: {
          ...state.cardProgress,
          [`${module}-${chapterId}`]: index,
        },
      })),

      getCardProgress: (module, chapterId) => {
        return get().cardProgress[`${module}-${chapterId}`] || 0;
      },

      setFilter: (filter) => set({ filter }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      updateCardStatus: (cardId, status) => {
        const normalizedStatus = normalizeCardStatus(status);
        if (normalizedStatus !== 'unvisited') {
          recordLearningCheckIn();
        }
        set((state) => ({
          cardStatuses: { ...state.cardStatuses, [cardId]: normalizedStatus },
          cards: state.cards.map((card) =>
            card.id === cardId ? { ...card, status: normalizedStatus } : card
          ),
          customCards: state.customCards.map((card) =>
            card.id === cardId ? { ...card, status: normalizedStatus } : card
          ),
        }));
      },

      getProgress: () => {
        const { cards, cardStatuses } = get();
        const remembered = cards.filter((c) =>
          isRemembered(resolveCardStatus(c.id, cardStatuses, c.status))
        ).length;
        const total = cards.length;
        const percentage = total > 0 ? Math.round((remembered / total) * 100) : 0;
        return { remembered, total, percentage };
      },

      // 自定义卡片 Actions
      addCustomCard: (card) => set((state) => ({
        customCards: [...state.customCards, { ...card, id: crypto.randomUUID() }],
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
        const { modifiedCards, cardStatuses } = get();
        const modification = modifiedCards[card.id];
        const status = cardStatuses[card.id];
        return {
          ...card,
          ...modification,
          ...(status ? { status } : {}),
        };
      },

      // 获取合并后的卡片列表（静态数据 + 自定义卡片 + 已保存掌握状态）
      getMergedCards: (module: string, chapterId: string, staticCards: FlashCard[]) => {
        const { customCards, modifiedCards, cardStatuses } = get();
        const apply = (c: FlashCard): FlashCard => {
          const mod = modifiedCards[c.id];
          const status = cardStatuses[c.id];
          return {
            ...c,
            ...mod,
            ...(status ? { status } : {}),
          };
        };
        const moduleCustomCards = customCards.filter(
          (c) => c.module === module && c.chapterId === chapterId
        );
        return [...staticCards.map(apply), ...moduleCustomCards.map(apply)];
      },

      // 收藏卡片
      favorites: [],

      toggleFavorite: (card) => set((state) => {
        const exists = state.favorites.some((f) => f.id === card.id);
        if (exists) {
          return { favorites: state.favorites.filter((f) => f.id !== card.id) };
        } else {
          return { favorites: [...state.favorites, card] };
        }
      }),

      isFavorited: (cardId) => {
        return get().favorites.some((f) => f.id === cardId);
      },

      importSyncedState: (payload) =>
        set((state) => ({
          cardStatuses: migratePersistedCardStatuses({
            cardStatuses: payload.cardStatuses,
            cards: state.cards,
            customCards: payload.customCards,
          }),
          cardProgress: payload.cardProgress,
          customCards: payload.customCards,
          modifiedCards: payload.modifiedCards,
          favorites: payload.favorites,
        })),
    }),
    {
      name: 'card-storage',
      partialize: (state) => ({
        cardStatuses: state.cardStatuses,
        customCards: state.customCards,
        modifiedCards: state.modifiedCards,
        favorites: state.favorites,
        cardProgress: state.cardProgress,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<CardState> & {
          cards?: Array<{ id?: string; status?: CardStatus }>;
        };
        const { cards: legacyCards, ...rest } = persisted;
        return {
          ...currentState,
          ...rest,
          cards: currentState.cards,
          cardStatuses: migratePersistedCardStatuses({
            cardStatuses: rest.cardStatuses,
            cards: legacyCards,
            customCards: rest.customCards,
          }),
        };
      },
    }
  )
);
