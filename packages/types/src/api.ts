import type { AccessTier, ExtraType, MembershipPlan } from "./enums";
import type { EventDto, MembershipDto, ReservationDto } from "./models";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** GET /events query params */
export interface ListEventsQuery extends PaginationParams {
  city?: string;
  from?: string;
  to?: string;
}
export type ListEventsResponse = Paginated<EventDto>;
export type GetEventResponse = EventDto;

/** POST /memberships */
export interface PurchaseMembershipInput {
  plan: MembershipPlan;
}
export type PurchaseMembershipResponse = MembershipDto;
export type ListMembershipsResponse = MembershipDto[];

/** POST /reservations */
export interface CreateReservationInput {
  membershipId: string;
  eventId: string;
  /** Defaults to the membership's accessTier; must be requested explicitly for upgrades. */
  tier?: AccessTier;
}
export type CreateReservationResponse = ReservationDto;
export type ListReservationsResponse = ReservationDto[];

export interface CancelReservationInput {
  reason?: string;
}

export interface AddExtraInput {
  type: ExtraType;
  /** Required only for extras without a fixed default price (e.g. TABLE_FACILITATION). */
  amountCents?: number;
}

/** POST /webhooks/payments */
export interface PaymentWebhookPayload {
  provider: "PAYMENTS";
  eventType: "payment.succeeded" | "payment.failed" | "payment.refunded";
  referenceType: "MEMBERSHIP" | "EXTRA";
  referenceId: string;
  amountCents: number;
  currency: string;
  occurredAt: string;
}
