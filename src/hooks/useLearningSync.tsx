import { useCallback, useEffect, useRef, useState, createContext, useContext, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/Auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  applyLearningSyncPayload,
  buildLearningSyncPayload,
  fetchLearningSync,
  isLearningSyncTableMissingError,
  mergeLearningPayload,
  saveLearningSync,
} from '@/lib/supabase/learning-sync';
import { useCardStore } from '@/store/useCardStore';
import { useStreakStore } from '@/store/useStreakStore';

export type LearningSyncStatus = 'idle' | 'loading' | 'syncing' | 'synced' | 'error' | 'local_only';

const PUSH_DEBOUNCE_MS = 1500;

/** Routes that need learning progress cloud sync */
const LEARNING_ROUTE_PREFIXES = [
  '/',
  '/core',
  '/projects',
  '/mpx',
  '/custom',
  '/favorites',
  '/ai',
  '/interview',
  '/llm-handbook',
];

function isLearningRoute(pathname: string): boolean {
  return LEARNING_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || (prefix !== '/' && pathname.startsWith(`${prefix}/`))
  );
}

interface LearningSyncContextValue {
  status: LearningSyncStatus;
  error: string | null;
  lastSyncedAt: string | null;
  isLoggedIn: boolean;
  isConfigured: boolean;
  /** Cloud table learning_sync is not deployed yet */
  cloudUnavailable: boolean;
}

const LearningSyncContext = createContext<LearningSyncContextValue | null>(null);

export function LearningSyncProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const enabled = isLearningRoute(location.pathname);
  const value = useLearningSync(enabled);
  return (
    <LearningSyncContext.Provider value={value}>{children}</LearningSyncContext.Provider>
  );
}

export function useLearningSyncContext(): LearningSyncContextValue {
  const context = useContext(LearningSyncContext);
  if (!context) {
    throw new Error('useLearningSyncContext must be used within LearningSyncProvider');
  }
  return context;
}

function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () => useCardStore.persist.hasHydrated() && useStreakStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;

    let cardReady = useCardStore.persist.hasHydrated();
    let streakReady = useStreakStore.persist.hasHydrated();

    const check = () => {
      if (cardReady && streakReady) setHydrated(true);
    };

    const unsubCard = cardReady
      ? undefined
      : useCardStore.persist.onFinishHydration(() => {
          cardReady = true;
          check();
        });

    const unsubStreak = streakReady
      ? undefined
      : useStreakStore.persist.onFinishHydration(() => {
          streakReady = true;
          check();
        });

    check();

    return () => {
      unsubCard?.();
      unsubStreak?.();
    };
  }, [hydrated]);

  return hydrated;
}

function useLearningSync(enabled: boolean): LearningSyncContextValue {
  const { user, loading: authLoading, configured } = useAuth();
  const [status, setStatus] = useState<LearningSyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cloudUnavailable, setCloudUnavailable] = useState(false);
  const hydrated = useStoresHydrated();

  const applyingRemoteRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncGenerationRef = useRef(0);
  const cloudUnavailableRef = useRef(false);

  const markCloudUnavailable = useCallback(() => {
    cloudUnavailableRef.current = true;
    setCloudUnavailable(true);
    setStatus('local_only');
    setError(null);
  }, []);

  const pullAndMerge = useCallback(async (userId: string) => {
    if (cloudUnavailableRef.current) {
      setStatus('local_only');
      return;
    }

    const generation = syncGenerationRef.current + 1;
    syncGenerationRef.current = generation;
    setStatus('loading');
    setError(null);

    try {
      const localPayload = buildLearningSyncPayload();
      const remotePayload = await fetchLearningSync(userId);
      if (syncGenerationRef.current !== generation) return;

      const mergedPayload = mergeLearningPayload(localPayload, remotePayload);

      applyingRemoteRef.current = true;
      applyLearningSyncPayload(mergedPayload);

      const updatedAt = await saveLearningSync(userId, mergedPayload);
      applyingRemoteRef.current = false;
      if (syncGenerationRef.current !== generation) return;

      if (updatedAt === null) {
        markCloudUnavailable();
        return;
      }

      setLastSyncedAt(updatedAt);
      setStatus('synced');
    } catch (err) {
      if (syncGenerationRef.current !== generation) return;
      applyingRemoteRef.current = false;
      if (isLearningSyncTableMissingError(err)) {
        markCloudUnavailable();
        return;
      }
      setStatus('error');
      setError(err instanceof Error ? err.message : '同步失败');
    }
  }, [markCloudUnavailable]);

  const pushToCloud = useCallback(async (userId: string) => {
    if (cloudUnavailableRef.current) return;

    const generation = syncGenerationRef.current;
    setStatus('syncing');
    setError(null);

    try {
      const payload = buildLearningSyncPayload();
      const updatedAt = await saveLearningSync(userId, payload);
      if (syncGenerationRef.current !== generation) return;

      if (updatedAt === null) {
        markCloudUnavailable();
        return;
      }

      setLastSyncedAt(updatedAt);
      setStatus('synced');
    } catch (err) {
      if (syncGenerationRef.current !== generation) return;
      if (isLearningSyncTableMissingError(err)) {
        markCloudUnavailable();
        return;
      }
      setStatus('error');
      setError(err instanceof Error ? err.message : '同步失败');
    }
  }, [markCloudUnavailable]);

  const schedulePush = useCallback(
    (userId: string) => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
      pushTimerRef.current = setTimeout(() => {
        void pushToCloud(userId);
      }, PUSH_DEBOUNCE_MS);
    },
    [pushToCloud]
  );

  useEffect(() => {
    if (!enabled || !configured || authLoading || !hydrated) return;

    if (pushTimerRef.current) {
      clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }

    if (!user) {
      syncGenerationRef.current += 1;
      setStatus('idle');
      setError(null);
      cloudUnavailableRef.current = false;
      setCloudUnavailable(false);
      return;
    }

    void pullAndMerge(user.id);
  }, [enabled, user?.id, configured, authLoading, hydrated, pullAndMerge]);

  useEffect(() => {
    if (!enabled || !configured || !user || authLoading || !hydrated || cloudUnavailableRef.current) {
      return;
    }

    const unsubCard = useCardStore.subscribe((state, prevState) => {
      if (applyingRemoteRef.current) return;

      const progressChanged =
        state.cardStatuses !== prevState.cardStatuses ||
        state.cardProgress !== prevState.cardProgress ||
        state.customCards !== prevState.customCards ||
        state.modifiedCards !== prevState.modifiedCards ||
        state.favorites !== prevState.favorites;

      if (progressChanged) schedulePush(user.id);
    });

    const unsubStreak = useStreakStore.subscribe((state, prevState) => {
      if (applyingRemoteRef.current) return;
      if (state.checkInDates !== prevState.checkInDates) {
        schedulePush(user.id);
      }
    });

    return () => {
      unsubCard();
      unsubStreak();
      if (pushTimerRef.current) {
        clearTimeout(pushTimerRef.current);
        pushTimerRef.current = null;
      }
    };
  }, [enabled, user?.id, configured, authLoading, hydrated, schedulePush]);

  return {
    status,
    error,
    lastSyncedAt,
    isLoggedIn: Boolean(user),
    isConfigured: configured && isSupabaseConfigured,
    cloudUnavailable,
  };
}
