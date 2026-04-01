import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { useCardStore } from '@/store';
import { algorithmCards } from '@/data/algorithms';
import { Badge } from '@/components/ui';
import { ChevronLeft, ChevronRight, Home, X } from 'lucide-react';
import { CardStatus, FlashCard } from '@/types';

export function AlgorithmDetail() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  // 本地状态管理
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIndexPicker, setShowIndexPicker] = useState(false);
  const indexPickerRef = useRef<HTMLDivElement>(null);
  const { updateCardStatus, getMergedCards, saveCardProgress, getCardProgress } = useCardStore();

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

  useEffect(() => {
    const typeCards = algorithmCards.filter((c) => c.chapterId === type);
    const merged = getMergedCards('algorithms', type || '', typeCards);
    setCards(merged);
    // 恢复保存的进度
    const savedIndex = getCardProgress('algorithms', type || '');
    setCurrentIndex(Math.min(savedIndex, merged.length - 1));
  }, [type]);

  // 保存进度
  useEffect(() => {
    if (cards.length > 0 && type) {
      saveCardProgress('algorithms', type, currentIndex);
    }
  }, [currentIndex, type]);

  const handleJumpTo = (idx: number) => {
    if (idx >= 0 && idx < cards.length) {
      setCurrentIndex(idx);
      setShowIndexPicker(false);
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
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    }
  };

  const typeLabels: Record<string, string> = {
    coding: '💻 手撕代码',
    concept: '📖 概念解释',
    scenario: '🎯 场景设计',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 flex flex-col pt-20">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/algorithms')}
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
          <div className="flex items-center gap-3">
            <Badge variant="default">{typeLabels[type || ''] || type}</Badge>
          </div>
        </div>
      </div>

      {/* 章节标题 */}
      <div className="py-1 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-0.5">
          {typeLabels[type || '']}
        </h1>
        {/* 可点击的序号显示 - 移到这里避免触发卡片翻转 */}
        <div className="relative inline-flex" ref={indexPickerRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowIndexPicker(!showIndexPicker);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors text-base font-medium"
          >
            <span>{currentIndex + 1}</span>
            <span className="text-green-400">/</span>
            <span>{cards.length}</span>
          </button>
          {/* 序号选择器弹窗 */}
          <AnimatePresence>
            {showIndexPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-h-80 overflow-y-auto z-50"
                style={{ minWidth: '240px' }}
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">选择序号</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowIndexPicker(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {cards.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJumpTo(idx);
                      }}
                      className={`
                        w-9 h-9 text-sm rounded transition-colors
                        ${idx === currentIndex
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'}
                      `}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 卡片区域 - 左侧按钮 + 卡片 + 右侧按钮 */}
      <div className="flex-1 flex items-center 2xl:items-start justify-center px-4 -mt-2 2xl:pt-2">
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
            showEdit={true}
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