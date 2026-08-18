import { coreCards, coreChapters } from '@/data/core';
import { PageShell, SectionHeader, ChapterCard } from '@/components/ui';
import { BookOpen } from 'lucide-react';
import { useCardStore } from '@/store';

export function CoreIndex() {
  const cardStatuses = useCardStore((state) => state.cardStatuses);
  const customCards = useCardStore((state) => state.customCards);

  return (
    <PageShell>
      <SectionHeader
        icon={<BookOpen size={24} className="text-white" strokeWidth={2.5} />}
        title="前端基础核心考点"
        description="涵盖 JavaScript、TypeScript、React、浏览器等核心知识"
      />

      <div className="grid gap-4">
        {coreChapters.map((chapter, index) => {
          const chapterCards = [
            ...coreCards.filter((card) => card.chapterId === chapter.id),
            ...customCards.filter((card) => card.module === 'core' && card.chapterId === chapter.id),
          ];
          const mastered = chapterCards.filter((card) => cardStatuses[card.id] === 'mastered').length;
          return (
            <ChapterCard
              key={chapter.id}
              to={`/core/${chapter.id}`}
              title={chapter.title}
              description={chapter.description}
              icon={<span>{chapter.icon}</span>}
              cardCount={chapterCards.length}
              masteredCount={mastered}
              index={index}
            />
          );
        })}
      </div>
    </PageShell>
  );
}
