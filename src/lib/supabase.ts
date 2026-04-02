import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/types';
import { env } from './env';

// Lazy singleton — avoids SSR init errors when env vars not yet available
let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!client) {
    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      throw new Error('Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  }
  return client;
}

// Server-side only — uses service role key
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!env.supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing. Required for admin operations.');
  }
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false },
  });
}
