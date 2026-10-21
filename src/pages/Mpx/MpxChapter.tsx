import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { StudyReader } from '@/components/StudyReader';
import { useCardStore } from '@/store';
import { mpxCards, mpxChapters } from '@/data/mpx/mpx';
import { useCardStoreHydrated } from '@/hooks/useCardStoreHydrated';
import { Button } from '@/components/ui';
import { LazyMDEditor } from '@/components/ui/LazyMDEditor';
import type { FlashCard } from '@/types';

export function MpxChapter() {
  const { chapterId = '' } = useParams<{ chapterId: string }>();
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '' });
  const hydrated = useCardStoreHydrated();
  const customCards = useCardStore((state) => state.customCards);
  const getMergedCards = useCardStore((state) => state.getMergedCards);
  const addCustomCard = useCardStore((state) => state.addCustomCard);

  useEffect(() => {
    if (!hydrated || !chapterId) return;
    const chapterCards = mpxCards.filter((card) => card.chapterId === chapterId);
    setCards(getMergedCards('mpx', chapterId, chapterCards));
    setCardsLoaded(true);
  }, [chapterId, customCards, getMergedCards, hydrated]);

  const chapterTitle = mpxChapters.find((chapter) => chapter.id === chapterId)?.title || chapterId;

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !chapterId) return;
    addCustomCard({
      id: '',
      module: 'mpx',
      chapterId,
      question: newQuestion.question.trim(),
      answer: newQuestion.answer,
      tags: ['新增'],
      status: 'unvisited',
      category: chapterTitle,
    });
    setNewQuestion({ question: '', answer: '' });
    setIsAdding(false);
  };

  if (!hydrated || !cardsLoaded) {
    return <div className="min-h-screen app-bg flex items-center justify-center"><p className="text-ink-muted">加载中...</p></div>;
  }

  return (
    <>
      <StudyReader
        title={chapterTitle}
        subtitle="MPX 专项 · Markdown 阅读与单题收藏"
        backPath="/mpx"
        module="mpx"
        chapterId={chapterId}
        cards={cards}
        actions={<Button onClick={() => setIsAdding(true)} className="shrink-0 gap-1.5 px-2 sm:gap-2 sm:px-4"><Plus size={16} /><span className="hidden sm:inline">新增问题</span></Button>}
      />

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setIsAdding(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="surface-panel w-full max-w-lg p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="mb-4 text-lg font-display font-semibold text-ink">新增问题</h2>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-ink-secondary">
                  问题
                  <input value={newQuestion.question} onChange={(event) => setNewQuestion({ ...newQuestion, question: event.target.value })} className="input-field mt-1" placeholder="输入面试问题" autoFocus />
                </label>
                <label className="block text-sm font-medium text-ink-secondary">
                  回答
                  <LazyMDEditor value={newQuestion.answer} onChange={(value) => setNewQuestion({ ...newQuestion, answer: value || '' })} height={220} preview="edit" />
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => { setIsAdding(false); setNewQuestion({ question: '', answer: '' }); }}>取消</Button>
                <Button onClick={handleAddQuestion} disabled={!newQuestion.question.trim()}>保存</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
