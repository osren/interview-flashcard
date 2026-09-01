import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { ImportExportModal } from '@/components/ImportExportModal';
import { ChapterLayout } from '@/components/Layout/ChapterLayout';
import { useCardStore } from '@/store';
import { coreCards, coreChapters } from '@/data/core';
import { useCardStoreHydrated } from '@/hooks/useCardStoreHydrated';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import { CardStatus, FlashCard } from '@/types';
import { findFirstUnrememberedIndex } from '@/utils/cardStatus';
import MDEditor from '@uiw/react-md-editor';

export function CoreChapter() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const enteredChapterRef = useRef<string | null>(null);
  const { updateCardStatus, getMergedCards, saveCardProgress, getCardProgress, addCustomCard } = useCardStore();
  const hydrated = useCardStoreHydrated();
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '' });

  useEffect(() => {
    if (!hydrated || !chapterId) return;
    const chapterCards = coreCards.filter((c) => c.chapterId === chapterId);
    const mergedCards = getMergedCards('core', chapterId, chapterCards);
    setCards(mergedCards);

    if (enteredChapterRef.current !== chapterId) {
      enteredChapterRef.current = chapterId;
      const { cardStatuses } = useCardStore.getState();
      const initialIndex = findFirstUnrememberedIndex(mergedCards, cardStatuses);
      setCurrentIndex(Math.min(initialIndex, Math.max(mergedCards.length - 1, 0)));
    }
  }, [chapterId, hydrated, getMergedCards]);

  useEffect(() => {
    if (cards.length > 0 && chapterId) {
      saveCardProgress('core', chapterId, currentIndex);
    }
  }, [currentIndex, chapterId]);

  const currentCard = cards[currentIndex];
  const chapterTitle = coreChapters.find(c => c.id === chapterId)?.title || chapterId || '';

  if (!currentCard) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <p className="text-ink-muted">加载中...</p>
      </div>
    );
  }

  const handleJumpTo = (idx: number) => {
    if (idx >= 0 && idx < cards.length) {
      setCurrentIndex(idx);
    }
  };

  const handleStatusChange = (status: CardStatus) => {
    updateCardStatus(currentCard.id, status);
    setCards((prev) =>
      prev.map((card) => (card.id === currentCard.id ? { ...card, status } : card))
    );
    if (currentIndex < cards.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.question.trim() && chapterId) {
      addCustomCard({
        id: '',
        module: 'core',
        chapterId,
        question: newQuestion.question,
        answer: newQuestion.answer,
        tags: ['新增'],
        status: 'unvisited',
      });
      setNewQuestion({ question: '', answer: '' });
      setIsAdding(false);
      const chapterCards = coreCards.filter((c) => c.chapterId === chapterId);
      const mergedCards = getMergedCards('core', chapterId, chapterCards);
      setCards(mergedCards);
      setCurrentIndex(mergedCards.length - 1);
    }
  };

  return (
    <>
      <ChapterLayout
        backPath="/core"
        chapterTitle={chapterTitle}
        category={currentCard.category}
        onPrev={() => currentIndex > 0 && setCurrentIndex((p) => p - 1)}
        onNext={() => currentIndex < cards.length - 1 && setCurrentIndex((p) => p + 1)}
        canPrev={currentIndex > 0}
        canNext={currentIndex < cards.length - 1}
        footer={
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus size={18} />
            新增问题
          </Button>
        }
      >
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FlashCardComponent
            card={currentCard}
            onStatusChange={handleStatusChange}
            currentIndex={currentIndex}
            totalCards={cards.length}
            onJumpTo={handleJumpTo}
            chapterCards={cards}
            showEdit
          />
        </motion.div>
      </ChapterLayout>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsAdding(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="surface-panel w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-display font-semibold text-ink mb-4">新增问题</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-1">问题</label>
                  <input
                    type="text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="input-field"
                    placeholder="输入面试问题"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-1">回答</label>
                  <MDEditor
                    value={newQuestion.answer}
                    onChange={(val) => setNewQuestion({ ...newQuestion, answer: val || '' })}
                    height={200}
                    preview="edit"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => { setIsAdding(false); setNewQuestion({ question: '', answer: '' }); }}>
                  取消
                </Button>
                <Button onClick={handleAddQuestion} disabled={!newQuestion.question.trim()}>
                  保存
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImportExportModal
        cards={cards}
        module="core"
        chapterId={chapterId || ''}
        title={chapterTitle}
      />
    </>
  );
}
