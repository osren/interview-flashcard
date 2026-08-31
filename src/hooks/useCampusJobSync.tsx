import { useCallback, useEffect, useRef, useState, createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/components/Auth';
import {
  fetchCampusJobSync,
  mergeCampusJobPayload,
  saveCampusJobSync,
} from '@/lib/supabase/campus-job-sync';
import { useCampusJobStore } from '@/store/useCampusJobStore';

export type CampusJobSyncStatus = 'idle' | 'loading' | 'syncing' | 'synced' | 'error';

const PUSH_DEBOUNCE_MS = 1500;

interface CampusJobSyncContextValue {
  status: CampusJobSyncStatus;
  error: string | null;
  lastSyncedAt: string | null;
  isLoggedIn: boolean;
  isConfigured: boolean;
}

const CampusJobSyncContext = createContext<CampusJobSyncContextValue | null>(null);

export function CampusJobSyncProvider({ children }: { children: ReactNode }) {
  const value = useCampusJobSync();
  return (
    <CampusJobSyncContext.Provider value={value}>{children}</CampusJobSyncContext.Provider>
  );
}

export function useCampusJobSyncContext(): CampusJobSyncContextValue {
  const context = useContext(CampusJobSyncContext);
  if (!context) {
    throw new Error('useCampusJobSyncContext must be used within CampusJobSyncProvider');
  }
  return context;
}

function useCampusJobSync(): CampusJobSyncContextValue {
  const { user, loading: authLoading, configured } = useAuth();
  const [status, setStatus] = useState<CampusJobSyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(() => useCampusJobStore.persist.hasHydrated());

  const applyingRemoteRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncGenerationRef = useRef(0);

  useEffect(() => {
    if (useCampusJobStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useCampusJobStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  const pullAndMerge = useCallback(async (userId: string) => {
    const generation = syncGenerationRef.current + 1;
    syncGenerationRef.current = generation;
    setStatus('loading');
    setError(null);

    try {
      const localPayload = useCampusJobStore.getState().getSyncPayload();
      const remotePayload = await fetchCampusJobSync(userId);
      if (syncGenerationRef.current !== generation) return;

      const merged = mergeCampusJobPayload(localPayload, remotePayload);
      applyingRemoteRef.current = true;
      useCampusJobStore.getState().importSyncedState(merged);

      const updatedAt = await saveCampusJobSync(userId, merged);
      applyingRemoteRef.current = false;
      if (syncGenerationRef.current !== generation) return;

      setLastSyncedAt(updatedAt);
      setStatus('synced');
    } catch (err) {
      if (syncGenerationRef.current !== generation) return;
      applyingRemoteRef.current = false;
      setStatus('error');
      setError(err instanceof Error ? err.message : '同步失败');
    }
  }, []);

  const pushToCloud = useCallback(async (userId: string) => {
    const generation = syncGenerationRef.current;
    setStatus('syncing');
    setError(null);

    try {
      const payload = useCampusJobStore.getState().getSyncPayload();
      const updatedAt = await saveCampusJobSync(userId, payload);
      if (syncGenerationRef.current !== generation) return;

      setLastSyncedAt(updatedAt);
      setStatus('synced');
    } catch (err) {
      if (syncGenerationRef.current !== generation) return;
      setStatus('error');
      setError(err instanceof Error ? err.message : '同步失败');
    }
  }, []);

  const schedulePush = useCallback(
    (userId: string) => {
      if (pushTimerRef.current) {
        clearTimeout(pushTimerRef.current);
      }

      pushTimerRef.current = setTimeout(() => {
        void pushToCloud(userId);
      }, PUSH_DEBOUNCE_MS);
    },
    [pushToCloud]
  );

  useEffect(() => {
    if (!configured || authLoading || !hydrated) {
      return;
    }

    if (pushTimerRef.current) {
      clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }

    if (!user) {
      syncGenerationRef.current += 1;
      setStatus('idle');
      setError(null);
      return;
    }

    void pullAndMerge(user.id);
  }, [user?.id, configured, authLoading, hydrated, pullAndMerge]);

  useEffect(() => {
    if (!configured || !user || authLoading || !hydrated) {
      return;
    }

    const unsubscribe = useCampusJobStore.subscribe((state, prevState) => {
      if (applyingRemoteRef.current) {
        return;
      }

      if (
        state.customCompanies === prevState.customCompanies &&
        state.customJobs === prevState.customJobs &&
        state.jobProgress === prevState.jobProgress &&
        state.lastSelectedJobId === prevState.lastSelectedJobId
      ) {
        return;
      }

      schedulePush(user.id);
    });

    return () => {
      unsubscribe();
      if (pushTimerRef.current) {
        clearTimeout(pushTimerRef.current);
        pushTimerRef.current = null;
      }
    };
  }, [user?.id, configured, authLoading, hydrated, schedulePush]);

  return {
    status,
    error,
    lastSyncedAt,
    isLoggedIn: Boolean(user),
    isConfigured: configured,
  };
}
