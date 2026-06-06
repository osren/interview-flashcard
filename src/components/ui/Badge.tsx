import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': variant === 'default',
          'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300': variant === 'primary',
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': variant === 'success',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': variant === 'warning',
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': variant === 'danger',
          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200': variant === 'secondary',
          'border border-gray-300 text-gray-600 bg-white dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
