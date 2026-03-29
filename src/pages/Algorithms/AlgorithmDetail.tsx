import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { useCardStore } from '@/store';
import { algorithmCards } from '@/data/algorithms';
import { Badge } from '@/components/ui';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { CardStatus } from '@/types';

export function AlgorithmDetail() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const {
    cards,
    currentIndex,
    setCards,
    next,
    prev,
    updateCardStatus,
  } = useCardStore();

  useEffect(() => {
    const typeCards = algorithmCards.filter((c) => c.chapterId === type);
    setCards(typeCards);
  }, [type, setCards]);

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
    if (currentIndex < cards.length - 1) {
      setTimeout(() => next(), 300);
    }
  };

  const typeLabels: Record<string, string> = {
    coding: '💻 手撕代码',
    concept: '📖 概念解释',
    scenario: '🎯 场景设计',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 pb-20 md:pb-0">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 safe-area-top">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/algorithms')}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">返回</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-gray-400 hover:text-gray-600"
            >
              <Home size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="text-xs">{currentIndex + 1} / {cards.length}</Badge>
            <Badge variant="default" className="text-xs hidden sm:inline">{typeLabels[type || '']}</Badge>
          </div>
        </div>
      </div>

      {/* 章节标题 */}
      <div className="pt-16 pb-2 text-center">
        <h1 className="text-lg font-bold text-gray-900">
          {typeLabels[type || '']}
        </h1>
      </div>

      {/* 桌面端：卡片区域 - 左侧按钮 + 卡片 + 右侧按钮 */}
      <div className="hidden md:flex items-center justify-center min-h-[calc(100vh-180px)] px-4">
        {/* 左侧按钮 */}
        <button
          onClick={prev}
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
          onClick={next}
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

      {/* 移动端：卡片 */}
      <div className="md:hidden flex items-center justify-center px-4 pt-2">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <FlashCardComponent
            card={currentCard}
            onStatusChange={handleStatusChange}
          />
        </motion.div>
      </div>

      {/* 移动端：底部导航栏 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200
              ${currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-white shadow-md border border-gray-200 text-gray-700 active:scale-95'}
            `}
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">上一题</span>
          </button>

          <span className="text-sm text-gray-500 font-medium">
            {currentIndex + 1} / {cards.length}
          </span>

          <button
            onClick={next}
            disabled={currentIndex === cards.length - 1}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200
              ${currentIndex === cards.length - 1
                ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-green-500 shadow-md text-white active:scale-95'}
            `}
          >
            <span className="text-sm font-medium">下一题</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
