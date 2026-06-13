import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthMap = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
};

export function PageShell({
  children,
  className,
  maxWidth = 'md',
}: PageShellProps) {
  return (
    <div className={cn('min-h-screen app-bg', className)}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn('py-8 px-4 mx-auto', maxWidthMap[maxWidth])}
      >
        {children}
      </motion.div>
    </div>
  );
}
