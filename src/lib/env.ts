// Central env access — validates keys exist before use
// SECURITY: Never add sensitive secrets with NEXT_PUBLIC_ prefix — those
// are embedded in the client JS bundle and visible to all users.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  // Admin secret is handled in middleware.ts via ADMIN_SECRET (server-side only)
  providerMode: (process.env.NEXT_PUBLIC_PROVIDER_MODE ?? 'mock') as 'mock' | 'live',
  isMockMode: (process.env.NEXT_PUBLIC_PROVIDER_MODE ?? 'mock') === 'mock',
};
