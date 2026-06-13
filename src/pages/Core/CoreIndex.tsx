import { coreChapters } from '@/data/core';
import { PageShell, SectionHeader, ChapterCard } from '@/components/ui';
import { BookOpen } from 'lucide-react';

export function CoreIndex() {
  return (
    <PageShell>
      <SectionHeader
        icon={<BookOpen size={24} className="text-white" strokeWidth={2.5} />}
        title="前端基础核心考点"
        description="涵盖 JavaScript、TypeScript、React、浏览器等核心知识"
      />

      <div className="grid gap-4">
        {coreChapters.map((chapter, index) => {
          const mastered = Math.floor(Math.random() * chapter.cardCount);
          return (
            <ChapterCard
              key={chapter.id}
              to={`/core/${chapter.id}`}
              title={chapter.title}
              description={chapter.description}
              icon={<span>{chapter.icon}</span>}
              cardCount={chapter.cardCount}
              masteredCount={mastered}
              index={index}
            />
          );
        })}
      </div>
    </PageShell>
  );
}
