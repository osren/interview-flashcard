import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { CardStatus } from '@/types';
import { useCardStore } from '@/store';
import { resolveCardStatus } from '@/utils/cardStatus';
import { cn } from '@/utils/cn';

interface CardIndexPickerProps {
  currentIndex: number;
  totalCards: number;
  onJumpTo: (index: number) => void;
  cards?: Array<{ id: string; status?: CardStatus }>;
}

const STATUS_LEGEND: Array<{ status: CardStatus; label: string; dotClass: string }> = [
  { status: 'remembered', label: '记住了', dotClass: 'bg-[#58CC02]' },
  { status: 'review', label: '再背背', dotClass: 'bg-[#FFC800]' },
  { status: 'unvisited', label: '未标记', dotClass: 'bg-[#e5e5e5] border border-[#d0d0d0]' },
];

function getIndexButtonClass(status: CardStatus, isCurrent: boolean): string {
  const base =
    status === 'remembered'
      ? 'bg-[#58CC02] text-white border-[#58CC02] border-b-[#46A302] hover:brightness-105'
      : status === 'review'
        ? 'bg-[#FFC800] text-[#3c3c3c] border-[#FFC800] border-b-[#E5B800] hover:brightness-105'
        : 'bg-[#f7f7f7] text-[#777777] border-[#e5e5e5] border-b-[#d0d0d0] hover:bg-[#e5e5e5]';

  return cn(
    'w-9 h-9 text-xs font-extrabold rounded-lg transition-all border-b-[3px]',
    base,
    isCurrent && 'ring-2 ring-offset-1 ring-[#3c3c3c]'
  );
}

function getTriggerClass(status: CardStatus): string {
  const base =
    status === 'remembered'
      ? 'bg-[#58CC02] text-white border-b-[#46A302]'
      : status === 'review'
        ? 'bg-[#FFC800] text-[#3c3c3c] border-b-[#E5B800]'
        : 'bg-[#f7f7f7] text-[#777777] border-b-[#d0d0d0]';

  return cn(
    'flex items-center gap-1 px-3 py-1.5 text-sm font-extrabold rounded-lg border-b-[3px] hover:brightness-105 active:border-b active:translate-y-px transition-all',
    base
  );
}

export function CardIndexPicker({ currentIndex, totalCards, onJumpTo, cards }: CardIndexPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cardStatuses = useCardStore((state) => state.cardStatuses);

  const resolveStatusAt = (idx: number): CardStatus => {
    const card = cards?.[idx];
    if (!card) return 'unvisited';
    return resolveCardStatus(card.id, cardStatuses, card.status);
  };

  const currentStatus = resolveStatusAt(currentIndex);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [currentIndex]);

  if (totalCards <= 1) return null;

  return (
    <div className="flex flex-col items-center mb-3" ref={ref} data-stop-propagation>
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className={getTriggerClass(currentStatus)}
        >
          <span>{currentIndex + 1}</span>
          <span className="opacity-70">/</span>
          <span>{totalCards}</span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 surface-panel p-3 max-h-80 overflow-y-auto z-50"
              style={{ minWidth: '240px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-[#e5e5e5]">
                <span className="text-xs font-extrabold text-[#777777] uppercase">选择序号</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="text-[#afafaf] hover:text-[#777777]"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: totalCards }).map((_, idx) => {
                  const status = resolveStatusAt(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpTo(idx);
                        setOpen(false);
                      }}
                      className={getIndexButtonClass(status, idx === currentIndex)}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
        {STATUS_LEGEND.map((item) => (
          <span key={item.status} className="inline-flex items-center gap-1 text-[10px] font-bold text-[#afafaf]">
            <span className={cn('w-2 h-2 rounded-full', item.dotClass)} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
