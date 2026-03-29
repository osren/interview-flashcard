import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { useCardStore } from '@/store';
import { coreCards } from '@/data/core';
import { Badge, Button } from '@/components/ui';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { CardStatus, FlashCard } from '@/types';

export function CoreChapter() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();

  // 直接使用 useState 管理本地卡片状态
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { updateCardStatus } = useCardStore();

  // 加载章节卡片
  useEffect(() => {
    const chapterCards = coreCards.filter((c) => c.chapterId === chapterId);
    setCards(chapterCards);
    setCurrentIndex(0); // 重置到第一张
  }, [chapterId]);

  const currentCard = cards[currentIndex];

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  const handleStatusChange = (status: CardStatus) => {
    updateCardStatus(currentCard.id, status);
    // 自动下一题
    if (currentIndex < cards.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/core')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              <span>返回</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600"
            >
              <Home size={18} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="primary">{currentIndex + 1} / {cards.length}</Badge>
            <Badge variant="default">{currentCard.category}</Badge>
          </div>
        </div>

        {/* 章节标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
            {chapterId}
          </h1>
          <p className="text-gray-500">
            卡片 {currentIndex + 1} of {cards.length}
          </p>
        </div>

        {/* 卡片 */}
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FlashCardComponent
            card={currentCard}
            onStatusChange={handleStatusChange}
          />
        </motion.div>

        {/* 底部操作 */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={18} className="mr-1" />
            上一题
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
          >
            下一题
            <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
