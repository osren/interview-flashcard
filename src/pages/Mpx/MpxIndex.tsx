import { mpxCards, mpxChapters } from '@/data/mpx/mpx';
import { PageShell, SectionHeader, ChapterCard } from '@/components/ui';
import { Rocket } from 'lucide-react';
import { useCardStore } from '@/store';
import { isRemembered, resolveCardStatus } from '@/utils/cardStatus';

export function MpxIndex() {
  const cardStatuses = useCardStore((state) => state.cardStatuses);
  const customCards = useCardStore((state) => state.customCards);

  return (
    <PageShell>
      <SectionHeader
        icon={<Rocket size={24} className="text-white" strokeWidth={2.5} />}
        title="MPX 专项"
        description="滴滴小程序框架 MPX 语法、架构、工程化学习"
      />

      <div className="grid gap-4">
        {mpxChapters.map((chapter, index) => {
          const chapterCards = [
            ...mpxCards.filter((card) => card.chapterId === chapter.id),
            ...customCards.filter((card) => card.module === 'mpx' && card.chapterId === chapter.id),
          ];
          const remembered = chapterCards.filter((card) =>
            isRemembered(resolveCardStatus(card.id, cardStatuses, card.status))
          ).length;
          return (
            <ChapterCard
              key={chapter.id}
              to={`/mpx/${chapter.id}`}
              title={chapter.title}
              description={chapter.description}
              icon={<span>{chapter.icon ?? ['🚀', '🏗️', '📘', '📗'][index] ?? '🚀'}</span>}
              cardCount={chapterCards.length}
              rememberedCount={remembered}
              index={index}
            />
          );
        })}
      </div>
    </PageShell>
  );
}
