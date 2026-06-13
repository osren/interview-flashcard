import { cn } from '@/utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'bg-[#e5e5e5] rounded-full overflow-hidden',
          {
            'h-3': size === 'sm',
            'h-4': size === 'md',
            'h-5': size === 'lg',
          }
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out bg-[#58CC02]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-[#777777] font-bold text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
