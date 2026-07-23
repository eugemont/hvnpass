import type {
  AccessTier,
  EventStatus,
  ExtraStatus,
  ExtraType,
  MembershipPlan,
  MembershipStatus,
  ReservationStatus,
  UserRole,
} from "./enums";

/**
 * Wire DTOs shared between apps/api responses and apps/mobile consumption.
 * All dates are ISO-8601 strings (JSON-safe) rather than `Date` instances.
 */

export interface UserDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  country: string | null;
  role: UserRole;
  createdAt: string;
}

export interface MembershipDto {
  id: string;
  userId: string;
  plan: MembershipPlan;
  status: MembershipStatus;
  accessTier: AccessTier;
  accessesTotal: number;
  accessesUsed: number;
  accessesRemaining: number;
  priceCents: number;
  currency: string;
  cancellationsCount: number;
  freeRescheduleUsed: boolean;
  purchasedAt: string;
  expiresAt: string;
}

export interface EventSlotDto {
  id: string;
  eventId: string;
  tier: AccessTier;
  capacity: number;
  sold: number;
  reserved: number;
  /** capacity - sold - reserved, computed server-side. */
  available: number;
  priceOverrideCents: number | null;
}

export interface EventDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  venue: string;
  city: string;
  country: string;
  startsAt: string;
  doorsOpen: string;
  coverImageUrl: string | null;
  isOutdoor: boolean;
  status: EventStatus;
  slots: EventSlotDto[];
}

export interface ReservationDto {
  id: string;
  userId: string;
  membershipId: string;
  eventSlotId: string;
  event: Pick<EventDto, "id" | "slug" | "name" | "venue" | "startsAt" | "coverImageUrl">;
  accessTier: AccessTier;
  status: ReservationStatus;
  qrCode: string;
  expiresAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  checkedInAt: string | null;
  extras: ExtraDto[];
  createdAt: string;
}

export interface ExtraDto {
  id: string;
  reservationId: string;
  type: ExtraType;
  status: ExtraStatus;
  amountCents: number;
  currency: string;
  createdAt: string;
}
