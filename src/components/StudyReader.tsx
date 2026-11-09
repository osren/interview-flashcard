import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpenText, CheckCircle2, Circle, Heart, Home, List, Loader2, MessageCircleQuestion, Sparkles } from 'lucide-react';
import type { FlashCard, ModuleType } from '@/types';
import { useCardStore } from '@/store';
import { mergeChapterCards } from '@/utils/cardMerge';
import { studyChatBusyKey, useChatBusyStore } from '@/store/useChatBusyStore';
import { resolveCardStatus } from '@/utils/cardStatus';
import { ImportExportModal } from '@/components/ImportExportModal';
import { LazyMDMarkdown } from '@/components/ui/LazyMDEditor';
import { buildStudyMarkdown, type StudyOutlineSection } from '@/utils/studyMarkdown';
import { CardAIPanel, type CardAIMode } from '@/components/AI/CardAIPanel';
import { StudyChatPanel } from '@/components/AI/StudyChatPanel';
import { LoginModal, useAuth } from '@/components/Auth';

interface StudyReaderProps {
  title: string;
  subtitle?: string;
  backPath: string;
  module: ModuleType;
  chapterId: string;
  cards: FlashCard[];
  actions?: ReactNode;
  /** 项目背景资料，透传给 AI 面板作为回答依据 */
  projectContext?: string;
}

function StudyOutline({
  sections,
  favorites,
  onToggleFavorite,
  getStatus,
  onToggleStatus,
}: {
  sections: StudyOutlineSection[];
  favorites: FlashCard[];
  onToggleFavorite: (card: FlashCard) => void;
  getStatus: (card: FlashCard) => FlashCard['status'];
  onToggleStatus: (card: FlashCard) => void;
}) {
  const favoriteIds = new Set(favorites.map((card) => card.id));

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <section key={`${section.headingId}-${section.category}`} className="min-w-0">
          <a href={`#${section.headingId}`} className="mb-1.5 flex items-center gap-2 rounded-lg bg-[#f8f3ec] px-2.5 py-2 text-sm font-extrabold text-[#98602a] transition hover:bg-[#f3eadc]">
            {section.category}
          </a>
          <ul className="space-y-0.5">
            {section.questions.map(({ card, number, headingId }) => {
              const isFavorite = favoriteIds.has(card.id);
              const status = getStatus(card);
              return (
                <li key={card.id} className="group flex min-w-0 items-start gap-1 rounded-lg px-1 py-1 transition hover:bg-[#f8f3ec]">
                  <a
                    href={`#${headingId}`}
                    className="min-w-0 flex-1 py-1 text-sm leading-5 text-stone-600 transition hover:text-[#98602a] line-clamp-2"
                    title={card.question}
                  >
                    <span className="mr-1 font-semibold text-[#b87935]">{number}.</span>{card.question}
                  </a>
                  <div className="flex shrink-0 items-center gap-0.5">
                      <button type="button" onClick={() => onToggleStatus(card)} className="grid h-8 w-7 place-items-center rounded-md text-stone-400 transition hover:bg-white" title={status === 'remembered' ? '已掌握，点击改为待复习' : status === 'review' ? '待复习，点击清除标记' : '未标记，点击标为已掌握'} aria-label={`更新掌握状态：${card.question}`}>
                        {status === 'remembered'
                          ? <CheckCircle2 size={17} strokeWidth={2.4} className="text-[#58CC02]" />
                          : <Circle size={17} strokeWidth={2} className={status === 'review' ? 'text-amber-500' : 'text-stone-400'} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(card)}
                        className="grid h-8 w-7 place-items-center rounded-md text-stone-400 transition hover:bg-white hover:text-rose-500"
                        aria-label={isFavorite ? `取消收藏：${card.question}` : `收藏问题：${card.question}`}
                        title={isFavorite ? '取消收藏' : '收藏问题'}
                      >
                        <Heart size={17} strokeWidth={2} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
                      </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function StudyReader({
  title,
  subtitle,
  backPath,
  module,
  chapterId,
  cards,
  actions,
  projectContext,
}: StudyReaderProps) {
  const favorites = useCardStore((state) => state.favorites);
  const toggleFavorite = useCardStore((state) => state.toggleFavorite);
  const cardStatuses = useCardStore((state) => state.cardStatuses);
  const updateCardStatus = useCardStore((state) => state.updateCardStatus);
  const customCards = useCardStore((state) => state.customCards);
  // 闭环兜底：AI 追加的卡片即使页面自己还没重算，也会立刻出现在阅读区
  const chapterCards = useMemo(
    () => mergeChapterCards(cards, customCards, module, chapterId),
    [cards, customCards, module, chapterId]
  );
  const document = useMemo(() => buildStudyMarkdown(title, chapterCards), [title, chapterCards]);
  const favoriteCardIds = useMemo(() => new Set(favorites.map((card) => card.id)), [favorites]);
  const headingCount = document.markdown.match(/^#{1,4}\s+.+$/gm)?.length ?? 0;
  const characterCount = document.markdown.replace(/\s/g, '').length;

  // Markdown 阅读模式下的 AI 入口：按标题 id / 题号把 h3 对回具体卡片
  const { user } = useAuth();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiCard, setAiCard] = useState<FlashCard | null>(null);
  const [aiMode, setAiMode] = useState<CardAIMode>('explain');
  const [loginOpen, setLoginOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatBusy = useChatBusyStore((state) => state.busy[studyChatBusyKey(module, chapterId)] ?? false);

  const openChat = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setChatOpen(true);
  };

  const cardByHeading = useMemo(() => {
    const map = new Map<string, FlashCard>();
    for (const section of document.sections) {
      for (const question of section.questions) {
        map.set(question.headingId, question.card);
      }
    }
    return map;
  }, [document]);

  const cardByNumber = useMemo(() => {
    const map = new Map<number, FlashCard>();
    for (const section of document.sections) {
      for (const question of section.questions) {
        map.set(question.number, question.card);
      }
    }
    return map;
  }, [document]);

  const openAi = (card: FlashCard, mode: CardAIMode) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setAiMode(mode);
    setAiCard(card);
    setAiOpen(true);
  };

  const renderH3Action = (headingId: string, text: string): ReactNode => {
    const matched =
      cardByHeading.get(headingId) ??
      cardByNumber.get(Number(text.match(/^(\d+)\./)?.[1] ?? 0));
    if (!matched) return null;
    return (
      <span className="ml-2 inline-flex shrink-0 translate-y-[-2px] items-center gap-1 align-middle">
        <button
          type="button"
          onClick={() => openAi(matched, 'explain')}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-extrabold leading-none text-[#1CB0F6] hover:bg-[#f0f9ff]"
        >
          <Sparkles size={12} />
          AI 解释
        </button>
        <button
          type="button"
          onClick={() => openAi(matched, 'followup')}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-extrabold leading-none text-[#58CC02] hover:bg-[#f0fff0]"
        >
          <MessageCircleQuestion size={12} />
          AI 追问
        </button>
      </span>
    );
  };

  const panelCard = aiCard ?? chapterCards[0] ?? null;

  const toggleStatus = (card: FlashCard) => {
    const status = resolveCardStatus(card.id, cardStatuses, card.status);
    updateCardStatus(card.id, status === 'unvisited' ? 'remembered' : status === 'remembered' ? 'review' : 'unvisited');
  };
  const getStatus = (card: FlashCard) => resolveCardStatus(card.id, cardStatuses, card.status);

  return (
    <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-y-auto app-bg lg:h-[100dvh]">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5">
          <Link to={backPath} className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-bold text-sky-600 hover:bg-stone-100">
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">返回</span>
          </Link>
          <Link to="/" className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700" aria-label="返回首页">
            <Home size={17} />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-sm font-extrabold text-stone-800 sm:text-base">{title}</h1>
            <p className="hidden truncate text-[11px] text-stone-500 sm:block">{subtitle || 'Markdown 阅读 · 收藏题目后可在收藏页翻卡复习'}</p>
          </div>
          <button
            type="button"
            onClick={openChat}
            className={
              chatBusy
                ? "flex shrink-0 items-center gap-1.5 rounded-xl border border-[#FF9600] bg-[#FFF7ED] px-2 py-1.5 text-xs font-extrabold text-[#FF9600] sm:px-3 sm:text-sm"
                : "flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200 px-2 py-1.5 text-xs font-extrabold text-[#1CB0F6] transition hover:border-[#1CB0F6] hover:bg-[#f0f9ff] sm:px-3 sm:text-sm"
            }
            title={chatBusy ? '本章对话正在后台生成，点开查看进度' : '围绕本章提问，满意的回答可追加到本章文档'}
          >
            {chatBusy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span className="hidden sm:inline">{chatBusy ? '生成中…' : 'AI 对话'}</span>
          </button>
          {actions}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-7">
        <div className="mb-4 flex items-center gap-2 text-xs text-stone-500">
          <BookOpenText size={15} className="text-[#58CC02]" />
          <span>{chapterCards.length} 道问题</span>
          <span>·</span>
          <span>点击大纲跳转，点红心收藏单题</span>
        </div>

        <details className="mb-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm lg:hidden">
          <summary className="cursor-pointer list-none text-sm font-bold text-stone-700">
            本章大纲 <span className="ml-1 text-xs font-normal text-stone-400">{chapterCards.length} 道题</span>
          </summary>
          <div className="mt-3 max-h-[55vh] overflow-y-auto border-t border-stone-100 pt-3">
            <StudyOutline sections={document.sections} favorites={favorites} onToggleFavorite={toggleFavorite} getStatus={getStatus} onToggleStatus={toggleStatus} />
          </div>
        </details>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-7">
          <main className="min-w-0">
            {chapterCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-sm text-stone-500">
                当前章节还没有问题，可以从左侧导入 Markdown 问答。
              </div>
            ) : (
              <article className="min-w-0 rounded-2xl border border-stone-200 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-9 lg:px-12">
                <LazyMDMarkdown
                  source={document.markdown}
                  h3Action={renderH3Action}
                  className="study-reader-markdown prose prose-stone max-w-none prose-headings:font-extrabold prose-h1:mb-8 prose-h1:border-b prose-h1:border-stone-100 prose-h1:pb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-stone-100 prose-h2:pb-3 prose-h2:text-xl prose-h3:mt-8 prose-h3:scroll-mt-24 prose-h3:text-lg prose-h4:mt-5 prose-h4:text-base prose-p:leading-8 prose-li:leading-8 prose-a:text-sky-700 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-stone-900 prose-code:text-rose-700"
                />
              </article>
            )}
          </main>

          <aside className="sticky top-16 hidden min-w-0 space-y-4 lg:block">
            <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 border-b border-stone-100 pb-3 text-sm font-extrabold text-stone-800">
                <List size={16} className="text-[#b87935]" />
                本章大纲
                <span className="ml-auto text-[11px] font-medium text-stone-400">H1–H4</span>
              </div>
              <nav aria-label="本章大纲" className="space-y-1 pr-1">
                <StudyOutline sections={document.sections} favorites={favorites} onToggleFavorite={toggleFavorite} getStatus={getStatus} onToggleStatus={toggleStatus} />
              </nav>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-stone-800">
                <BookOpenText size={16} className="text-[#b87935]" />
                阅读概况
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-stone-500"><span>标题层级</span><span className="font-semibold text-stone-800">{headingCount}</span></div>
                <div className="flex items-center justify-between text-stone-500"><span>字符数</span><span className="font-semibold text-stone-800">{characterCount.toLocaleString('zh-CN')}</span></div>
                <div className="flex items-center justify-between text-stone-500"><span>已收藏题目</span><span className="font-semibold text-stone-800">{chapterCards.filter((card) => favoriteCardIds.has(card.id)).length}</span></div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <ImportExportModal cards={chapterCards} module={module} chapterId={chapterId} title={title} />

      {panelCard && (
        <CardAIPanel
          open={aiOpen}
          card={panelCard}
          mode={aiMode}
          onClose={() => setAiOpen(false)}
          projectContext={projectContext}
        />
      )}
      <StudyChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        module={module}
        chapterId={chapterId}
        title={title}
        cards={chapterCards}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
