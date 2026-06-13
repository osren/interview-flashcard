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
      <div className="sticky top-14 md:top-20 z-10 bg-white border-b-2 border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(backPath)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-base font-extrabold text-[#1CB0F6] hover:bg-[#f7f7f7] rounded-xl transition-colors"
            >
              <ChevronLeft size={18} />
              返回
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-2 text-[#afafaf] hover:text-[#777777] hover:bg-[#f7f7f7] rounded-xl transition-colors"
            >
              <Home size={18} />
            </button>
          </div>
          {category && <Badge variant="blue">{category}</Badge>}
        </div>
      </div>

      <div className="py-4 text-center">
        <h1 className="text-2xl font-extrabold text-[#3c3c3c] capitalize mb-2">
          {chapterTitle}
        </h1>
        <div className="relative inline-flex" ref={indexPickerRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowIndexPicker(!showIndexPicker); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#58CC02] text-white font-extrabold rounded-xl border-b-4 border-[#46A302] hover:brightness-105 active:border-b-2 active:translate-y-[2px] transition-all text-base"
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
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 surface-panel p-3 max-h-80 overflow-y-auto z-50"
                style={{ minWidth: '240px' }}
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-[#e5e5e5]">
                  <span className="text-sm font-extrabold text-[#777777] uppercase">选择序号</span>
                  <button onClick={(e) => { e.stopPropagation(); setShowIndexPicker(false); }} className="text-[#afafaf] hover:text-[#777777]">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: totalCards }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); onJumpTo(idx); }}
                      className={cn(
                        'w-10 h-10 text-sm font-extrabold rounded-xl transition-all border-b-4',
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

      <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 pb-6 sm:pb-8 w-full min-w-0">
        <div className="flex items-center justify-center w-full max-w-3xl gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className={cn(
              'hidden sm:flex flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-[#e5e5e5] border-b-4 border-b-[#d0d0d0]',
              'items-center justify-center transition-all',
              canPrev ? 'hover:bg-[#f7f7f7] active:border-b-2 active:translate-y-[2px]' : 'opacity-30 cursor-not-allowed'
            )}
          >
            <ChevronLeft size={24} className="text-[#777777]" />
          </button>

          <div className="flex-1 min-w-0 w-full">{children}</div>

          <button
            onClick={onNext}
            disabled={!canNext}
            className={cn(
              'hidden sm:flex flex-shrink-0 w-12 h-12 rounded-full bg-[#58CC02] border-b-4 border-[#46A302]',
              'items-center justify-center transition-all',
              canNext ? 'hover:brightness-105 active:border-b-2 active:translate-y-[2px]' : 'opacity-30 cursor-not-allowed'
            )}
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>

        <div className="flex sm:hidden items-center justify-center gap-8 mt-4">
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className={cn(
              'w-11 h-11 rounded-full bg-white border-2 border-[#e5e5e5] border-b-4 border-b-[#d0d0d0]',
              'flex items-center justify-center transition-all',
              canPrev ? 'active:border-b-2 active:translate-y-[2px]' : 'opacity-30 cursor-not-allowed'
            )}
          >
            <ChevronLeft size={22} className="text-[#777777]" />
          </button>
          <button
            onClick={onNext}
            disabled={!canNext}
            className={cn(
              'w-11 h-11 rounded-full bg-[#58CC02] border-b-4 border-[#46A302]',
              'flex items-center justify-center transition-all',
              canNext ? 'active:border-b-2 active:translate-y-[2px]' : 'opacity-30 cursor-not-allowed'
            )}
          >
            <ChevronRight size={22} className="text-white" />
          </button>
        </div>
      </div>

      {footer && <div className="pb-6 flex justify-center">{footer}</div>}
    </div>
  );
}
