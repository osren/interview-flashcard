import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlashCard as FlashCardType, CardStatus } from '@/types';
import { Badge } from '@/components/ui';
import { Edit, Save, X, Heart } from 'lucide-react';
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

  const { getCardWithModifications, updateCardAnswer, resetCardAnswer, modifiedCards, toggleFavorite, isFavorited } = useCardStore();

  // 获取应用修改后的卡片
  const displayCard = getCardWithModifications(card);
  const hasModification = !!modifiedCards[card.id];

  // 切换卡片时重置状态 - 同时更新编辑答案为当前显示的答案
  useEffect(() => {
    setIsFlipped(false);
    setIsEditing(false);
    // 只有在不编辑时才同步答案，防止保存时触发翻转
    if (!isEditing) {
      setEditedAnswer(displayCard.answer);
    }
  }, [card.id]);

  const handleFlip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // 如果点击的是按钮等可交互元素，则不翻转
    if (e && (e.target as HTMLElement).closest('button, a, [data-stop-propagation]')) {
      return;
    }

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

  const formattedAnswer = displayCard.answer.replace(/•/g, '-');

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
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(card);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Heart
                    size={18}
                    className={isFavorited(card.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                  />
                </button>
                <Badge variant={statusConfig[displayCard.status].variant}>
                  {statusConfig[displayCard.status].label}
                </Badge>
              </div>
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
            className="absolute inset-0 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-indigo-200 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* 顶部操作区 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{displayCard.category || displayCard.module}</Badge>
                <Badge variant={statusConfig[displayCard.status].variant}>
                  {statusConfig[displayCard.status].label}
                </Badge>
              </div>
              {showEdit && (
                <div className="flex items-center gap-2" data-stop-propagation>
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                        className="p-1.5 text-gray-600 hover:bg-green-100 hover:text-green-700 rounded transition-colors"
                        title="保存"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                        className="p-1.5 text-gray-600 hover:bg-red-100 hover:text-red-700 rounded transition-colors"
                        title="取消"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                      className="p-1.5 text-gray-600 hover:bg-blue-100 hover:text-blue-700 rounded transition-colors"
                      title="编辑答案"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {hasModification && !isEditing && (
                     <button
                      onClick={(e) => { e.stopPropagation(); handleReset(); }}
                      className="p-1.5 text-xs text-gray-500 hover:text-blue-600"
                      title="恢复原始答案"
                    >
                      恢复默认
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 答案内容区 */}
            <div className="flex-1 px-6 py-4 overflow-y-auto" data-color-mode="light">
              {isEditing ? (
                <MDEditor
                  value={editedAnswer}
                  onChange={(val) => setEditedAnswer(val || '')}
                  height="100%"
                  preview="edit"
                  style={{ height: '100%', backgroundColor: '#f0f4ff' }}
                />
              ) : (
                <MDEditor.Markdown
                  source={formattedAnswer}
                  style={{ backgroundColor: 'transparent', color: '#37352f' }}
                />
              )}
            </div>

            {/* 底部提示 */}
            <div className="px-6 py-3 bg-indigo-100/50 text-center text-sm text-gray-500 border-t border-indigo-200">
              再次点击卡片可返回问题
            </div>
          </div>
        </motion.div>
      </div>

      {/* 底部状态控制按钮 */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => onStatusChange('forgotten')}
          className="px-5 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
        >
          <span>😵</span>
          <span>忘记</span>
        </button>
        <button
          onClick={() => onStatusChange('fuzzy')}
          className="px-5 py-2.5 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
        >
          <span>🤔</span>
          <span>模糊</span>
        </button>
        <button
          onClick={() => onStatusChange('mastered')}
          className="px-5 py-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
        >
          <span>✅</span>
          <span>掌握</span>
        </button>
      </div>
    </div>
  );
}
