import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { useCardStore } from '@/store';
import { coreCards } from '@/data/core';
import { Badge } from '@/components/ui';
import { ChevronLeft, ChevronRight, Home, X } from 'lucide-react';
import { CardStatus, FlashCard } from '@/types';

export function CoreChapter() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 直接使用 useState 管理本地卡片状态
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIndexPicker, setShowIndexPicker] = useState(false);
  const indexPickerRef = useRef<HTMLDivElement>(null);
  const { updateCardStatus, allCardProgress, saveChapterPosition, getChapterPosition, setLastVisitedCoreChapter } = useCardStore();

  // 点击外部关闭序号选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (indexPickerRef.current && !indexPickerRef.current.contains(event.target as Node)) {
        setShowIndexPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 加载章节卡片（带已保存的状态）
  useEffect(() => {
    const chapterCards = coreCards.filter((c) => c.chapterId === chapterId);
    // 恢复每个卡片已保存的状态
    const cardsWithStatus = chapterCards.map((card) => ({
      ...card,
      status: allCardProgress[card.id] || card.status,
    }));
    setCards(cardsWithStatus);

    // 如果 URL 有 cardIndex 参数，优先使用它
    const cardIndexParam = searchParams.get('cardIndex');
    if (cardIndexParam !== null) {
      const index = parseInt(cardIndexParam, 10);
      if (!isNaN(index) && index >= 0 && index < chapterCards.length) {
        setCurrentIndex(index);
      }
    } else {
      // 恢复保存的位置
      const savedIndex = getChapterPosition(chapterId || '');
      setCurrentIndex(savedIndex);
    }

    // 记录最后访问的章节
    if (chapterId) {
      setLastVisitedCoreChapter(chapterId);
    }
  }, [chapterId, allCardProgress, setLastVisitedCoreChapter, searchParams]);

  // 保存当前位置
  const handleIndexChange = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    if (chapterId) {
      saveChapterPosition(chapterId, newIndex);
    }
  }, [chapterId, saveChapterPosition]);

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
        handleIndexChange(currentIndex + 1);
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      handleIndexChange(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleIndexChange(currentIndex - 1);
    }
  };

  const handleJumpTo = (idx: number) => {
    if (idx >= 0 && idx < cards.length) {
      handleIndexChange(idx);
      setShowIndexPicker(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20 md:pb-0">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 safe-area-top">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/core')}
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
            {/* 移动端：可点击的序号 */}
            <div className="md:hidden relative" ref={indexPickerRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIndexPicker(!showIndexPicker);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
              >
                <span>{currentIndex + 1}</span>
                <span className="text-orange-400">/</span>
                <span>{cards.length}</span>
              </button>
              {/* 序号选择器弹窗 - 移动端 */}
              <AnimatePresence>
                {showIndexPicker && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowIndexPicker(false)}
                  >
                    <div
                      className="bg-white rounded-lg shadow-xl p-4 w-[85%] max-w-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">选择序号</span>
                        <button
                          onClick={() => setShowIndexPicker(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {cards.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleJumpTo(idx)}
                            className={`
                              py-2 text-sm rounded transition-colors
                              ${idx === currentIndex
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'}
                            `}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Badge variant="primary" className="text-xs hidden md:inline">{currentIndex + 1} / {cards.length}</Badge>
            <Badge variant="default" className="text-xs hidden sm:inline">{currentCard.category}</Badge>
          </div>
        </div>
      </div>

      {/* 章节标题 */}
      <div className="pt-16 pb-2 text-center">
        <h1 className="text-lg font-bold text-gray-900 capitalize">
          {chapterId}
        </h1>
        {/* 桌面端：序号选择器 */}
        <div className="hidden md:block relative mt-2" ref={indexPickerRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowIndexPicker(!showIndexPicker);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors text-lg font-medium"
          >
            <span>{currentIndex + 1}</span>
            <span className="text-orange-400">/</span>
            <span>{cards.length}</span>
          </button>
          {/* 序号选择器弹窗 - 桌面端 */}
          <AnimatePresence>
            {showIndexPicker && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setShowIndexPicker(false)}
              >
                <div
                  className="bg-white rounded-lg shadow-xl p-4 w-[85%] max-w-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">选择序号</span>
                    <button
                      onClick={() => setShowIndexPicker(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {cards.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleJumpTo(idx)}
                        className={`
                          py-2 text-sm rounded transition-colors
                          ${idx === currentIndex
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'}
                        `}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 桌面端：卡片区域 - 左侧按钮 + 卡片 + 右侧按钮 */}
      <div className="hidden md:flex items-center justify-center min-h-[calc(100vh-180px)] px-4">
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
            currentIndex={currentIndex}
            totalCards={cards.length}
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

      {/* 移动端：卡片 */}
      <div className="md:hidden flex flex-col items-center px-4 pt-2">
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
            currentIndex={currentIndex}
            totalCards={cards.length}
          />
        </motion.div>

        {/* 卡片下方导航按钮 */}
        <div className="flex items-center justify-center gap-8 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`
              flex items-center gap-1 px-4 py-2 rounded-full transition-all duration-200
              ${currentIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'bg-white shadow-md border border-gray-200 text-gray-700 active:scale-95'}
            `}
          >
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">上一题</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className={`
              flex items-center gap-1 px-4 py-2 rounded-full transition-all duration-200
              ${currentIndex === cards.length - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'bg-blue-500 shadow-md text-white active:scale-95'}
            `}
          >
            <span className="text-sm font-medium">下一题</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 移动端：底部导航栏 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={handlePrev}
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
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200
              ${currentIndex === cards.length - 1
                ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-blue-500 shadow-md text-white active:scale-95'}
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
