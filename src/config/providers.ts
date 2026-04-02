// Which provider adapters are registered for each mode
export const providerConfig = {
  // Adapter IDs that are enabled in mock mode
  mockFlightAdapters: ['mock_flights'],
  mockHotelAdapters: ['mock_hotels'],

  // Adapter IDs that are enabled in live mode (scaffolded, not yet implemented)
  liveFlightAdapters: ['elal', 'ryanair', 'easyjet', 'wizz', 'british_airways', 'lufthansa', 'air_france', 'turkish'],
  liveHotelAdapters: ['booking_com'],

  // Per-adapter timeout in ms
  adapterTimeoutMs: 8_000,

  // Whether to run adapters in parallel (recommended)
  parallelSearch: true,
};
