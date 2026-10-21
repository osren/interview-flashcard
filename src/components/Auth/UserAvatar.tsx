import { cn } from '@/utils/cn';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-20 h-20 text-2xl',
};

export function UserAvatar({ name, avatarUrl, size = 'md', className }: UserAvatarProps) {
  const initial = name.slice(0, 1).toUpperCase() || 'U';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn(
          'rounded-full object-cover border-2 border-[#e5e5e5] bg-[#f7f7f7]',
          sizeMap[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-extrabold text-white',
        'bg-gradient-to-br from-[#58CC02] to-[#1CB0F6] border-2 border-[#e5e5e5]',
        sizeMap[size],
        className
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
