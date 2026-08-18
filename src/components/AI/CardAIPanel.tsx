import { FormEvent, useEffect, useRef, useState } from 'react';
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
import { StreamMarkdown } from './StreamMarkdown';

export type CardAIMode = 'explain' | 'followup';

interface CardAIPanelProps {
  open: boolean;
  card: FlashCard;
  mode: CardAIMode;
  onClose: () => void;
}

export function CardAIPanel({ open, card, mode, onClose }: CardAIPanelProps) {
  const [content, setContent] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followup, setFollowup] = useState('');
  const historyRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef(false);
  const cardIdRef = useRef(card.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    abortRef.current = false;
    if (cardIdRef.current !== card.id) {
      cardIdRef.current = card.id;
    }
    void runInitial(mode);
    return () => {
      abortRef.current = true;
    };
  }, [open, card.id, mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, streaming]);

  const runStream = async (messages: ChatMessage[]) => {
    setStreaming(true);
    setError(null);
    setContent('');
    historyRef.current = messages;
    let assembled = '';

    try {
      for await (const chunk of streamLlm({
        messages,
        temperature: 0.5,
        max_tokens: 1200,
      })) {
        if (abortRef.current) break;
        assembled += chunk;
        setContent(assembled);
      }
      historyRef.current = [...messages, { role: 'assistant', content: assembled }];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 请求失败');
    } finally {
      setStreaming(false);
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
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
                disabled={streaming}
                className="flex-1 rounded-xl border-2 border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-[#1CB0F6]"
                placeholder="继续追问，例如：和 React 闭包陷阱有什么关系？"
              />
              <button
                type="submit"
                disabled={streaming || !followup.trim()}
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
