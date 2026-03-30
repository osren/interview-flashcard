import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlashCard as FlashCardType, CardStatus } from '@/types';
import { Badge } from '@/components/ui';
import { Edit, Save, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useCardStore } from '@/store';

interface FlashCardProps {
  card: FlashCardType;
  onStatusChange: (status: CardStatus) => void;
  currentIndex?: number;
  totalCards?: number;
  showEdit?: boolean;
}

export function FlashCard({ card, onStatusChange, currentIndex, totalCards, showEdit = false }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(card.answer);

  const { getCardWithModifications, updateCardAnswer, resetCardAnswer, modifiedCards } = useCardStore();

  // 获取应用修改后的卡片
  const displayCard = getCardWithModifications(card);
  const hasModification = !!modifiedCards[card.id];

  // 切换卡片时重置状态 - 同时更新编辑答案为当前显示的答案
  useEffect(() => {
    setIsFlipped(false);
    setIsEditing(false);
    setEditedAnswer(displayCard.answer);
  }, [card.id, displayCard.answer]);

  const handleFlip = () => {
    if (!isEditing) {
      setIsFlipped((prev) => !prev);
    }
  };

  const handleSaveEdit = () => {
    updateCardAnswer(card.id, { answer: editedAnswer });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedAnswer(displayCard.answer);
    setIsEditing(false);
  };

  const handleReset = () => {
    resetCardAnswer(card.id);
    setEditedAnswer(card.answer);
  };

  const statusConfig: Record<CardStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
    unvisited: { label: '未开始', variant: 'default' },
    forgotten: { label: '忘记', variant: 'danger' },
    fuzzy: { label: '模糊', variant: 'warning' },
    mastered: { label: '掌握', variant: 'success' },
  };

  return (
    <div className="w-[768px] max-w-[768px] flex-shrink-0">
      {/* 卡片容器 */}
      <div
        className="relative cursor-pointer"
        style={{ height: '480px', perspective: '1000px' }}
        onClick={handleFlip}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 正面 */}
          <div
            className="absolute inset-0 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* 顶部标签区 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{displayCard.category || displayCard.module}</Badge>
                {currentIndex !== undefined && totalCards !== undefined && (
                  <Badge variant="outline">{currentIndex + 1} / {totalCards}</Badge>
                )}
                {hasModification && (
                  <Badge variant="warning" className="text-xs">已修改</Badge>
                )}
              </div>
              <Badge variant={statusConfig[displayCard.status].variant}>
                {statusConfig[displayCard.status].label}
              </Badge>
            </div>

            {/* 问题内容区 */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 overflow-hidden">
              <div className="text-5xl mb-4">❓</div>
              <h2 className="text-lg font-medium text-gray-800 text-center whitespace-pre-wrap leading-relaxed max-h-full overflow-y-auto">
                {displayCard.question}
              </h2>

              {displayCard.difficulty && (
                <div className="flex justify-center gap-2 mt-4">
                  {displayCard.difficulty === 'easy' && (
                    <Badge variant="success">简单</Badge>
                  )}
                  {displayCard.difficulty === 'medium' && (
                    <Badge variant="warning">中等</Badge>
                  )}
                  {displayCard.difficulty === 'hard' && (
                    <Badge variant="danger">困难</Badge>
                  )}
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
              点击卡片查看答案
            </div>
          </div>

          {/* 背面 - 答案 */}
          <div
            className="absolute inset-0 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-blue-200 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* 顶部标签区 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Badge variant="primary">参考答案</Badge>
                {hasModification && (
                  <Badge variant="warning" className="text-xs">已修改</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showEdit && !isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveEdit();
                      }}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
                {!isEditing && hasModification && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    重置
                  </button>
                )}
                <span className="text-sm text-blue-600">点击收起</span>
              </div>
            </div>

            {/* 答案内容区 - 可滚动 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {isEditing ? (
                // 编辑模式
                <div data-color-mode="light">
                  <MDEditor
                    value={editedAnswer}
                    onChange={(value) => setEditedAnswer(value || '')}
                    height={320}
                    preview="edit"
                    enableScroll={true}
                  />
                </div>
              ) : (
                // 显示模式
                <>
                  {/* 文字答案 */}
                  <div>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                      {displayCard.answer}
                    </div>
                  </div>

                  {/* 代码示例 - 如果有的话 */}
                  {displayCard.codeExample && (
                    <div className="mt-4">
                      <h4 className="text-base font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <span>💻</span> 代码示例
                      </h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto leading-relaxed">
                        <code>{displayCard.codeExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* 延伸追问 */}
                  {displayCard.extendQuestion && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-base font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        <span>💡</span> 延伸追问
                      </h4>
                      <p className="text-base text-yellow-700">
                        {displayCard.extendQuestion}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 底部操作区 */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {/* 收起按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isEditing) {
              handleCancelEdit();
            }
            setIsFlipped(false);
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isEditing ? '取消编辑' : '收起答案'}
        </button>

        {/* 掌握程度按钮 */}
        {!isEditing && (
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('forgotten');
              }}
              className="px-5 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors text-sm font-medium shadow-sm"
            >
              😵 忘记
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('fuzzy');
              }}
              className="px-5 py-2.5 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors text-sm font-medium shadow-sm"
            >
              🤔 模糊
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('mastered');
              }}
              className="px-5 py-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium shadow-sm"
            >
              ✅ 掌握
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
