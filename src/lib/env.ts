// Central env access — validates keys exist before use
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  adminSecret: process.env.NEXT_PUBLIC_ADMIN_SECRET ?? '',
  providerMode: (process.env.NEXT_PUBLIC_PROVIDER_MODE ?? 'mock') as 'mock' | 'live',
  isMockMode: (process.env.NEXT_PUBLIC_PROVIDER_MODE ?? 'mock') === 'mock',
};
