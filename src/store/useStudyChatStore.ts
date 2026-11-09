import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import type { ChatMessage } from '@/lib/llm/types';
import { interviewPersistStorage } from './interview-persist-storage';

export interface StudyChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

/** 与 Agent 会话同口径：单章节 20 条、单条 4000 字符，最多保留 10 个章节 */
const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 4000;
const MAX_CHAPTERS = 10;

function clampContent(content: string): string {
  if (content.length <= MAX_CONTENT_CHARS) return content;
  return `${content.slice(0, MAX_CONTENT_CHARS)}…`;
}

function clampMessages(list: StudyChatMessage[]): StudyChatMessage[] {
  const clamped = list.map((message) => ({ ...message, content: clampContent(message.content) }));
  return clamped.length > MAX_MESSAGES ? clamped.slice(clamped.length - MAX_MESSAGES) : clamped;
}

/** 会话按「模块 + 章节」分桶，避免换章节时互相污染 */
export function studyChatKey(module: string, chapterId: string): string {
  return `${module}:${chapterId}`;
}

/** 模型上下文由已存消息派生，不再单独存一份 history */
export function toStudyHistory(messages: StudyChatMessage[]): ChatMessage[] {
  return messages.map(({ role, content }) => ({ role, content }));
}

interface StudyChatState {
  sessions: Record<string, StudyChatMessage[]>;
  appendMessage: (key: string, message: StudyChatMessage) => void;
  clearSession: (key: string) => void;
}

type PersistedStudyChat = Pick<StudyChatState, 'sessions'>;

export const useStudyChatStore = create<StudyChatState>()(
  persist(
    (set) => ({
      sessions: {},
      appendMessage: (key, message) =>
        set((state) => {
          const next = clampMessages([...(state.sessions[key] ?? []), message]);
          // 把当前章节移到末尾，超出上限时丢弃最久未更新的章节
          const { [key]: _dropped, ...rest } = state.sessions;
          const ordered = { ...rest, [key]: next };
          const keys = Object.keys(ordered);
          if (keys.length > MAX_CHAPTERS) {
            for (const staleKey of keys.slice(0, keys.length - MAX_CHAPTERS)) {
              delete ordered[staleKey];
            }
          }
          return { sessions: ordered };
        }),
      clearSession: (key) =>
        set((state) => {
          const { [key]: _dropped, ...rest } = state.sessions;
          return { sessions: rest };
        }),
    }),
    {
      name: 'study-chat-session',
      version: 1,
      storage: interviewPersistStorage as unknown as PersistStorage<PersistedStudyChat>,
      partialize: (state) => ({ sessions: state.sessions }),
      migrate: () => ({ sessions: {} }),
    }
  )
);
