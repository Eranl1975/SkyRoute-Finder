import { featureFlags } from '@/config/feature-flags';

export function isBookingEnabled(): boolean {
  return featureFlags.bookingEnabled;
}

export function requireApprovalBeforeBooking(): boolean {
  return featureFlags.bookingApprovalRequired;
}

/** Guard: throws if booking is not enabled. Use at every booking entry point. */
export function assertBookingEnabled(): void {
  if (!isBookingEnabled()) {
    throw new Error(
      'Booking automation is disabled. Set featureFlags.bookingEnabled = true to proceed.'
    );
  }
}
