import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  contentClassName?: string;
}

const maxWidthMap = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
};

export function PageShell({
  children,
  className,
  contentClassName,
  maxWidth = 'md',
}: PageShellProps) {
  return (
    <div className={cn('min-h-screen app-bg w-full', className)}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn('w-full py-8 px-4 sm:px-6 mx-auto', maxWidthMap[maxWidth], contentClassName)}
      >
        {children}
      </motion.div>
    </div>
  );
}
