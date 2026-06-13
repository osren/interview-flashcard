import { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  center?: boolean;
}

function stopBubble(e: MouseEvent<HTMLDivElement>) {
  e.stopPropagation();
}

export function CardScrollArea({
  children,
  className,
  center = false,
  onClick,
  onMouseDown,
  onTouchStart,
  ...rest
}: CardScrollAreaProps) {
  return (
    <div
      className={cn(
        'card-content-scroll flex-1 min-h-0 w-full',
        center && 'flex flex-col items-center',
        className
      )}
      onClick={(e) => {
        stopBubble(e);
        onClick?.(e);
      }}
      onMouseDown={(e) => {
        stopBubble(e);
        onMouseDown?.(e);
      }}
      onTouchStart={(e) => {
        stopBubble(e);
        onTouchStart?.(e);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
