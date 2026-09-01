import { coreChapters, loadCoreChapterCards } from '@/data/core';
import { PageShell, SectionHeader, ChapterCard } from '@/components/ui';
import { BookOpen } from 'lucide-react';
import { useCardStore } from '@/store';
import { isRemembered, resolveCardStatus } from '@/utils/cardStatus';
import { useEffect, useState } from 'react';
import type { FlashCard } from '@/types';

export function CoreIndex() {
  const cardStatuses = useCardStore((state) => state.cardStatuses);
  const customCards = useCardStore((state) => state.customCards);
  const [cardsByChapter, setCardsByChapter] = useState<Record<string, FlashCard[]>>({});

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      coreChapters.map(async (chapter) => {
        const cards = await loadCoreChapterCards(chapter.id);
        return [chapter.id, cards] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      setCardsByChapter(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell>
      <SectionHeader
        icon={<BookOpen size={24} className="text-white" strokeWidth={2.5} />}
        title="前端基础核心考点"
        description="涵盖 JavaScript、HTML/CSS、React、Vue、浏览器、Webpack 等核心考点（含播面图解）"
      />

      <div className="grid gap-4">
        {coreChapters.map((chapter, index) => {
          const loaded = cardsByChapter[chapter.id] ?? [];
          const chapterCards = [
            ...loaded,
            ...customCards.filter((card) => card.module === 'core' && card.chapterId === chapter.id),
          ];
          const remembered = chapterCards.filter((card) =>
            isRemembered(resolveCardStatus(card.id, cardStatuses, card.status))
          ).length;
          return (
            <ChapterCard
              key={chapter.id}
              to={`/core/${chapter.id}`}
              title={chapter.title}
              description={chapter.description}
              icon={<span>{chapter.icon}</span>}
              cardCount={chapterCards.length || chapter.cardCount}
              rememberedCount={remembered}
              index={index}
            />
          );
        })}
      </div>
    </PageShell>
  );
}
