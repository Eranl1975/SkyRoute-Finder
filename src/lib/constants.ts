export const MAX_FLIGHT_RESULTS = 5;
export const MAX_RECENT_SEARCHES = 10;
export const MAX_SAVED_SEARCHES = 50;
export const MAX_FAVORITES = 100;

export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_LOCALE = 'en';

export const SUPPORTED_LOCALES = ['en', 'he', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const RTL_LOCALES: SupportedLocale[] = ['he'];

export const TRUST_SCORE: Record<string, number> = {
  official: 100,
  trusted_partner: 75,
  limited: 40,
  unverified: 10,
  blocked: 0,
};

export const TRUST_BADGE_LABELS: Record<string, string> = {
  official: 'Official',
  trusted_partner: 'Trusted',
  limited: 'Limited',
  unverified: 'Unverified',
  blocked: 'Blocked',
};

export const AIRLINE_REGISTRY: Record<string, { name: string; iata: string }> = {
  'elal': { name: 'El Al', iata: 'LY' },
  'arkia': { name: 'Arkia', iata: 'IZ' },
  'israir': { name: 'Israir', iata: '6H' },
  'ryanair': { name: 'Ryanair', iata: 'FR' },
  'easyjet': { name: 'easyJet', iata: 'U2' },
  'british_airways': { name: 'British Airways', iata: 'BA' },
  'lufthansa': { name: 'Lufthansa', iata: 'LH' },
  'air_france': { name: 'Air France', iata: 'AF' },
  'turkish': { name: 'Turkish Airlines', iata: 'TK' },
  'wizz': { name: 'Wizz Air', iata: 'W6' },
};
