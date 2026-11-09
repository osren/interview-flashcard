import { create } from 'zustand';
import type { ModuleType } from '@/types';

/**
 * 面板是否正在跑一轮对话。
 * 只放内存、不落盘：刷新的那一刻请求本身就断了，持久化它没有意义。
 * 面板关掉后由它驱动入口按钮上的「处理中 / 生成中」指示。
 */
interface ChatBusyState {
  busy: Record<string, boolean>;
  setBusy: (key: string, value: boolean) => void;
}

export const AGENT_CHAT_BUSY_KEY = 'campus-agent';

export function studyChatBusyKey(module: ModuleType, chapterId: string): string {
  return `study:${module}:${chapterId}`;
}

export const useChatBusyStore = create<ChatBusyState>()((set) => ({
  busy: {},
  setBusy: (key, value) =>
    set((state) => {
      if (value) return { busy: { ...state.busy, [key]: true } };
      if (!(key in state.busy)) return state;
      const { [key]: _dropped, ...rest } = state.busy;
      return { busy: rest };
    }),
}));
