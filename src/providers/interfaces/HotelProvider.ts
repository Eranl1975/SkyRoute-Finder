import type { HotelSearchParams, RawHotel } from '@/types/hotel';
import type { TrustLevel } from '@/types/trust';

export interface IHotelProvider {
  readonly id: string;
  readonly name: string;
  readonly trustLevel: TrustLevel;
  readonly isEnabled: boolean;
  readonly isMock: boolean;
  search(params: HotelSearchParams): Promise<RawHotel[]>;
}
