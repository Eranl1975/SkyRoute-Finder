/**
 * Skill 6 — Future Booking Automation Scaffold
 * All interfaces are defined but no real booking is ever executed.
 * featureFlags.bookingEnabled must be true before any method fires.
 */
import type { NormalizedFlight } from '@/types/flight';
import type { NormalizedHotel } from '@/types/hotel';

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  passportNumber?: string;
  nationality?: string;
  email: string;
  phone: string;
}

export interface BookingRequest {
  flight: NormalizedFlight;
  passengers: PassengerDetails[];
  contactEmail: string;
  // NOTE: Never store full card details here — redirect to payment provider only
  paymentRedirectUrl?: string;
}

export interface HotelBookingRequest {
  hotel: NormalizedHotel;
  checkIn: string;
  checkOut: string;
  guests: PassengerDetails[];
  contactEmail: string;
}

export interface BookingResult {
  success: boolean;
  bookingReference?: string;
  confirmationUrl?: string;
  errorMessage?: string;
  // Audit fields
  attemptedAt: string;
  completedAt?: string;
  approvedBy?: string; // future: human approval workflow
}

export interface IBookingService {
  /** Future: submit booking to provider. Disabled by default. */
  bookFlight(request: BookingRequest): Promise<BookingResult>;
  bookHotel(request: HotelBookingRequest): Promise<BookingResult>;
  /** Future: send confirmation email after booking */
  sendConfirmation(bookingRef: string, email: string): Promise<void>;
}

// TODO (Legal/Security/Reliability):
// - PCI DSS compliance required before any payment handling
// - GDPR consent must be captured before storing passenger data
// - Approval workflow required before enabling automated booking
// - Rate limiting and fraud detection must be in place
// - All booking actions must be reversible (cancellation flow)
// - Audit trail must be immutable
