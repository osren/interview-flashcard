import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  ChevronDown,
  Clipboard,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PageShell, SectionHeader } from '@/components/ui';
import {
  handbookGroups,
  handbookItems,
  type HandbookCategory,
  type HandbookItem,
} from '@/data/llm-handbook';
import { cn } from '@/utils/cn';

interface ToastState {
  message: string;
  password?: string;
  variant: 'success' | 'fallback';
}

function copyPasswordSync(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText =
      'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;opacity:0;';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (ok) return true;
  } catch {
    // fall through to async clipboard API
  }
  return false;
}

async function copyPassword(text: string): Promise<boolean> {
  if (copyPasswordSync(text)) return true;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

function HandbookCard({
  item,
  onOpen,
}: {
  item: HandbookItem;
  onOpen: (item: HandbookItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="surface-card w-full text-left p-5 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58CC02] focus-visible:ring-offset-2"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden>
            📒
          </span>
          <div className="min-w-0">
            <h3 className="font-extrabold text-[#3c3c3c] group-hover:text-[#58CC02] transition-colors leading-snug">
              {item.title}
            </h3>
            <p className="text-sm text-[#afafaf] font-semibold mt-1">
              点击访问飞书文档
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#777777] bg-[#f7f7f7] group-hover:bg-[#f0fde4] group-hover:text-[#46A302] transition-colors">
            <Clipboard size={14} />
            密码自动复制
          </span>
          <ExternalLink
            size={18}
            className="text-[#afafaf] group-hover:text-[#58CC02] transition-colors"
          />
        </div>
      </div>
    </button>
  );
}

export function LLMHandbookPage() {
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [collapsed, setCollapsed] = useState<Record<HandbookCategory, boolean>>({
    basic: false,
    project: false,
    interview: false,
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: ToastState) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(next);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return handbookItems;
    return handbookItems.filter((item) => item.title.toLowerCase().includes(q));
  }, [query]);

  const groupedItems = useMemo(() => {
    return handbookGroups.map((group) => ({
      ...group,
      items: filteredItems.filter((item) => item.category === group.id),
    }));
  }, [filteredItems]);

  const handleOpen = useCallback(
    async (item: HandbookItem) => {
      // Must copy before window.open — opening a new tab consumes the user gesture
      const copied = await copyPassword(item.password);
      window.open(item.url, '_blank', 'noopener,noreferrer');

      if (copied) {
        showToast({
          message: '已自动复制密码',
          password: item.password,
          variant: 'success',
        });
      } else {
        showToast({
          message: '无法自动复制，请手动复制密码',
          password: item.password,
          variant: 'fallback',
        });
      }
    },
    [showToast]
  );

  const toggleGroup = (id: HandbookCategory) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalVisible = filteredItems.length;

  return (
    <PageShell maxWidth="lg">
      <SectionHeader
        icon={<Bot size={24} className="text-white" strokeWidth={2.5} />}
        title="大模型开发手册"
        description="大模型应用开发资源导航 · 点击卡片打开飞书文档，密码自动复制到剪贴板"
      />

      <div className="surface-panel px-4 py-3 mb-6 flex items-start gap-3">
        <span className="text-lg flex-shrink-0" aria-hidden>
          💡
        </span>
        <p className="text-sm font-semibold text-[#777777] leading-relaxed">
          点击任意卡片，密码会自动复制。切换到新标签页后按{' '}
          <kbd className="px-1.5 py-0.5 rounded-md bg-[#f7f7f7] border border-[#e5e5e5] text-[#4b4b4b] text-xs font-bold">
            Ctrl+V
          </kbd>{' '}
          粘贴即可进入文档。
        </p>
      </div>

      <div className="relative mb-8">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#afafaf]"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索手册名称..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[#e5e5e5] border-b-4 bg-white font-semibold text-[#4b4b4b] placeholder:text-[#afafaf] focus:outline-none focus:border-[#58CC02] transition-colors"
        />
      </div>

      {totalVisible === 0 ? (
        <div className="text-center py-16 surface-panel">
          <p className="text-[#777777] font-extrabold">没有找到匹配的手册</p>
          <p className="text-[#afafaf] text-sm mt-1 font-semibold">试试其他关键词</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedItems.map((group, groupIndex) => {
            if (group.items.length === 0) return null;
            const isCollapsed = collapsed[group.id];

            return (
              <motion.section
                key={group.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.06 }}
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between gap-3 mb-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl" aria-hidden>
                      {group.icon}
                    </span>
                    <div className="text-left min-w-0">
                      <h2 className="text-lg font-extrabold text-[#3c3c3c] group-hover:text-[#58CC02] transition-colors">
                        {group.title}
                      </h2>
                      <p className="text-sm text-[#afafaf] font-semibold truncate">
                        {group.description} · {group.items.length} 篇
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={cn(
                      'text-[#afafaf] flex-shrink-0 transition-transform duration-200',
                      isCollapsed && '-rotate-90'
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-3 pb-1">
                        {group.items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <HandbookCard item={item} onOpen={handleOpen} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]"
          >
            <div
              className={cn(
                'flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-b-4 shadow-lg font-bold text-sm',
                toast.variant === 'success'
                  ? 'bg-white border-[#58CC02] text-[#3c3c3c]'
                  : 'bg-white border-[#FFC800] text-[#3c3c3c]'
              )}
            >
              {toast.variant === 'success' ? (
                <CheckCircle2 size={20} className="text-[#58CC02] flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-[#FFC800] flex-shrink-0" />
              )}
              <span>{toast.message}</span>
              {toast.password && (
                <code className="px-2 py-0.5 rounded-lg bg-[#f7f7f7] border border-[#e5e5e5] font-mono text-[#46A302] text-xs">
                  {toast.password}
                </code>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
