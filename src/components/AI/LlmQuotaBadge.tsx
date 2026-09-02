import { Loader2 } from 'lucide-react';
import type { LlmQuotaInfo } from '@/lib/llm/types';
import { formatLlmBalanceLabel, formatLlmQuotaLabel } from '@/lib/llm/quota';
import { cn } from '@/utils/cn';

interface LlmQuotaBadgeProps {
  quota: LlmQuotaInfo | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export function LlmQuotaBadge({ quota, loading = false, error = null, className }: LlmQuotaBadgeProps) {
  if (loading && !quota) {
    return (
      <div className={cn('flex items-center gap-1.5 text-xs text-[#999999]', className)}>
        <Loader2 size={12} className="animate-spin" />
        <span>额度加载中…</span>
      </div>
    );
  }

  if (!quota) {
    if (error) {
      return <p className={cn('text-xs text-[#999999]', className)}>{error}</p>;
    }
    return null;
  }

  const empty = quota.remaining <= 0;
  const low = quota.remaining > 0 && quota.remaining <= 5;
  const balanceLabel = formatLlmBalanceLabel(quota);
  const platformUnavailable = quota.balance?.isAvailable === false;

  return (
    <div className={cn('space-y-0.5', className)}>
      <p
        className={cn(
          'text-xs font-bold',
          empty ? 'text-[#FF4B4B]' : low ? 'text-[#FF9600]' : 'text-[#777777]'
        )}
      >
        {formatLlmQuotaLabel(quota)}
      </p>
      {balanceLabel && (
        <p className={cn('text-[11px] font-semibold', platformUnavailable ? 'text-[#FF4B4B]' : 'text-[#999999]')}>
          {balanceLabel}
          {platformUnavailable ? ' · 余额不足' : ''}
        </p>
      )}
      {empty && (
        <p className="text-[11px] text-[#FF4B4B]">今日额度已用完，请明日再试</p>
      )}
    </div>
  );
}
