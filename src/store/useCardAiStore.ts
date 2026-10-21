import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '@/lib/llm/types';

export type CardAiMode = 'explain' | 'followup';

export interface CardAiSession {
  history: ChatMessage[];
  displayContent: string;
  updatedAt: number;
}

interface CardAiState {
  sessions: Record<string, CardAiSession>;
  getSession: (cardId: string, mode: CardAiMode) => CardAiSession | null;
  saveSession: (
    cardId: string,
    mode: CardAiMode,
    payload: Pick<CardAiSession, 'history' | 'displayContent'>
  ) => void;
}

function toSessionKey(cardId: string, mode: CardAiMode): string {
  return `${cardId}:${mode}`;
}

export function isRestorableSession(session: CardAiSession | null): session is CardAiSession {
  if (!session?.displayContent.trim()) return false;
  return session.history.some((message) => message.role === 'assistant');
}

export const useCardAiStore = create<CardAiState>()(
  persist(
    (set, get) => ({
      sessions: {},
      getSession: (cardId, mode) => get().sessions[toSessionKey(cardId, mode)] ?? null,
      saveSession: (cardId, mode, payload) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [toSessionKey(cardId, mode)]: {
              ...payload,
              updatedAt: Date.now(),
            },
          },
        }));
      },
    }),
    { name: 'card-ai-sessions' }
  )
);
