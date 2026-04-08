import { NextResponse } from 'next/server';

export interface ProviderStatus {
  id: string;
  name: string;
  type: 'flight' | 'hotel';
  isMock: boolean;
  hasApiKey: boolean;
  isActive: boolean; // true when PROVIDER_MODE=live and hasApiKey (or mock)
}

export interface AdminStatusResponse {
  providerMode: string;
  providers: ProviderStatus[];
}

export async function GET(): Promise<NextResponse<AdminStatusResponse>> {
  const mode = process.env.NEXT_PUBLIC_PROVIDER_MODE ?? 'mock';
  const isLive = mode === 'live';

  const hasDuffel = Boolean(process.env.DUFFEL_ACCESS_TOKEN);

  const providers: ProviderStatus[] = [
    {
      id: 'mock_flights',
      name: 'Mock Flights [DEV]',
      type: 'flight',
      isMock: true,
      hasApiKey: true,
      isActive: !isLive, // only active in mock mode
    },
    {
      id: 'mock_hotels',
      name: 'Mock Hotels [DEV]',
      type: 'hotel',
      isMock: true,
      hasApiKey: true,
      isActive: !isLive,
    },
    {
      id: 'duffel',
      name: 'Duffel (300+ Airlines)',
      type: 'flight',
      isMock: false,
      hasApiKey: hasDuffel,
      isActive: isLive && hasDuffel,
    },
    {
      id: 'elal',
      name: 'El Al (Direct Booking)',
      type: 'flight',
      isMock: false,
      hasApiKey: true, // no API key needed — uses direct booking URL like Ryanair
      isActive: isLive,
    },
    {
      id: 'ryanair',
      name: 'Ryanair (no key needed)',
      type: 'flight',
      isMock: false,
      hasApiKey: true, // no key needed
      isActive: isLive,
    },
    {
      id: 'booking_com_rapid',
      name: 'Booking.com (RapidAPI — Live)',
      type: 'hotel',
      isMock: false,
      hasApiKey: Boolean(process.env.RAPIDAPI_BOOKING_KEY),
      isActive: isLive && Boolean(process.env.RAPIDAPI_BOOKING_KEY),
    },
    {
      id: 'booking_com',
      name: 'Booking.com (Affiliate API)',
      type: 'hotel',
      isMock: false,
      hasApiKey: Boolean(process.env.BOOKING_COM_API_KEY),
      isActive: isLive && Boolean(process.env.BOOKING_COM_API_KEY),
    },
  ];

  return NextResponse.json({ providerMode: mode, providers });
}
