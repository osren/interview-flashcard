import { useCallback, useEffect, useRef, useState, createContext, useContext, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/Auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  applyResumeSyncPayload,
  buildResumeSyncPayload,
  fetchResumeSync,
  isResumeSyncTableMissingError,
  mergeResumePayload,
  saveResumeSync,
} from '@/lib/supabase/resume-sync';
import { useResumeStore } from '@/store/useResumeStore';

export type ResumeSyncStatus = 'idle' | 'loading' | 'syncing' | 'synced' | 'error' | 'local_only';

const PUSH_DEBOUNCE_MS = 1500;

function isResumeRoute(pathname: string): boolean {
  return pathname === '/resume' || pathname.startsWith('/resume/');
}

interface ResumeSyncContextValue {
  status: ResumeSyncStatus;
  error: string | null;
  lastSyncedAt: string | null;
  isLoggedIn: boolean;
  isConfigured: boolean;
  cloudUnavailable: boolean;
}

const ResumeSyncContext = createContext<ResumeSyncContextValue | null>(null);

export function ResumeSyncProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const enabled = isResumeRoute(location.pathname);
  const value = useResumeSync(enabled);
  return <ResumeSyncContext.Provider value={value}>{children}</ResumeSyncContext.Provider>;
}

export function useResumeSyncContext(): ResumeSyncContextValue {
  const context = useContext(ResumeSyncContext);
  if (!context) {
    throw new Error('useResumeSyncContext must be used within ResumeSyncProvider');
  }
  return context;
}

function useResumeSync(enabled: boolean): ResumeSyncContextValue {
  const { user, loading: authLoading, configured } = useAuth();
  const [status, setStatus] = useState<ResumeSyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cloudUnavailable, setCloudUnavailable] = useState(false);
  const [hydrated, setHydrated] = useState(() => useResumeStore.persist.hasHydrated());

  const applyingRemoteRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncGenerationRef = useRef(0);
  const cloudUnavailableRef = useRef(false);

  useEffect(() => {
    if (useResumeStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useResumeStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

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
      const localPayload = buildResumeSyncPayload();
      const remotePayload = await fetchResumeSync(userId);
      if (syncGenerationRef.current !== generation) return;

      const mergedPayload = mergeResumePayload(localPayload, remotePayload);

      applyingRemoteRef.current = true;
      applyResumeSyncPayload(mergedPayload);

      const updatedAt = await saveResumeSync(userId, mergedPayload);
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
      if (isResumeSyncTableMissingError(err)) {
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
      const payload = buildResumeSyncPayload();
      const updatedAt = await saveResumeSync(userId, payload);
      if (syncGenerationRef.current !== generation) return;

      if (updatedAt === null) {
        markCloudUnavailable();
        return;
      }

      setLastSyncedAt(updatedAt);
      setStatus('synced');
    } catch (err) {
      if (syncGenerationRef.current !== generation) return;
      if (isResumeSyncTableMissingError(err)) {
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

    const unsub = useResumeStore.subscribe((state, prevState) => {
      if (applyingRemoteRef.current) return;

      const changed =
        state.resumes !== prevState.resumes ||
        state.introScript !== prevState.introScript ||
        state.markdownResumes !== prevState.markdownResumes ||
        state.primaryResumeId !== prevState.primaryResumeId;

      if (changed) schedulePush(user.id);
    });

    return () => {
      unsub();
      if (pushTimerRef.current) {
        clearTimeout(pushTimerRef.current);
        pushTimerRef.current = null;
        void pushToCloud(user.id);
      }
    };
  }, [enabled, user?.id, configured, authLoading, hydrated, schedulePush, pushToCloud]);

  return {
    status,
    error,
    lastSyncedAt,
    isLoggedIn: Boolean(user),
    isConfigured: configured && isSupabaseConfigured,
    cloudUnavailable,
  };
}
