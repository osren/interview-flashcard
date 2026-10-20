import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/Auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { applyInterviewSyncPayload, buildInterviewSyncPayload, fetchInterviewSync, isInterviewSyncTableMissingError, saveInterviewSync } from '@/lib/supabase/interview-sync';
import { useInterviewStore } from '@/store/useInterviewStore';

export type InterviewSyncStatus = 'idle' | 'loading' | 'syncing' | 'synced' | 'error' | 'local_only';
interface InterviewSyncContextValue {
  status: InterviewSyncStatus;
  error: string | null;
  lastSyncedAt: string | null;
  isLoggedIn: boolean;
  isConfigured: boolean;
}

const Context = createContext<InterviewSyncContextValue | null>(null);
const PUSH_DEBOUNCE_MS = 1200;

export function InterviewSyncProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const enabled = location.pathname === '/interview' || location.pathname.startsWith('/interview/') || location.pathname === '/favorites';
  const { user, loading: authLoading, configured } = useAuth();
  const [status, setStatus] = useState<InterviewSyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(() => useInterviewStore.persist.hasHydrated());
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const applyingRemoteRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);
  const cloudUnavailableRef = useRef(false);

  useEffect(() => {
    if (useInterviewStore.persist.hasHydrated()) { setHydrated(true); return; }
    return useInterviewStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const pull = useCallback(async (userId: string) => {
    if (cloudUnavailableRef.current) { setStatus('local_only'); return; }
    const generation = ++generationRef.current;
    setReadyUserId(null);
    setStatus('loading'); setError(null);
    try {
      const remote = await fetchInterviewSync(userId);
      if (generationRef.current !== generation) return;
      if (remote) {
        // This table stores a complete per-user snapshot. Pulling the snapshot first
        // keeps deletions consistent across devices; subsequent local edits are pushed.
        applyingRemoteRef.current = true;
        applyInterviewSyncPayload(remote);
        applyingRemoteRef.current = false;
      }
      const payload = buildInterviewSyncPayload();
      const updatedAt = await saveInterviewSync(userId, payload);
      if (generationRef.current !== generation) return;
      if (updatedAt === null) { cloudUnavailableRef.current = true; setStatus('local_only'); return; }
      setReadyUserId(userId);
      setLastSyncedAt(updatedAt); setStatus('synced');
    } catch (cause) {
      applyingRemoteRef.current = false;
      if (generationRef.current !== generation) return;
      if (isInterviewSyncTableMissingError(cause)) { cloudUnavailableRef.current = true; setStatus('local_only'); return; }
      setStatus('error'); setError(cause instanceof Error ? cause.message : '面经同步失败');
    }
  }, []);

  const push = useCallback(async (userId: string) => {
    const generation = generationRef.current;
    setStatus('syncing'); setError(null);
    try {
      const updatedAt = await saveInterviewSync(userId, buildInterviewSyncPayload());
      if (generationRef.current !== generation) return;
      if (updatedAt === null) { cloudUnavailableRef.current = true; setStatus('local_only'); return; }
      setLastSyncedAt(updatedAt); setStatus('synced');
    } catch (cause) {
      if (generationRef.current !== generation) return;
      if (isInterviewSyncTableMissingError(cause)) { cloudUnavailableRef.current = true; setStatus('local_only'); return; }
      setStatus('error'); setError(cause instanceof Error ? cause.message : '面经同步失败');
    }
  }, []);

  useEffect(() => {
    if (!enabled || !configured || authLoading || !hydrated) return;
    if (pushTimerRef.current) { clearTimeout(pushTimerRef.current); pushTimerRef.current = null; }
    cloudUnavailableRef.current = false;
    if (!user) {
      generationRef.current += 1; setReadyUserId(null); setStatus('idle'); setError(null); setLastSyncedAt(null); return;
    }
    void pull(user.id);
  }, [enabled, configured, authLoading, hydrated, user?.id, pull]);

  useEffect(() => {
    if (!enabled || !configured || authLoading || !hydrated || !user || readyUserId !== user.id || cloudUnavailableRef.current) return;
    const unsubscribe = useInterviewStore.subscribe((state, previous) => {
      if (applyingRemoteRef.current || (state.companies === previous.companies && state.favoriteQuestions === previous.favoriteQuestions)) return;
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
      pushTimerRef.current = setTimeout(() => { void push(user.id); }, PUSH_DEBOUNCE_MS);
    });
    return () => { unsubscribe(); if (pushTimerRef.current) { clearTimeout(pushTimerRef.current); pushTimerRef.current = null; } };
  }, [enabled, configured, authLoading, hydrated, user?.id, readyUserId, push]);

  return <Context.Provider value={{ status, error, lastSyncedAt, isLoggedIn: Boolean(user), isConfigured: configured && isSupabaseConfigured }}>{children}</Context.Provider>;
}

export function useInterviewSync(): InterviewSyncContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('useInterviewSync must be used within InterviewSyncProvider');
  return context;
}
