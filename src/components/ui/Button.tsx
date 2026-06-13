import { cn } from '@/utils/cn';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-extrabold uppercase tracking-wide rounded-xl transition-all duration-100',
          'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
          'border-b-4 active:border-b-2 active:translate-y-[2px]',
          {
            'bg-[#58CC02] text-white border-b-[#46A302] hover:brightness-105': variant === 'primary',
            'bg-[#f7f7f7] text-[#4b4b4b] border-b-[#d0d0d0] hover:bg-[#efefef]': variant === 'secondary',
            'bg-transparent text-[#777777] border-b-transparent hover:text-[#4b4b4b] active:translate-y-0 active:border-b-transparent': variant === 'ghost',
            'bg-[#FF4B4B] text-white border-b-[#EA2B2B]': variant === 'danger',
            'bg-white text-[#1CB0F6] border-2 border-[#e5e5e5] border-b-[#d0d0d0] hover:bg-[#f7f7f7]': variant === 'outline',
            'bg-[#1CB0F6] text-white border-b-[#1899D6] hover:brightness-105': variant === 'blue',
          },
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-5 py-3 text-base': size === 'md',
            'px-7 py-4 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
