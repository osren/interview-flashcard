import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/Auth';
import { fetchLlmQuota } from '@/lib/llm/quota';
import type { LlmQuotaInfo } from '@/lib/llm/types';

interface UseLlmQuotaOptions {
  enabled?: boolean;
}

export function useLlmQuota(options: UseLlmQuotaOptions = {}) {
  const { enabled = true } = options;
  const { user } = useAuth();
  const [quota, setQuota] = useState<LlmQuotaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setQuota(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await fetchLlmQuota();
      setQuota(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : '额度查询失败');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!enabled || !user) {
      setQuota(null);
      setError(null);
      return;
    }
    void refresh();
  }, [enabled, user, refresh]);

  const quotaPending = Boolean(user && enabled && loading && quota === null);
  const quotaReady = Boolean(user && enabled && !quotaPending);
  const isQuotaExhausted = quotaReady && quota !== null && quota.remaining <= 0;
  const hasQuota = quota !== null && quota.remaining > 0;
  const canUseAi = quotaReady && !isQuotaExhausted;

  return {
    quota,
    loading,
    error,
    refresh,
    quotaPending,
    quotaReady,
    isQuotaExhausted,
    hasQuota,
    canUseAi,
  };
}
