import { mpxChapters } from '@/data/mpx/mpx';
import { PageShell, SectionHeader, ChapterCard } from '@/components/ui';
import { Rocket } from 'lucide-react';

export function MpxIndex() {
  return (
    <PageShell>
      <SectionHeader
        icon={<Rocket size={24} className="text-white" strokeWidth={2.5} />}
        title="MPX 专项"
        description="滴滴小程序框架 MPX 语法、架构、工程化学习"
      />

      <div className="grid gap-4">
        {mpxChapters.map((chapter, index) => {
          const mastered = Math.floor(Math.random() * chapter.cardCount);
          return (
            <ChapterCard
              key={chapter.id}
              to={`/mpx/${chapter.id}`}
              title={chapter.title}
              description={chapter.description}
              icon="🚀"
              cardCount={chapter.cardCount}
              masteredCount={mastered}
              accentColor="from-[#58CC02] to-[#46A302]"
              index={index}
            />
          );
        })}
      </div>
    </PageShell>
  );
}
