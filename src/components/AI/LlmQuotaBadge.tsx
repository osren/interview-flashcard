import { useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import type { LlmQuotaInfo } from '@/lib/llm/types';
import { formatLlmBalanceLabel, formatLlmQuotaLabel, resetLlmQuotaToday } from '@/lib/llm/quota';
import { isAiQuotaAdmin } from '@/lib/llm/quota-admin';
import { useAuth } from '@/components/Auth';
import { cn } from '@/utils/cn';

interface LlmQuotaBadgeProps {
  quota: LlmQuotaInfo | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
  onRefresh?: () => void | Promise<void>;
}

export function LlmQuotaBadge({
  quota,
  loading = false,
  error = null,
  className,
  onRefresh,
}: LlmQuotaBadgeProps) {
  const { user } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const isAdmin = isAiQuotaAdmin(user?.email);

  const handleReset = async () => {
    if (!isAdmin || resetting) return;
    setResetting(true);
    setResetError(null);
    setResetMessage(null);
    try {
      await resetLlmQuotaToday();
      setResetMessage('已重置今日额度');
      await onRefresh?.();
    } catch (err) {
      setResetError(err instanceof Error ? err.message : '重置失败');
    } finally {
      setResetting(false);
    }
  };

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

  const empty = !loading && quota.remaining <= 0;
  const low = quota.remaining > 0 && quota.remaining <= 5;
  const balanceLabel = formatLlmBalanceLabel(quota);
  const platformUnavailable = quota.balance?.isAvailable === false;

  return (
    <div className={cn('space-y-1', className)}>
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
      {isAdmin && (
        <button
          type="button"
          onClick={() => void handleReset()}
          disabled={resetting}
          className="inline-flex items-center gap-1 rounded-lg border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] font-bold text-[#777777] hover:border-[#1CB0F6] hover:text-[#1CB0F6] disabled:opacity-50"
          title="开发者：清除全部用户的今日 AI 用量记录"
        >
          {resetting ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
          重置今日额度
        </button>
      )}
      {resetMessage && <p className="text-[11px] font-semibold text-[#58CC02]">{resetMessage}</p>}
      {resetError && <p className="text-[11px] font-semibold text-[#FF4B4B]">{resetError}</p>}
    </div>
  );
}
