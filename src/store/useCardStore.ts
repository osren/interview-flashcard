import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardStatus, FlashCard } from '@/types';

interface CardState {
  isFlipped: boolean;
  currentIndex: number;
  cards: FlashCard[];

  cardProgress: Record<string, number>;
  customCards: FlashCard[];
  modifiedCards: Record<string, Partial<FlashCard>>;

  filter: string;
  searchQuery: string;

  allCardProgress: Record<string, CardStatus>;
  lastVisitedCoreChapter: string | null;
  lastVisitedProject: string | null;
  lastVisitedAlgorithm: string | null;

  favorites: FlashCard[];

  setCards: (cards: FlashCard[]) => void;
  flip: () => void;
  resetFlip: () => void;
  setCurrentIndex: (index: number) => void;
  next: () => void;
  prev: () => void;

  saveCardProgress: (module: string, chapterId: string, index: number) => void;
  getCardProgress: (module: string, chapterId: string) => number;

  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  updateCardStatus: (cardId: string, status: CardStatus) => void;
  getProgress: () => { mastered: number; total: number; percentage: number };

  setLastVisitedCoreChapter: (chapterId: string | null) => void;
  setLastVisitedProject: (projectId: string | null) => void;
  setLastVisitedAlgorithm: (type: string | null) => void;

  addCustomCard: (card: FlashCard) => void;
  updateCustomCard: (cardId: string, updates: Partial<FlashCard>) => void;
  deleteCustomCard: (cardId: string) => void;

  updateCardAnswer: (cardId: string, updates: Partial<FlashCard>) => void;
  resetCardAnswer: (cardId: string) => void;
  getCardWithModifications: (card: FlashCard) => FlashCard;

  getMergedCards: (module: string, chapterId: string, staticCards: FlashCard[]) => FlashCard[];

  toggleFavorite: (card: FlashCard) => void;
  isFavorited: (cardId: string) => boolean;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      isFlipped: false,
      currentIndex: 0,
      cards: [],
      cardProgress: {},
      customCards: [],
      modifiedCards: {},
      filter: 'all',
      searchQuery: '',
      allCardProgress: {},
      lastVisitedCoreChapter: null,
      lastVisitedProject: null,
      lastVisitedAlgorithm: null,
      favorites: [],

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

      updateCardStatus: (cardId, status) => set((state) => ({
        cards: state.cards.map((card) =>
          card.id === cardId ? { ...card, status } : card
        ),
        allCardProgress: {
          ...state.allCardProgress,
          [cardId]: status,
        },
      })),

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

      getMergedCards: (module: string, chapterId: string, staticCards: FlashCard[]) => {
        const { customCards, modifiedCards } = get();
        const moduleCustomCards = customCards.filter(
          (c) => c.module === module && c.chapterId === chapterId
        );
        const appliedCustomCards = moduleCustomCards.map((c) => {
          const mod = modifiedCards[c.id];
          return mod ? { ...c, ...mod } : c;
        });
        return [...staticCards, ...appliedCustomCards];
      },

      toggleFavorite: (card) => set((state) => {
        const exists = state.favorites.some((f) => f.id === card.id);
        if (exists) {
          return { favorites: state.favorites.filter((f) => f.id !== card.id) };
        }
        return { favorites: [...state.favorites, card] };
      }),

      isFavorited: (cardId) => {
        return get().favorites.some((f) => f.id === cardId);
      },
    }),
    {
      name: 'card-storage',
      partialize: (state) => ({
        cards: state.cards.map((c) => ({ id: c.id, status: c.status })),
        customCards: state.customCards,
        modifiedCards: state.modifiedCards,
        favorites: state.favorites,
        cardProgress: state.cardProgress,
        allCardProgress: state.allCardProgress,
        lastVisitedCoreChapter: state.lastVisitedCoreChapter,
        lastVisitedProject: state.lastVisitedProject,
        lastVisitedAlgorithm: state.lastVisitedAlgorithm,
      }),
    }
  )
);
