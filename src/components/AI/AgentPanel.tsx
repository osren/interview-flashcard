import { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Loader2, Send, Sparkles, Wrench, X } from 'lucide-react';
import { useAgentChat } from '@/hooks/useAgentChat';
import { AGENT_SCOPE_LABEL } from '@/lib/agent/feature';
import { cn } from '@/utils/cn';
import { StreamMarkdown } from './StreamMarkdown';

interface AgentPanelProps {
  open: boolean;
  onClose: () => void;
}

const backdropTransition = { duration: 0.15, ease: [0.4, 0, 1, 1] as const };
const panelTransition = {
  enter: { type: 'spring' as const, stiffness: 420, damping: 36 },
  exit: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
};

const QUICK_PROMPTS = ['我整体投递情况怎么样', '我在 AI 面试的岗位有哪些', '字节跳动有什么岗位'];

export function AgentPanel({ open, onClose }: AgentPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    traces,
    pending,
    running,
    error,
    quota,
    send,
    confirmPending,
    dismissPending,
    reset,
  } = useAgentChat({ enabled: open });

  useEffect(() => {
    if (!open) return;
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [open, messages, traces, pending]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (running) return;
    const text = input.trim();
    if (!text) return;
    setInput('');
    void send(text);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40" aria-modal="true" role="dialog">
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
          >
            <header className="flex items-center gap-2 border-b border-[#e5e5e5] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#58CC02]/12 text-[#58CC02]">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-[#1f1f1f]">{AGENT_SCOPE_LABEL}</p>
                <p className="truncate text-xs font-bold text-[#777777]">
                  {quota ? `今日剩余 ${quota.remaining}/${quota.dailyLimit} 次` : '正在读取额度…'}
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg px-2 py-1 text-xs font-bold text-[#777777] hover:bg-[#f4f4f4]"
              >
                新对话
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
                    可以问我岗位、进度，也能帮你更新某个岗位的阶段（更新前会让你确认）。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setInput('');
                          void send(prompt);
                        }}
                        className="rounded-full border border-[#e5e5e5] px-3 py-1.5 text-xs font-bold text-[#3c3c3c] hover:border-[#58CC02] hover:text-[#58CC02]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
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
                  </div>
                ))}
              </div>

              {traces.length > 0 && (
                <div className="mt-3 space-y-1.5 rounded-xl border border-[#eef2f6] bg-[#fbfdff] px-3 py-2">
                  <p className="flex items-center gap-1 text-xs font-extrabold text-[#57707f]">
                    <Wrench size={12} /> 工具轨迹（{traces.length}）
                  </p>
                  {traces.map((trace, index) => (
                    <div key={`${trace.name}-${index}`} className="flex items-start gap-1.5 text-xs">
                      {trace.isError ? (
                        <AlertTriangle size={12} className="mt-0.5 shrink-0 text-[#e11d48]" />
                      ) : (
                        <Check size={12} className="mt-0.5 shrink-0 text-[#58CC02]" />
                      )}
                      <span className="font-bold text-[#1f1f1f]">{trace.name}</span>
                      <span className="min-w-0 flex-1 break-words text-[#777777]">{trace.summary}</span>
                    </div>
                  ))}
                </div>
              )}

              {pending && (
                <div className="mt-3 rounded-2xl border-2 border-[#FFC800] bg-[#FFFBF0] p-3">
                  <p className="text-xs font-extrabold text-[#8a6a00]">需要你确认的写操作</p>
                  <p className="mt-1 break-words text-sm font-bold text-[#1f1f1f]">
                    <code className="rounded bg-white px-1 py-0.5 text-xs">{pending.name}</code>
                    <span className="ml-2">{pending.summary}</span>
                  </p>
                  <p className="mt-1 break-words text-xs text-[#777777]">{JSON.stringify(pending.args)}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void confirmPending()}
                      disabled={running}
                      className="rounded-xl bg-[#58CC02] px-3 py-1.5 text-xs font-extrabold text-white disabled:opacity-60"
                    >
                      确认执行
                    </button>
                    <button
                      type="button"
                      onClick={dismissPending}
                      className="rounded-xl border border-[#e5e5e5] px-3 py-1.5 text-xs font-extrabold text-[#777777]"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {running && traces.every((trace) => trace.summary !== '执行中…') && (
                <p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#777777]">
                  <Loader2 size={14} className="animate-spin" /> 正在想…
                </p>
              )}

              {error && (
                <p className="mt-3 rounded-xl bg-[#FFF1F2] px-3 py-2 text-xs font-bold text-[#e11d48]">{error}</p>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-[#e5e5e5] p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      submit();
                    }
                  }}
                  rows={2}
                  placeholder="问岗位、问进度，或让我改某个岗位的阶段"
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-[#e5e5e5] px-3 py-2 text-sm font-bold text-[#3c3c3c] outline-none focus:border-[#58CC02]"
                />
                <button
                  type="submit"
                  disabled={running || !input.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#58CC02] text-white disabled:opacity-50"
                  aria-label="发送"
                >
                  {running ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
