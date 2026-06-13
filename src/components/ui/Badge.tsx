import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-lg text-sm font-extrabold',
        {
          'bg-[#f7f7f7] text-[#777777]': variant === 'default',
          'bg-[#58CC02] text-white': variant === 'primary',
          'bg-[#58CC02]/15 text-[#46A302]': variant === 'success',
          'bg-[#FFC800]/20 text-[#c49a00]': variant === 'warning',
          'bg-[#FF4B4B]/15 text-[#ea2b2b]': variant === 'danger',
          'bg-[#e5e5e5] text-[#777777]': variant === 'secondary',
          'border-2 border-[#e5e5e5] text-[#777777] bg-white': variant === 'outline',
          'bg-[#1CB0F6] text-white': variant === 'blue',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
