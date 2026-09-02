import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

function isPlaceholderEnv(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return (
    trimmed.includes('替换') ||
    trimmed.includes('<') ||
    trimmed.startsWith('your-') ||
    trimmed === 'placeholder-anon-key'
  );
}

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !isPlaceholderEnv(supabaseUrl) &&
  !isPlaceholderEnv(supabaseAnonKey);

export function getSupabaseUrl(): string {
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL 未配置，请复制 .env.example 为 .env 并填写');
  }
  return supabaseUrl;
}

export function getSupabaseAnonKey(): string {
  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY 未配置，请复制 .env.example 为 .env 并填写');
  }
  return supabaseAnonKey;
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
