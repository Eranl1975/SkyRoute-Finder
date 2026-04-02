import type { SupportedLocale } from '@/lib/constants';

type NotFoundKey =
  | 'routeNotFound'
  | 'dateRangeNotFound'
  | 'airlineNotFound'
  | 'baggageNotFound'
  | 'stopoverNotFound'
  | 'sourceUnavailable'
  | 'noResults';

const TEMPLATES: Record<NotFoundKey, Record<SupportedLocale, string>> = {
  routeNotFound: {
    en: 'Route not found: {origin} → {destination}',
    he: 'מסלול לא נמצא: {origin} → {destination}',
    es: 'Ruta no encontrada: {origin} → {destination}',
  },
  dateRangeNotFound: {
    en: 'No flights between {startDate} and {endDate}',
    he: 'אין טיסות בין {startDate} ל-{endDate}',
    es: 'Sin vuelos entre {startDate} y {endDate}',
  },
  airlineNotFound: {
    en: 'Airline "{airline}" not found on this route',
    he: 'חברת "{airline}" לא נמצאה במסלול זה',
    es: 'Aerolínea "{airline}" no encontrada en esta ruta',
  },
  baggageNotFound: {
    en: 'No flights with {bags} checked bag(s) at {weight}kg',
    he: 'לא נמצאו טיסות עם {bags} מזוודות של {weight}ק"ג',
    es: 'Sin vuelos con {bags} maleta(s) de {weight}kg',
  },
  stopoverNotFound: {
    en: 'No flights matching your stopover preference',
    he: 'לא נמצאו טיסות התואמות את העדפת העצירות שלך',
    es: 'Sin vuelos que coincidan con tu preferencia de escalas',
  },
  sourceUnavailable: {
    en: 'Some search sources are currently unavailable',
    he: 'חלק ממקורות החיפוש אינם זמינים כעת',
    es: 'Algunas fuentes de búsqueda no están disponibles',
  },
  noResults: {
    en: 'No flights found. Try adjusting your search.',
    he: 'לא נמצאו טיסות. נסה לשנות את החיפוש.',
    es: 'Sin vuelos. Intenta ajustar la búsqueda.',
  },
};

export function getTemplate(key: NotFoundKey, locale: SupportedLocale): string {
  return TEMPLATES[key]?.[locale] ?? TEMPLATES[key]?.en ?? key;
}

export function renderTemplate(
  key: NotFoundKey,
  locale: SupportedLocale,
  vars: Record<string, string | number>
): string {
  const tpl = getTemplate(key, locale);
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
