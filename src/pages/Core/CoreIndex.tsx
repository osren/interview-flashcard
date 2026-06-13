import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coreChapters } from '@/data/core';
import { PageShell, SectionHeader, ChapterCard } from '@/components/ui';
import { BookOpen } from 'lucide-react';
import { useCardStore } from '@/store';

export function CoreIndex() {
  const navigate = useNavigate();
  const { lastVisitedCoreChapter } = useCardStore();

  useEffect(() => {
    const shouldRedirect = sessionStorage.getItem('from_core_detail') === 'true';
    sessionStorage.removeItem('from_core_detail');

    if (shouldRedirect && lastVisitedCoreChapter) {
      navigate(`/core/${lastVisitedCoreChapter}`, { replace: true });
    }
  }, [lastVisitedCoreChapter, navigate]);

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
