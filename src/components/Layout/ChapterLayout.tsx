import { ReactNode, RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, X } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/utils/cn';

interface ChapterLayoutProps {
  backPath: string;
  chapterTitle: string;
  category?: string;
  currentIndex: number;
  totalCards: number;
  showIndexPicker: boolean;
  setShowIndexPicker: (show: boolean) => void;
  indexPickerRef: RefObject<HTMLDivElement>;
  onJumpTo: (idx: number) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function ChapterLayout({
  backPath,
  chapterTitle,
  category,
  currentIndex,
  totalCards,
  showIndexPicker,
  setShowIndexPicker,
  indexPickerRef,
  onJumpTo,
  onPrev,
  onNext,
  canPrev,
  canNext,
  children,
  footer,
}: ChapterLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen app-bg flex flex-col">
      {/* 紧凑顶栏：导航 + 标题 + 页码 + 分类，合并为一行 */}
      <div className="sticky top-20 z-10 bg-white/95 backdrop-blur-sm border-b border-[#e5e5e5]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => navigate(backPath)}
              className="flex items-center gap-0.5 px-2 py-1.5 text-sm font-bold text-[#1CB0F6] hover:bg-[#f7f7f7] rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">返回</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-1.5 text-[#afafaf] hover:text-[#777777] hover:bg-[#f7f7f7] rounded-lg transition-colors"
            >
              <Home size={16} />
            </button>
          </div>

          <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-[#3c3c3c] truncate capitalize">
              {chapterTitle}
            </h1>
            <div className="relative flex-shrink-0" ref={indexPickerRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowIndexPicker(!showIndexPicker); }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#58CC02] text-white text-sm font-extrabold rounded-lg border-b-[3px] border-[#46A302] hover:brightness-105 active:border-b active:translate-y-px transition-all"
              >
                <span>{currentIndex + 1}</span>
                <span className="opacity-70">/</span>
                <span>{totalCards}</span>
              </button>

              <AnimatePresence>
                {showIndexPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 surface-panel p-3 max-h-72 overflow-y-auto z-50"
                    style={{ minWidth: '220px' }}
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-[#e5e5e5]">
                      <span className="text-xs font-extrabold text-[#777777] uppercase">选择序号</span>
                      <button onClick={(e) => { e.stopPropagation(); setShowIndexPicker(false); }} className="text-[#afafaf] hover:text-[#777777]">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {Array.from({ length: totalCards }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); onJumpTo(idx); }}
                          className={cn(
                            'w-9 h-9 text-xs font-extrabold rounded-lg transition-all border-b-[3px]',
                            idx === currentIndex
                              ? 'bg-[#58CC02] text-white border-[#58CC02] border-b-[#46A302]'
                              : 'bg-[#f7f7f7] text-[#777777] border-[#e5e5e5] border-b-[#d0d0d0] hover:bg-[#e5e5e5]'
                          )}
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

          {category ? (
            <Badge variant="blue" className="flex-shrink-0 text-xs hidden sm:inline-flex">{category}</Badge>
          ) : (
            <div className="w-0 sm:w-auto flex-shrink-0" />
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-2 pb-4 min-h-0">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className={cn(
            'flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-[#e5e5e5] border-b-[3px] border-b-[#d0d0d0]',
            'flex items-center justify-center transition-all',
            canPrev ? 'hover:bg-[#f7f7f7] active:border-b active:translate-y-px' : 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronLeft size={22} className="text-[#777777]" />
        </button>

        <div className="mx-2 sm:mx-4 flex-1 min-w-0 max-w-4xl">{children}</div>

        <button
          onClick={onNext}
          disabled={!canNext}
          className={cn(
            'flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#58CC02] border-b-[3px] border-[#46A302]',
            'flex items-center justify-center transition-all',
            canNext ? 'hover:brightness-105 active:border-b active:translate-y-px' : 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronRight size={22} className="text-white" />
        </button>
      </div>

      {footer && <div className="pb-4 flex justify-center">{footer}</div>}
    </div>
  );
}
