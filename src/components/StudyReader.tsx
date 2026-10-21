import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpenText, CheckCircle2, Circle, Heart, Home } from 'lucide-react';
import type { FlashCard, ModuleType } from '@/types';
import { useCardStore } from '@/store';
import { resolveCardStatus } from '@/utils/cardStatus';
import { ImportExportModal } from '@/components/ImportExportModal';
import { LazyMDMarkdown } from '@/components/ui/LazyMDEditor';
import { buildStudyMarkdown, type StudyOutlineSection } from '@/utils/studyMarkdown';

interface StudyReaderProps {
  title: string;
  subtitle?: string;
  backPath: string;
  module: ModuleType;
  chapterId: string;
  cards: FlashCard[];
  actions?: ReactNode;
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
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={`${section.headingId}-${section.category}`}>
          <a href={`#${section.headingId}`} className="block px-2 py-1.5 text-xs font-extrabold text-stone-500 hover:text-stone-800">
            {section.category}
          </a>
          <ul className="space-y-1">
            {section.questions.map(({ card, number, headingId }) => {
              const isFavorite = favoriteIds.has(card.id);
              const status = getStatus(card);
              return (
                <li key={card.id} className="group flex min-w-0 items-start gap-1 rounded-lg px-1 py-1 hover:bg-stone-100">
                  <a
                    href={`#${headingId}`}
                    className="min-w-0 flex-1 py-1 text-xs leading-5 text-stone-600 hover:text-stone-950"
                    title={card.question}
                  >
                    <span className="mr-1 text-stone-400">{number}.</span>
                    <span className="line-clamp-2">{card.question}</span>
                  </a>
                  <button type="button" onClick={() => onToggleStatus(card)} className="mt-1 shrink-0 rounded p-0.5" title={status === 'remembered' ? '已掌握，点击改为待复习' : status === 'review' ? '待复习，点击清除标记' : '未标记，点击标为已掌握'} aria-label={`更新掌握状态：${card.question}`}>
                    {status === 'remembered'
                      ? <CheckCircle2 size={14} className="text-[#58CC02]" />
                      : <Circle size={14} className={status === 'review' ? 'text-amber-500' : 'text-stone-300'} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(card)}
                    className="mt-0.5 shrink-0 rounded-md p-1 text-stone-400 transition hover:bg-rose-50 hover:text-rose-500"
                    aria-label={isFavorite ? `取消收藏：${card.question}` : `收藏问题：${card.question}`}
                    title={isFavorite ? '取消收藏' : '收藏问题'}
                  >
                    <Heart size={15} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
                  </button>
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
}: StudyReaderProps) {
  const favorites = useCardStore((state) => state.favorites);
  const toggleFavorite = useCardStore((state) => state.toggleFavorite);
  const cardStatuses = useCardStore((state) => state.cardStatuses);
  const updateCardStatus = useCardStore((state) => state.updateCardStatus);
  const document = useMemo(() => buildStudyMarkdown(title, cards), [title, cards]);

  const toggleStatus = (card: FlashCard) => {
    const status = resolveCardStatus(card.id, cardStatuses, card.status);
    updateCardStatus(card.id, status === 'unvisited' ? 'remembered' : status === 'remembered' ? 'review' : 'unvisited');
  };
  const getStatus = (card: FlashCard) => resolveCardStatus(card.id, cardStatuses, card.status);

  return (
    <div className="min-h-screen app-bg">
      <header className="sticky top-14 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-sm lg:top-0">
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
          {actions}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-7">
        <div className="mb-4 flex items-center gap-2 text-xs text-stone-500">
          <BookOpenText size={15} className="text-[#58CC02]" />
          <span>{cards.length} 道问题</span>
          <span>·</span>
          <span>点击大纲跳转，点红心收藏单题</span>
        </div>

        <details className="mb-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm lg:hidden">
          <summary className="cursor-pointer list-none text-sm font-bold text-stone-700">
            本章大纲 <span className="ml-1 text-xs font-normal text-stone-400">{cards.length} 道题</span>
          </summary>
          <div className="mt-3 max-h-[55vh] overflow-y-auto border-t border-stone-100 pt-3">
            <StudyOutline sections={document.sections} favorites={favorites} onToggleFavorite={toggleFavorite} getStatus={getStatus} onToggleStatus={toggleStatus} />
          </div>
        </details>

        <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="sticky top-16 hidden max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-3 shadow-sm lg:block">
            <div className="mb-2 px-2 text-xs font-extrabold uppercase tracking-wide text-stone-400">本章大纲</div>
            <StudyOutline sections={document.sections} favorites={favorites} onToggleFavorite={toggleFavorite} getStatus={getStatus} onToggleStatus={toggleStatus} />
          </aside>

          <main className="min-w-0">
            {cards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-sm text-stone-500">
                当前章节还没有问题，可以从左侧导入 Markdown 问答。
              </div>
            ) : (
              <article className="min-w-0 rounded-2xl border border-stone-200 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-9 lg:px-12">
                <LazyMDMarkdown
                  source={document.markdown}
                  className="study-reader-markdown prose prose-stone max-w-none prose-headings:font-extrabold prose-h1:mb-8 prose-h1:border-b prose-h1:border-stone-100 prose-h1:pb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-stone-100 prose-h2:pb-3 prose-h2:text-xl prose-h3:mt-8 prose-h3:scroll-mt-24 prose-h3:text-lg prose-h4:mt-5 prose-h4:text-base prose-p:leading-8 prose-li:leading-8 prose-a:text-sky-700 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-stone-900 prose-code:text-rose-700"
                />
              </article>
            )}
          </main>
        </div>
      </div>

      <ImportExportModal cards={cards} module={module} chapterId={chapterId} title={title} />
    </div>
  );
}
