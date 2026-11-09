import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkPlus, Check, Loader2, Send, Sparkles, Trash2, X } from 'lucide-react';
import type { FlashCard, ModuleType } from '@/types';
import { streamLlm } from '@/lib/llm/call';
import { buildStudyChatMessages, buildStudyChatSystem } from '@/lib/llm/prompts/study-chat';
import { useLlmQuota } from '@/hooks/useLlmQuota';
import { useCardStore } from '@/store';
import { studyChatBusyKey, useChatBusyStore } from '@/store/useChatBusyStore';
import { studyChatKey, toStudyHistory, useStudyChatStore } from '@/store/useStudyChatStore';
import { cn } from '@/utils/cn';
import { LlmQuotaBadge } from './LlmQuotaBadge';
import { StreamMarkdown } from './StreamMarkdown';

const EMPTY_MESSAGES: never[] = [];

interface StudyChatPanelProps {
  open: boolean;
  onClose: () => void;
  module: ModuleType;
  chapterId: string;
  title: string;
  cards: FlashCard[];
}

interface CardDraft {
  question: string;
  answer: string;
  category: string;
}

const backdropTransition = { duration: 0.15, ease: [0.4, 0, 1, 1] as const };
const panelTransition = {
  enter: { type: 'spring' as const, stiffness: 420, damping: 36 },
  exit: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
};

export function StudyChatPanel({ open, onClose, module, chapterId, title, cards }: StudyChatPanelProps) {
  const key = studyChatKey(module, chapterId);
  const messages = useStudyChatStore((state) => state.sessions[key] ?? EMPTY_MESSAGES);
  const appendMessage = useStudyChatStore((state) => state.appendMessage);
  const clearSession = useStudyChatStore((state) => state.clearSession);
  const addCustomCard = useCardStore((state) => state.addCustomCard);

  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  // 正在生成的正文：面板关掉时不丢，重开还能看到它继续往下写
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const [savedTip, setSavedTip] = useState<string | null>(null);
  const messagesRef = useRef(messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    quota,
    loading: quotaLoading,
    error: quotaError,
    refresh: refreshQuota,
    canUseAi,
    isQuotaExhausted,
  } = useLlmQuota({ enabled: open });

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming, draft]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const card of cards) {
      const category = card.category?.trim();
      if (category) set.add(category);
    }
    return Array.from(set);
  }, [cards]);

  const system = useMemo(
    () => buildStudyChatSystem({ title, module, chapterId, cards }),
    [title, module, chapterId, cards]
  );

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    const question = input.trim();
    if (!question || streaming || !canUseAi) return;
    setInput('');
    setError(null);
    setSavedTip(null);
    appendMessage(key, {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      createdAt: Date.now(),
    });

    setStreaming(true);
    setStreamText('');
    useChatBusyStore.getState().setBusy(studyChatBusyKey(module, chapterId), true);
    let assembled = '';
    try {
      for await (const chunk of streamLlm({
        messages: buildStudyChatMessages(system, toStudyHistory(messagesRef.current), question),
        temperature: 0.4,
        max_tokens: 1600,
      })) {
        assembled += chunk;
        setStreamText(assembled);
      }
      if (assembled) {
        appendMessage(key, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assembled,
          createdAt: Date.now(),
        });
      } else {
        setError('模型没有返回内容，请重试');
      }
      await refreshQuota();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 请求失败');
      await refreshQuota();
    } finally {
      setStreaming(false);
      setStreamText('');
      useChatBusyStore.getState().setBusy(studyChatBusyKey(module, chapterId), false);
    }
  };

  /** 找到某条回答对应的提问，作为新卡片的题干默认值 */
  const questionFor = (index: number): string => {
    for (let i = index - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === 'user') return messages[i].content;
    }
    return title;
  };

  const saveDraft = () => {
    if (!draft || !draft.question.trim()) return;
    const category = draft.category.trim() || title;
    addCustomCard({
      id: '',
      module,
      chapterId,
      question: draft.question.trim(),
      answer: draft.answer,
      tags: ['AI对话'],
      status: 'unvisited',
      category,
    });
    setDraft(null);
    setSavedTip(`已追加到「${category}」小节末尾`);
  };

  const locked = !canUseAi || isQuotaExhausted;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
          <motion.div
            className="absolute inset-0 bg-[#0f172a]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={onClose}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={panelTransition}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start gap-2 border-b border-[#e5e5e5] px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1CB0F6]/12 text-[#1CB0F6]">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-[#1f1f1f]">本章 AI 对话</p>
                <p className="truncate text-xs font-bold text-[#777777]">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => clearSession(key)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-[#777777] hover:bg-[#f4f4f4]"
              >
                清空
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#777777] hover:bg-[#f4f4f4]"
              >
                <X size={18} />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-[#3c3c3c]">
                    直接问本章的问题，回答会以「结论 → 分点 → 可口述的例子」给出。满意的回答可以一键追加到本章文档。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(cards.slice(0, 3).map((card) => `再讲讲：${card.question}`)).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setInput(prompt)}
                        className="rounded-full border border-[#e5e5e5] px-3 py-1.5 text-xs font-bold text-[#3c3c3c] hover:border-[#1CB0F6] hover:text-[#1CB0F6]"
                      >
                        {prompt.length > 28 ? `${prompt.slice(0, 28)}…` : prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className="max-w-[88%] space-y-1.5">
                      <div
                        className={cn(
                          'rounded-2xl px-3 py-2 text-sm',
                          message.role === 'user'
                            ? 'bg-[#1CB0F6] font-bold text-white'
                            : 'bg-[#f7f7f7] text-[#3c3c3c]'
                        )}
                      >
                        {message.role === 'assistant' ? (
                          <StreamMarkdown content={message.content} />
                        ) : (
                          <span className="whitespace-pre-wrap break-words">{message.content}</span>
                        )}
                      </div>
                      {message.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSavedTip(null);
                            setDraft({
                              question: questionFor(index),
                              answer: message.content,
                              category: categories[0] ?? title,
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#e5e5e5] px-2 py-1 text-[11px] font-bold text-[#777777] hover:border-[#58CC02] hover:text-[#58CC02]"
                        >
                          <BookmarkPlus size={12} />
                          追加为本章卡片
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {streaming && streamText && (
                <div className="mt-3 flex justify-start">
                  <div className="max-w-[88%] rounded-2xl bg-[#f7f7f7] px-3 py-2 text-sm text-[#3c3c3c]">
                    <StreamMarkdown content={streamText} />
                  </div>
                </div>
              )}

              {streaming && !streamText && (
                <p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#777777]">
                  <Loader2 size={14} className="animate-spin" /> 正在回答…
                </p>
              )}

              {draft && (
                <div className="mt-3 rounded-2xl border-2 border-[#FFC800] bg-[#FFFBF0] p-3">
                  <p className="text-xs font-extrabold text-[#8a6a00]">追加到本章文档</p>
                  <label className="mt-2 block text-[11px] font-bold text-[#777777]">
                    放入哪个小节
                    <select
                      value={draft.category}
                      onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#e5e5e5] bg-white px-2 py-1.5 text-xs font-bold text-[#3c3c3c] outline-none focus:border-[#58CC02]"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      <option value={title}>新建小节：{title}（章节末尾）</option>
                    </select>
                  </label>
                  <label className="mt-2 block text-[11px] font-bold text-[#777777]">
                    问题
                    <input
                      value={draft.question}
                      onChange={(event) => setDraft({ ...draft, question: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#e5e5e5] px-2 py-1.5 text-xs font-bold text-[#3c3c3c] outline-none focus:border-[#58CC02]"
                    />
                  </label>
                  <label className="mt-2 block text-[11px] font-bold text-[#777777]">
                    答案
                    <textarea
                      value={draft.answer}
                      onChange={(event) => setDraft({ ...draft, answer: event.target.value })}
                      rows={5}
                      className="mt-1 w-full resize-y rounded-lg border border-[#e5e5e5] px-2 py-1.5 text-xs text-[#3c3c3c] outline-none focus:border-[#58CC02]"
                    />
                  </label>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={saveDraft}
                      disabled={!draft.question.trim()}
                      className="rounded-xl bg-[#58CC02] px-3 py-1.5 text-xs font-extrabold text-white disabled:opacity-60"
                    >
                      确认追加
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraft(null)}
                      className="rounded-xl border border-[#e5e5e5] px-3 py-1.5 text-xs font-extrabold text-[#777777]"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {savedTip && (
                <p className="mt-3 flex items-center gap-1 rounded-xl bg-[#f0fff0] px-3 py-2 text-xs font-bold text-[#3f8f00]">
                  <Check size={13} />
                  {savedTip}
                </p>
              )}

              {error && (
                <p className="mt-3 rounded-xl bg-[#FFF1F2] px-3 py-2 text-xs font-bold text-[#e11d48]">{error}</p>
              )}
            </div>

            <div className="border-t border-[#e5e5e5] bg-[#fbfbfb] px-3 py-2">
              <LlmQuotaBadge
                quota={quota}
                loading={quotaLoading}
                error={quotaError}
                onRefresh={refreshQuota}
              />
            </div>

            <form onSubmit={send} className="border-t border-[#e5e5e5] p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                  rows={2}
                  disabled={locked}
                  placeholder={locked ? '今日额度已用完，明日再来' : '问本章的知识点，或直接提一个新的面试题'}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-[#e5e5e5] px-3 py-2 text-sm font-bold text-[#3c3c3c] outline-none focus:border-[#58CC02] disabled:bg-[#f4f4f4] disabled:text-[#999999]"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim() || locked}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#58CC02] text-white disabled:opacity-50"
                  aria-label="发送"
                >
                  {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => clearSession(key)}
                  aria-label="清空会话"
                  className="flex h-11 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5e5e5] text-[#999999] hover:text-[#e11d48]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
