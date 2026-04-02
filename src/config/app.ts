export const appConfig = {
  name: 'SkyRoute Finder',
  tagline: 'Find your cheapest flight',
  version: '0.1.0',
  defaultLocale: 'en' as const,
  supportedLocales: ['en', 'he', 'es'] as const,
  maxFlightResults: 5,
  searchTimeoutMs: 15_000,
  cacheFlightsTtlMs: 5 * 60 * 1000,   // 5 min
  cacheHotelTtlMs: 10 * 60 * 1000,    // 10 min
  officialOnlyMode: false,             // if true, skip non-official providers
};
