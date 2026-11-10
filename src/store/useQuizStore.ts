import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizAttempt, QuizItem, QuizMastery } from '@/types';

/** 只保留最近多少条作答记录，避免 payload 无限膨胀 */
export const MAX_STORED_ATTEMPTS = 200;

interface QuizState {
  /** cardId -> 已生成并缓存的选择题 */
  items: Record<string, QuizItem>;
  /** 最近的作答记录，新的在前 */
  attempts: QuizAttempt[];
  /** cardId -> 掌握度与下次到期时间 */
  mastery: Record<string, QuizMastery>;

  upsertItems: (items: QuizItem[]) => void;
  recordAttempts: (attempts: QuizAttempt[]) => void;
  applyMastery: (records: QuizMastery[]) => void;
  getItemForCard: (cardId: string) => QuizItem | undefined;
  importSyncedState: (payload: {
    items: Record<string, QuizItem>;
    attempts: QuizAttempt[];
    mastery: Record<string, QuizMastery>;
  }) => void;
}

function sortByAtDesc(attempts: QuizAttempt[]): QuizAttempt[] {
  return [...attempts].sort((a, b) => b.at - a.at);
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      items: {},
      attempts: [],
      mastery: {},

      upsertItems: (items) => set((state) => {
        if (items.length === 0) return {};
        const next = { ...state.items };
        for (const item of items) next[item.cardId] = item;
        return { items: next };
      }),

      recordAttempts: (attempts) => set((state) => {
        if (attempts.length === 0) return {};
        const merged = new Map<string, QuizAttempt>();
        for (const attempt of state.attempts) merged.set(attempt.id, attempt);
        for (const attempt of attempts) merged.set(attempt.id, attempt);
        return {
          attempts: sortByAtDesc([...merged.values()]).slice(0, MAX_STORED_ATTEMPTS),
        };
      }),

      applyMastery: (records) => set((state) => {
        if (records.length === 0) return {};
        const next = { ...state.mastery };
        for (const record of records) {
          const existing = next[record.cardId];
          // 两处同时更新时以作答时间较新的为准，避免一轮测验里的旧结果盖掉新结果
          if (!existing || record.lastAt >= existing.lastAt) next[record.cardId] = record;
        }
        return { mastery: next };
      }),

      getItemForCard: (cardId) => get().items[cardId],

      importSyncedState: (payload) => set((state) => {
        // 云端的题目和本地缓存按 cardId 合并，同 key 取生成时间较新的一份
        const merged = { ...state.items };
        for (const [cardId, item] of Object.entries(payload.items)) {
          const existing = merged[cardId];
          if (!existing || item.generatedAt >= existing.generatedAt) merged[cardId] = item;
        }

        const attemptMap = new Map<string, QuizAttempt>();
        for (const attempt of state.attempts) attemptMap.set(attempt.id, attempt);
        for (const attempt of payload.attempts) attemptMap.set(attempt.id, attempt);

        const mastery = { ...state.mastery };
        for (const [cardId, entry] of Object.entries(payload.mastery)) {
          const existing = mastery[cardId];
          if (!existing || entry.lastAt >= existing.lastAt) mastery[cardId] = entry;
        }

        return {
          items: merged,
          attempts: sortByAtDesc([...attemptMap.values()]).slice(0, MAX_STORED_ATTEMPTS),
          mastery,
        };
      }),
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        items: state.items,
        attempts: state.attempts,
        mastery: state.mastery,
      }),
    }
  )
);
