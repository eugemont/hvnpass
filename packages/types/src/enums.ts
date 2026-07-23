/**
 * Domain enums shared between apps/api (Prisma) and apps/mobile.
 * Kept as plain string unions/const objects (not Prisma-generated) so the
 * mobile app never needs to depend on @prisma/client.
 */

export const MembershipPlan = {
  BASIC: "BASIC",
  VIP: "VIP",
  BLACK: "BLACK",
} as const;
export type MembershipPlan = (typeof MembershipPlan)[keyof typeof MembershipPlan];

export const MembershipStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

/** Access tier a reservation/slot belongs to. Mirrors the tier granted by each membership plan. */
export const AccessTier = {
  GENERAL: "GENERAL",
  VIP: "VIP",
  BACKSTAGE: "BACKSTAGE",
} as const;
export type AccessTier = (typeof AccessTier)[keyof typeof AccessTier];

export const EventStatus = {
  SCHEDULED: "SCHEDULED",
  SOLD_OUT: "SOLD_OUT",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const ReservationStatus = {
  /** Slot is held (counted against capacity + membership accesses) until expiresAt unless confirmed. */
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  /** Hold expired before confirmation; capacity + access were released. */
  EXPIRED: "EXPIRED",
  /** Member was checked in at the door. */
  USED: "USED",
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const ExtraType = {
  UPGRADE: "UPGRADE",
  LATE_ENTRY: "LATE_ENTRY",
  WEATHER_INSURANCE: "WEATHER_INSURANCE",
  CANCELLATION_FEE: "CANCELLATION_FEE",
  TABLE_FACILITATION: "TABLE_FACILITATION",
} as const;
export type ExtraType = (typeof ExtraType)[keyof typeof ExtraType];

export const ExtraStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const;
export type ExtraStatus = (typeof ExtraStatus)[keyof typeof ExtraStatus];

export const UserRole = {
  MEMBER: "MEMBER",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const WebhookProvider = {
  PAYMENTS: "PAYMENTS",
} as const;
export type WebhookProvider = (typeof WebhookProvider)[keyof typeof WebhookProvider];
