import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { FlashCard as FlashCardType, CardStatus } from '@/types';
import { Badge } from '@/components/ui';
import { useCardStore } from '@/store';
import { cn } from '@/utils/cn';

interface FlashCardProps {
  card: FlashCardType;
  onStatusChange: (status: CardStatus) => void;
  currentIndex?: number;
  totalCards?: number;
}

export function FlashCard({ card, onStatusChange, currentIndex, totalCards }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { toggleFavorite, isFavorited } = useCardStore();
  const favorited = isFavorited(card.id);

  // 切换卡片时重置翻转状态
  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(card);
  };

  const statusConfig: Record<CardStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
    unvisited: { label: '未开始', variant: 'default' },
    forgotten: { label: '忘记', variant: 'danger' },
    fuzzy: { label: '模糊', variant: 'warning' },
    mastered: { label: '掌握', variant: 'success' },
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 卡片容器 */}
      <div
        className="relative cursor-pointer md:cursor-pointer"
        style={{ minHeight: '420px', perspective: '1000px' }}
        onClick={handleFlip}
      >
        <motion.div
          className="absolute inset-0 w-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            transformStyle: 'preserve-3d',
            minHeight: '420px',
          }}
        >
          {/* 正面 */}
          <div
            className="absolute inset-0 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden md:rounded-2xl"
            style={{ backfaceVisibility: 'hidden', minHeight: '420px' }}
          >
            {/* 顶部标签区 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-xs">{card.category || card.module}</Badge>
                {currentIndex !== undefined && totalCards !== undefined && (
                  <Badge variant="secondary" className="text-xs">{currentIndex + 1}/{totalCards}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFavorite}
                  className={cn(
                    'p-1.5 rounded-full transition-all active:scale-90',
                    favorited ? 'text-red-500 hover:text-red-600' : 'text-gray-300 hover:text-red-400'
                  )}
                >
                  <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
                </button>
                <Badge variant={statusConfig[card.status].variant} className="text-xs">
                  {statusConfig[card.status].label}
                </Badge>
              </div>
            </div>

            {/* 问题内容区 */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 overflow-hidden">
              <div className="text-4xl mb-3">❓</div>
              <h2 className="text-base font-medium text-gray-800 text-center whitespace-pre-wrap leading-relaxed max-h-full overflow-y-auto">
                {card.question}
              </h2>

              {card.difficulty && (
                <div className="flex justify-center gap-2 mt-3">
                  {card.difficulty === 'easy' && (
                    <Badge variant="success" className="text-xs">简单</Badge>
                  )}
                  {card.difficulty === 'medium' && (
                    <Badge variant="warning" className="text-xs">中等</Badge>
                  )}
                  {card.difficulty === 'hard' && (
                    <Badge variant="danger" className="text-xs">困难</Badge>
                  )}
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="px-4 py-2.5 bg-gray-50 text-center text-xs text-gray-500">
              点击卡片查看答案
            </div>
          </div>

          {/* 背面 - 答案 */}
          <div
            className="absolute inset-0 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-blue-200 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '420px',
            }}
          >
            {/* 顶部标签区 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200">
              <Badge variant="primary" className="text-xs">参考答案</Badge>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFavorite}
                  className={cn(
                    'p-1.5 rounded-full transition-all active:scale-90',
                    favorited ? 'text-red-500 hover:text-red-600' : 'text-gray-300 hover:text-red-400'
                  )}
                >
                  <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
                </button>
                <span className="text-xs text-blue-600">点击收起</span>
              </div>
            </div>

            {/* 答案内容区 - 可滚动 */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* 文字答案 */}
              <div>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {card.answer}
                </div>
              </div>

              {/* 代码示例 - 如果有的话 */}
              {card.codeExample && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <span>💻</span> 代码示例
                  </h4>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto leading-relaxed">
                    <code>{card.codeExample}</code>
                  </pre>
                </div>
              )}

              {/* 延伸追问 */}
              {card.extendQuestion && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                    <span>💡</span> 延伸追问
                  </h4>
                  <p className="text-sm text-yellow-700">
                    {card.extendQuestion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 底部操作区 */}
      <div className="mt-4 flex flex-col items-center gap-3">
        {/* 收起按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(false);
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          收起答案
        </button>

        {/* 掌握程度按钮 */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange('forgotten');
            }}
            className="px-4 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors text-sm font-medium shadow-sm active:scale-95"
          >
            😵
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange('fuzzy');
            }}
            className="px-4 py-2.5 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors text-sm font-medium shadow-sm active:scale-95"
          >
            🤔
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange('mastered');
            }}
            className="px-4 py-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium shadow-sm active:scale-95"
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  );
}
