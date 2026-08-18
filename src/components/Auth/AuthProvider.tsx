import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import {
  getDisplayName,
  isProfileComplete,
  parseUserProfile,
  type UserProfileMetadata,
} from '@/types/user-profile';

interface AuthResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

interface ProfileResult {
  error: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfileMetadata;
  displayName: string;
  needsProfileSetup: boolean;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, username?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (username: string, avatarUrl?: string) => Promise<ProfileResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: nextSession } }) => {
      setSession(nextSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const profile = useMemo(() => parseUserProfile(user?.user_metadata), [user]);
  const displayName = useMemo(() => getDisplayName(profile, user?.email), [profile, user?.email]);
  const needsProfileSetup = Boolean(user && !isProfileComplete(profile));

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    username?: string
  ): Promise<AuthResult> => {
    const trimmedUsername = username?.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: trimmedUsername
        ? { data: { username: trimmedUsername } }
        : undefined,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session) {
      return { error: null };
    }

    if (data.user && !data.user.email_confirmed_at) {
      return { error: null, needsEmailConfirmation: true };
    }

    return { error: null };
  }, []);

  const updateProfile = useCallback(async (
    username: string,
    avatarUrl?: string
  ): Promise<ProfileResult> => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        username: username.trim(),
        avatar_url: avatarUrl ?? null,
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      setSession((current) => (
        current ? { ...current, user: data.user as User } : null
      ));
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      displayName,
      needsProfileSetup,
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [
      session,
      user,
      profile,
      displayName,
      needsProfileSetup,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
