import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/utils/cn';

interface ChapterLayoutProps {
  backPath: string;
  chapterTitle: string;
  category?: string;
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
      <div className="sticky top-14 lg:top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#e5e5e5]">
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

          <div className="flex-1 min-w-0 flex items-center justify-center">
            <h1 className="text-sm sm:text-base font-extrabold text-[#3c3c3c] truncate capitalize">
              {chapterTitle}
            </h1>
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
