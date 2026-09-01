import { useCallback, useEffect, useRef, useState, createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/components/Auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchCampusJobCatalog } from '@/lib/supabase/campus-job-catalog';
import {
  fetchCampusJobSync,
  mergeCampusJobPayload,
  saveCampusJobSync,
} from '@/lib/supabase/campus-job-sync';
import {
  fetchUserCampusJobs,
  mergeCustomJobs,
  syncUserCampusJobsToCloud,
} from '@/lib/supabase/campus-user-jobs';
import { useCampusJobStore } from '@/store/useCampusJobStore';

export type CampusJobSyncStatus = 'idle' | 'loading' | 'syncing' | 'synced' | 'error';

const PUSH_DEBOUNCE_MS = 1500;

interface CampusJobSyncContextValue {
  status: CampusJobSyncStatus;
  error: string | null;
  lastSyncedAt: string | null;
  isLoggedIn: boolean;
  isConfigured: boolean;
  /** Fetch remote catalog on demand (campus / resume optimize). Idempotent. */
  ensureCatalogLoaded: () => void;
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
  const catalogFetchStartedRef = useRef(false);

  useEffect(() => {
    if (useCampusJobStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useCampusJobStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  const ensureCatalogLoaded = useCallback(() => {
    if (!isSupabaseConfigured || catalogFetchStartedRef.current) {
      return;
    }
    catalogFetchStartedRef.current = true;
    useCampusJobStore.getState().setCatalogLoading(true);

    void fetchCampusJobCatalog()
      .then((jobs) => {
        if (jobs.length === 0) {
          useCampusJobStore.getState().setCatalogLoading(false);
          return;
        }
        useCampusJobStore.getState().setCatalogJobs(jobs, 'remote');
      })
      .catch(() => {
        useCampusJobStore.getState().setCatalogLoading(false);
        catalogFetchStartedRef.current = false;
      });
  }, []);

  const pullAndMerge = useCallback(async (userId: string) => {
    const generation = syncGenerationRef.current + 1;
    syncGenerationRef.current = generation;
    setStatus('loading');
    setError(null);

    try {
      const localPayload = useCampusJobStore.getState().getSyncPayload();
      const [remotePayload, remoteJobs] = await Promise.all([
        fetchCampusJobSync(userId),
        fetchUserCampusJobs(userId),
      ]);
      if (syncGenerationRef.current !== generation) return;

      const mergedPayload = mergeCampusJobPayload(localPayload, remotePayload);
      mergedPayload.customJobs = mergeCustomJobs(
        localPayload.customJobs,
        remoteJobs,
        remotePayload?.customJobs ?? []
      );

      applyingRemoteRef.current = true;
      useCampusJobStore.getState().importSyncedState(mergedPayload);

      await syncUserCampusJobsToCloud(userId, mergedPayload.customJobs);
      const updatedAt = await saveCampusJobSync(userId, mergedPayload);
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
      await syncUserCampusJobsToCloud(userId, payload.customJobs);
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
    (userId: string, immediate = false) => {
      if (immediate) {
        if (pushTimerRef.current) {
          clearTimeout(pushTimerRef.current);
          pushTimerRef.current = null;
        }
        void pushToCloud(userId);
        return;
      }

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

      const jobsChanged = state.customJobs !== prevState.customJobs;
      const companiesChanged = state.customCompanies !== prevState.customCompanies;
      const progressChanged =
        state.jobProgress !== prevState.jobProgress ||
        state.lastSelectedJobId !== prevState.lastSelectedJobId;

      if (!jobsChanged && !companiesChanged && !progressChanged) {
        return;
      }

      schedulePush(user.id, jobsChanged);
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
    ensureCatalogLoaded,
  };
}
