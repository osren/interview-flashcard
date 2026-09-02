import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MessageCircleQuestion, Sparkles, X } from 'lucide-react';
import type { FlashCard } from '@/types';
import { streamLlm } from '@/lib/llm/call';
import type { ChatMessage } from '@/lib/llm/types';
import {
  buildContinueMessages,
  buildExplainMessages,
  buildFollowupMessages,
} from '@/lib/llm/prompts/card-ai';
import { isRestorableSession, useCardAiStore, type CardAiMode } from '@/store/useCardAiStore';
import { clearCardAiAutoRun, isCardAiAutoRunInflight, runCardAiAutoRunOnce } from './card-ai-auto-run';
import { StreamMarkdown } from './StreamMarkdown';
import { LlmQuotaBadge } from './LlmQuotaBadge';
import { useLlmQuota } from '@/hooks/useLlmQuota';

export type CardAIMode = CardAiMode;

const QUOTA_EXHAUSTED_MSG = '今日 AI 额度已用完，请明日再试';

const backdropTransition = {
  duration: 0.15,
  ease: [0.4, 0, 1, 1] as const,
};

const panelTransition = {
  enter: { type: 'spring' as const, stiffness: 420, damping: 36 },
  exit: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
};

interface CardAIPanelProps {
  open: boolean;
  card: FlashCard;
  mode: CardAIMode;
  onClose: () => void;
}

function sessionKey(cardId: string, mode: CardAIMode): string {
  return `${cardId}:${mode}`;
}

export function CardAIPanel({ open, card, mode, onClose }: CardAIPanelProps) {
  const [content, setContent] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followup, setFollowup] = useState('');
  const [restoredSession, setRestoredSession] = useState(false);
  const [openedWithSavedSession, setOpenedWithSavedSession] = useState(false);
  const historyRef = useRef<ChatMessage[]>([]);
  const contentRef = useRef('');
  const streamingRef = useRef(false);
  const abortRef = useRef(false);
  const streamGenerationRef = useRef(0);
  const activeKeyRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const getSession = useCardAiStore((state) => state.getSession);
  const saveSession = useCardAiStore((state) => state.saveSession);

  const key = sessionKey(card.id, mode);

  const {
    quota,
    loading: quotaLoading,
    error: quotaError,
    refresh: refreshQuota,
    quotaPending,
    isQuotaExhausted,
    canUseAi,
  } = useLlmQuota({
    enabled: open,
  });

  const persistSession = useCallback(() => {
    if (!isRestorableSession({ history: historyRef.current, displayContent: contentRef.current, updatedAt: 0 })) {
      return;
    }
    saveSession(card.id, mode, {
      history: historyRef.current,
      displayContent: contentRef.current,
    });
  }, [card.id, mode, saveSession]);

  const restoreFromStore = useCallback((saved: NonNullable<ReturnType<typeof getSession>>, fromCache: boolean) => {
    historyRef.current = saved.history;
    contentRef.current = saved.displayContent;
    setContent(saved.displayContent);
    setRestoredSession(true);
    setOpenedWithSavedSession(fromCache);
    setError(null);
  }, []);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    streamingRef.current = streaming;
  }, [streaming]);

  useEffect(() => {
    const previousKey = activeKeyRef.current;

    if (!open) {
      abortRef.current = true;
      streamGenerationRef.current += 1;
      if (previousKey) {
        clearCardAiAutoRun(previousKey);
      }
      activeKeyRef.current = null;
      if (!streamingRef.current) {
        persistSession();
      }
      return;
    }

    if (previousKey && previousKey !== key) {
      abortRef.current = true;
      streamGenerationRef.current += 1;
      clearCardAiAutoRun(previousKey);
    }

    abortRef.current = false;
    activeKeyRef.current = key;

    const saved = getSession(card.id, mode);
    if (isRestorableSession(saved)) {
      restoreFromStore(saved, true);
      return;
    }

    if (!streamingRef.current && !isCardAiAutoRunInflight(key)) {
      historyRef.current = [];
      contentRef.current = '';
      setContent('');
      setRestoredSession(false);
      setOpenedWithSavedSession(false);
      setError(null);
    }
  }, [open, key, card.id, mode, getSession, persistSession, restoreFromStore]);

  useEffect(() => {
    if (!open || quotaPending || restoredSession || isQuotaExhausted || !canUseAi) {
      return;
    }

    runCardAiAutoRunOnce(key, async () => {
      await runInitial(mode);
      const saved = getSession(card.id, mode);
      if (isRestorableSession(saved)) {
        restoreFromStore(saved, false);
      }
    });
  }, [open, key, card.id, mode, quotaPending, restoredSession, isQuotaExhausted, canUseAi, getSession, restoreFromStore]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, streaming]);

  const runStream = async (messages: ChatMessage[]) => {
    if (!canUseAi) return;

    const generation = streamGenerationRef.current;
    setStreaming(true);
    setError(null);
    setContent('');
    contentRef.current = '';
    historyRef.current = messages;
    let assembled = '';

    try {
      for await (const chunk of streamLlm({
        messages,
        temperature: 0.5,
        max_tokens: 1200,
      })) {
        if (abortRef.current || generation !== streamGenerationRef.current) break;
        assembled += chunk;
        contentRef.current = assembled;
        setContent(assembled);
      }

      if (assembled) {
        const fullHistory: ChatMessage[] = [...messages, { role: 'assistant', content: assembled }];
        saveSession(card.id, mode, {
          history: fullHistory,
          displayContent: assembled,
        });
        if (generation === streamGenerationRef.current) {
          historyRef.current = fullHistory;
          setContent(assembled);
          setRestoredSession(true);
        }
      } else if (generation === streamGenerationRef.current && abortRef.current) {
        setError('生成已中断，请关闭后重新打开');
      }

      if (generation === streamGenerationRef.current) {
        await refreshQuota();
      }
    } catch (err) {
      if (generation !== streamGenerationRef.current) return;
      setError(err instanceof Error ? err.message : 'AI 请求失败');
      await refreshQuota();
    } finally {
      if (generation === streamGenerationRef.current) {
        setStreaming(false);
      }
    }
  };

  const runInitial = async (nextMode: CardAIMode) => {
    const messages = nextMode === 'explain'
      ? buildExplainMessages(card)
      : buildFollowupMessages(card);
    await runStream(messages);
  };

  const handleContinue = async (event: FormEvent) => {
    event.preventDefault();
    const question = followup.trim();
    if (!question || streaming) return;
    setFollowup('');
    const messages = buildContinueMessages(historyRef.current, question);
    await runStream(messages);
  };

  const title = mode === 'explain' ? 'AI 解释' : 'AI 追问';
  const followupPlaceholder = quotaPending
    ? '额度加载中…'
    : isQuotaExhausted
      ? '今日额度已用完'
      : restoredSession
        ? '继续追问，或输入新问题…'
        : '继续追问，例如：和 React 闭包陷阱有什么关系？';

  return (
    <AnimatePresence mode="sync">
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: backdropTransition }}
            exit={{ opacity: 0, transition: backdropTransition }}
            className="fixed inset-0 z-[60] bg-black/30"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0, transition: panelTransition.enter }}
            exit={{ x: '100%', transition: panelTransition.exit }}
            className="fixed inset-y-0 right-0 z-[61] w-full max-w-md bg-white border-l-2 border-[#e5e5e5] shadow-2xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#e5e5e5] bg-[#f7f7f7]">
              <div className="flex items-center gap-2 min-w-0">
                {mode === 'explain' ? (
                  <Sparkles size={18} className="text-[#1CB0F6]" />
                ) : (
                  <MessageCircleQuestion size={18} className="text-[#58CC02]" />
                )}
                <div className="min-w-0">
                  <h2 className="font-extrabold text-[#3c3c3c]">{title}</h2>
                  <p className="text-xs text-[#999999] truncate">{card.question}</p>
                  <LlmQuotaBadge
                    quota={quota}
                    loading={quotaLoading}
                    error={quotaError}
                    onRefresh={refreshQuota}
                    className="mt-1"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-[#777777] hover:bg-white"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {openedWithSavedSession && !streaming && content && (
                <p className="mb-3 text-[11px] font-semibold text-[#999999]">已恢复上次对话，继续输入将消耗 1 次额度</p>
              )}
              {isQuotaExhausted && !streaming && (
                <div className="mb-3 rounded-xl border-2 border-[#FF4B4B] bg-[#fff0f0] px-3 py-2 text-sm text-[#b42318]">
                  {QUOTA_EXHAUSTED_MSG}
                </div>
              )}
              {error && (
                <div className="mb-3 rounded-xl border-2 border-[#FF4B4B] bg-[#fff0f0] px-3 py-2 text-sm text-[#b42318]">
                  {error}
                </div>
              )}
              <StreamMarkdown content={content} streaming={streaming} />
            </div>

            <form onSubmit={handleContinue} className="border-t-2 border-[#e5e5e5] p-3 flex gap-2">
              <input
                value={followup}
                onChange={(event) => setFollowup(event.target.value)}
                disabled={streaming || !canUseAi}
                className="flex-1 rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-[#1CB0F6]"
                placeholder={followupPlaceholder}
              />
              <button
                type="submit"
                disabled={streaming || !followup.trim() || !canUseAi}
                className="px-3 py-2 rounded-xl bg-[#1CB0F6] text-white text-sm font-extrabold border-b-4 border-[#1899D6] disabled:opacity-50"
              >
                {streaming ? <Loader2 size={16} className="animate-spin" /> : '发送'}
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
