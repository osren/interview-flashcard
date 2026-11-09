import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import type { ChatMessage } from '@/lib/llm/types';
import { interviewPersistStorage } from './interview-persist-storage';

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/** 只留最近 20 条，一条对话内单条正文最多 4000 字符，避免把 IndexedDB/localStorage 撑爆 */
const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 4000;

function clampContent(content: string): string {
  if (content.length <= MAX_CONTENT_CHARS) return content;
  return `${content.slice(0, MAX_CONTENT_CHARS)}…`;
}

function clampMessages(list: AgentChatMessage[]): AgentChatMessage[] {
  const clamped = list.map((message) => ({ ...message, content: clampContent(message.content) }));
  return clamped.length > MAX_MESSAGES ? clamped.slice(clamped.length - MAX_MESSAGES) : clamped;
}

/** 模型上下文由已存的消息派生，不再单独存一份 history，避免两份数据不一致 */
export function toAgentHistory(messages: AgentChatMessage[]): ChatMessage[] {
  return messages.map(({ role, content }) => ({ role, content }));
}

interface AgentChatState {
  messages: AgentChatMessage[];
  appendMessage: (message: AgentChatMessage) => void;
  clearMessages: () => void;
}

type PersistedAgentChat = Pick<AgentChatState, 'messages'>;

export const useAgentChatStore = create<AgentChatState>()(
  persist(
    (set) => ({
      messages: [],
      appendMessage: (message) =>
        set((state) => ({ messages: clampMessages([...state.messages, message]) })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'agent-chat-session',
      version: 1,
      storage: interviewPersistStorage as unknown as PersistStorage<PersistedAgentChat>,
      partialize: (state) => ({ messages: state.messages }),
      // 结构升级时宁可丢掉旧会话，也不要让脏数据卡住面板
      migrate: () => ({ messages: [] }),
    }
  )
);
