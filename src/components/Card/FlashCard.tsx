import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlashCard as FlashCardType, CardStatus } from '@/types';
import { Badge } from '@/components/ui';
import { Edit, Save, X, Heart, HelpCircle } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useCardStore } from '@/store';
import { cn } from '@/utils/cn';
import { CardScrollArea } from './CardScrollArea';

interface FlashCardProps {
  card: FlashCardType;
  onStatusChange: (status: CardStatus) => void;
  currentIndex?: number;
  totalCards?: number;
  showEdit?: boolean;
}

const statusConfig: Record<CardStatus, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  unvisited: { label: '未开始', variant: 'default' },
  forgotten: { label: '忘记', variant: 'danger' },
  fuzzy: { label: '模糊', variant: 'warning' },
  mastered: { label: '掌握', variant: 'success' },
};

export function FlashCard({ card, onStatusChange, currentIndex, totalCards, showEdit = false }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(card.answer);

  const { getCardWithModifications, updateCardAnswer, resetCardAnswer, modifiedCards, toggleFavorite, isFavorited } = useCardStore();
  const displayCard = getCardWithModifications(card);
  const hasModification = !!modifiedCards[card.id];

  useEffect(() => {
    setIsFlipped(false);
    setIsEditing(false);
    if (!isEditing) {
      setEditedAnswer(displayCard.answer);
    }
  }, [card.id]);

  const handleFlip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const formattedAnswer = displayCard.answer.replace(/•/g, '-');

  return (
    <div className="w-full max-w-4xl mx-auto min-w-0">
      <div
        className="relative cursor-pointer w-full h-[clamp(280px,calc(100dvh-16rem),640px)] md:h-[clamp(420px,calc(100dvh-11rem),640px)]"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 正面 - 问题 */}
          <div
            className="absolute inset-0 flex flex-col bg-white rounded-2xl border-2 border-[#e5e5e5] border-b-4 border-b-[#d0d0d0] overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="h-3 bg-[#58CC02]" />
            <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b-2 border-[#e5e5e5]">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary">{displayCard.category || displayCard.module}</Badge>
                {currentIndex !== undefined && totalCards !== undefined && (
                  <Badge variant="outline">{currentIndex + 1} / {totalCards}</Badge>
                )}
                {hasModification && <Badge variant="warning" className="text-xs">已修改</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(card); }}
                  className="p-1.5 hover:bg-surface-muted rounded-lg transition-colors"
                >
                  <Heart
                    size={18}
                    className={isFavorited(card.id) ? 'text-red-500 fill-red-500' : 'text-ink-muted'}
                  />
                </button>
                <Badge variant={statusConfig[displayCard.status].variant}>
                  {statusConfig[displayCard.status].label}
                </Badge>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              <CardScrollArea center className="px-4 py-4 sm:px-8 sm:py-6">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#58CC02] border-b-4 border-[#46A302] flex items-center justify-center mb-4 sm:mb-6 flex-shrink-0">
                  <HelpCircle size={32} className="text-white sm:hidden" strokeWidth={2.5} />
                  <HelpCircle size={40} className="text-white hidden sm:block" strokeWidth={2.5} />
                </div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-[#3c3c3c] text-center whitespace-pre-wrap leading-relaxed break-words px-1 sm:px-2">
                  {displayCard.question}
                </h2>
                {displayCard.difficulty && (
                  <div className="flex justify-center gap-2 mt-4 flex-shrink-0">
                    {displayCard.difficulty === 'easy' && <Badge variant="success">简单</Badge>}
                    {displayCard.difficulty === 'medium' && <Badge variant="warning">中等</Badge>}
                    {displayCard.difficulty === 'hard' && <Badge variant="danger">困难</Badge>}
                  </div>
                )}
              </CardScrollArea>
            </div>

            <div className="px-4 py-2 sm:px-5 bg-[#f7f7f7] text-center text-xs sm:text-sm font-bold text-[#777777] border-t-2 border-[#e5e5e5] flex-shrink-0">
              点击卡片查看答案 · 可拖动查看完整内容
            </div>
          </div>

          {/* 背面 - 答案 */}
          <div
            className="absolute inset-0 flex flex-col bg-white rounded-2xl border-2 border-[#1CB0F6] border-b-4 border-b-[#1899D6] overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="h-3 bg-[#1CB0F6]" />
            <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b-2 border-[#e5e5e5] bg-[#f0f9ff]">
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
                      <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="保存">
                        <Save size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="取消">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 text-ink-secondary hover:bg-surface-muted rounded-lg transition-colors" title="编辑答案">
                      <Edit size={16} />
                    </button>
                  )}
                  {hasModification && !isEditing && (
                    <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="p-1.5 text-xs text-ink-muted hover:text-primary-600" title="恢复原始答案">
                      恢复默认
                    </button>
                  )}
                </div>
              )}
            </div>

            <CardScrollArea className="px-4 py-2.5 sm:px-5 sm:py-3" data-color-mode="light">
              {isEditing ? (
                <MDEditor
                  value={editedAnswer}
                  onChange={(val) => setEditedAnswer(val || '')}
                  height="100%"
                  preview="edit"
                  style={{ height: '100%', backgroundColor: 'var(--bg-muted)' }}
                />
              ) : (
                <div className="card-markdown-content min-w-0">
                  <MDEditor.Markdown
                    source={formattedAnswer}
                    style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                  />
                  {displayCard.codeExample && (
                    <div className="mt-6">
                      <div className="text-sm font-medium text-ink-secondary mb-2 font-mono">代码示例</div>
                      <pre className="bg-[#1a1d26] text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono border border-surface-border">
                        <code>{displayCard.codeExample}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardScrollArea>

            <div className="px-4 py-2 sm:px-5 bg-primary-50/80 dark:bg-primary-900/20 text-center text-xs sm:text-sm text-ink-muted border-t border-surface-border flex-shrink-0">
              再次点击返回问题 · 可拖动查看完整内容
            </div>
          </div>
        </motion.div>
      </div>

      {/* 状态按钮 */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 px-2">
        {([
          { status: 'forgotten' as CardStatus, emoji: '😵', label: '忘记', cls: 'bg-[#FF4B4B] text-white border-b-[#EA2B2B]' },
          { status: 'fuzzy' as CardStatus, emoji: '🤔', label: '模糊', cls: 'bg-[#FFC800] text-[#3c3c3c] border-b-[#E5B800]' },
          { status: 'mastered' as CardStatus, emoji: '✅', label: '掌握', cls: 'bg-[#58CC02] text-white border-b-[#46A302]' },
        ]).map((btn) => (
          <button
            key={btn.status}
            onClick={() => onStatusChange(btn.status)}
            className={cn(
              'px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-all text-xs sm:text-sm font-extrabold uppercase tracking-wide flex items-center gap-1.5 sm:gap-2 border-b-4',
              'hover:brightness-105 active:border-b-2 active:translate-y-[2px]',
              btn.cls
            )}
          >
            <span>{btn.emoji}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
