/**
 * Skill 6 — Booking Scaffold (disabled by default)
 * Exposes future booking interface. Real implementation is a TODO.
 */
import type { IBookingService, BookingRequest, HotelBookingRequest, BookingResult } from './interfaces';
import { assertBookingEnabled } from './featureFlags';
import { nowISO } from '@/lib/utils';

// Stub implementation — safe no-op that explains the disabled state
export const bookingService: IBookingService = {
  async bookFlight(_req: BookingRequest): Promise<BookingResult> {
    assertBookingEnabled(); // throws — booking disabled
    // TODO: Implement live booking adapter (requires legal/compliance sign-off)
    return { success: false, errorMessage: 'Not implemented', attemptedAt: nowISO() };
  },

  async bookHotel(_req: HotelBookingRequest): Promise<BookingResult> {
    assertBookingEnabled();
    // TODO: Implement hotel booking adapter
    return { success: false, errorMessage: 'Not implemented', attemptedAt: nowISO() };
  },

  async sendConfirmation(_bookingRef: string, _toEmail: string): Promise<void> {
    assertBookingEnabled();
    // TODO: Integrate email service (SendGrid / SES / Postmark)
  },
};

export { assertBookingEnabled, isBookingEnabled, requireApprovalBeforeBooking } from './featureFlags';
export type { IBookingService, BookingRequest, HotelBookingRequest, BookingResult, PassengerDetails } from './interfaces';
