import { Loader2, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import type { CampusJobSyncStatus } from '@/hooks/useCampusJobSync';
import { cn } from '@/utils/cn';

interface CampusJobSyncBadgeProps {
  status: CampusJobSyncStatus;
  error: string | null;
  isLoggedIn: boolean;
  isConfigured: boolean;
}

const STATUS_LABEL: Record<CampusJobSyncStatus, string> = {
  idle: '登录后同步自定义岗位与投递记录',
  loading: '正在同步…',
  syncing: '保存中…',
  synced: '岗位与投递记录已同步',
  error: '同步失败',
};

export function CampusJobSyncBadge({
  status,
  error,
  isLoggedIn,
  isConfigured,
}: CampusJobSyncBadgeProps) {
  if (!isConfigured) {
    return null;
  }

  const Icon =
    status === 'loading' || status === 'syncing'
      ? Loader2
      : status === 'error'
        ? AlertCircle
        : isLoggedIn
          ? Cloud
          : CloudOff;

  const tone =
    status === 'error'
      ? 'text-[#FF4B4B] bg-[#fff0f0] border-[#ffd6d6]'
      : isLoggedIn
        ? 'text-[#1CB0F6] bg-[#f0f9ff] border-[#cfeefe]'
        : 'text-ink-secondary bg-[#fafafa] border-[#e5e5e5]';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold',
        tone
      )}
      title={error ?? STATUS_LABEL[status]}
    >
      <Icon
        size={14}
        className={cn(
          status === 'loading' || status === 'syncing' ? 'animate-spin' : undefined
        )}
      />
      <span>{STATUS_LABEL[status]}</span>
    </div>
  );
}
