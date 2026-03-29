import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { useCardStore } from '@/store';
import { coreCards } from '@/data/core';
import { Badge } from '@/components/ui';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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
      </div>

      {/* 章节标题 */}
      <div className="pt-24 pb-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
          {chapterId}
        </h1>
        <p className="text-gray-500">
          卡片 {currentIndex + 1} of {cards.length}
        </p>
      </div>

      {/* 卡片区域 - 左侧按钮 + 卡片 + 右侧按钮 */}
      <div className="flex items-center justify-center min-h-[calc(100vh-180px)] px-4">
        {/* 左侧按钮 */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`
            flex-shrink-0 w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200
            flex items-center justify-center transition-all duration-200
            ${currentIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-gray-50 hover:scale-105 active:scale-95'}
          `}
        >
          <ChevronLeft size={28} className="text-gray-600" />
        </button>

        {/* 卡片 */}
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-6 flex-shrink-0"
        >
          <FlashCardComponent
            card={currentCard}
            onStatusChange={handleStatusChange}
          />
        </motion.div>

        {/* 右侧按钮 */}
        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className={`
            flex-shrink-0 w-14 h-14 rounded-full bg-white shadow-lg border border-gray-200
            flex items-center justify-center transition-all duration-200
            ${currentIndex === cards.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-gray-50 hover:scale-105 active:scale-95'}
          `}
        >
          <ChevronRight size={28} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
