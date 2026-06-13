import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  icon,
  badge,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] flex items-center justify-center text-white">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3c3c3c] tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-2 text-[#777777] text-lg leading-relaxed max-w-2xl font-semibold">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
