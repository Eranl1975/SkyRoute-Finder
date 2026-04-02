// All flags default to safe/off. Toggle per environment as needed.
export const featureFlags = {
  // Booking automation — MUST remain false until fully audited
  bookingEnabled: false,
  bookingApprovalRequired: true,

  // Search features — enabled
  priceAlertsEnabled: true,
  flexibleDatesEnabled: true,
  cheapestMonthViewEnabled: true,

  // Hotel features — enabled
  hotelByAttractionEnabled: true,

  // Provider mode — admin can override at runtime via OfficialOnlyToggle
  officialSitesOnlyMode: false,

  // Dev/debug
  showMockBadge: true,
  adminPanelEnabled: true,
  analyticsEnabled: true,            // logs to Supabase search_analytics
};

export type FeatureFlags = typeof featureFlags;
