import { AccessTier, ExtraType, MembershipPlan } from "./enums";

/** Static business rules for each membership plan, per the Heaven Pass pitch (temporada 2025-2026). */
export interface MembershipPlanDefinition {
  plan: MembershipPlan;
  label: string;
  /** Base price in cents (USD). BLACK is a starting price - final price can vary per event. */
  basePriceCents: number;
  currency: "USD";
  /** Number of accesses included in the plan. */
  accessesIncluded: number;
  /** Access tier the plan's accesses grant on EventSlots. */
  accessTier: AccessTier;
  hasPriorityReservationWindow: boolean;
  hasFreeLateEntry: boolean;
  hasFreeFirstReschedule: boolean;
  hasConciergeService: boolean;
  variablePricing: boolean;
}

export const MEMBERSHIP_PLANS: Record<MembershipPlan, MembershipPlanDefinition> = {
  [MembershipPlan.BASIC]: {
    plan: MembershipPlan.BASIC,
    label: "Basic",
    basePriceCents: 49_000,
    currency: "USD",
    accessesIncluded: 5,
    accessTier: AccessTier.GENERAL,
    hasPriorityReservationWindow: false,
    hasFreeLateEntry: false,
    hasFreeFirstReschedule: true,
    hasConciergeService: false,
    variablePricing: false,
  },
  [MembershipPlan.VIP]: {
    plan: MembershipPlan.VIP,
    label: "VIP",
    basePriceCents: 79_000,
    currency: "USD",
    accessesIncluded: 6,
    accessTier: AccessTier.VIP,
    hasPriorityReservationWindow: true,
    hasFreeLateEntry: true,
    hasFreeFirstReschedule: true,
    hasConciergeService: false,
    variablePricing: false,
  },
  [MembershipPlan.BLACK]: {
    plan: MembershipPlan.BLACK,
    label: "Black",
    basePriceCents: 119_000,
    currency: "USD",
    accessesIncluded: 6,
    accessTier: AccessTier.BACKSTAGE,
    hasPriorityReservationWindow: true,
    hasFreeLateEntry: true,
    hasFreeFirstReschedule: true,
    hasConciergeService: true,
    variablePricing: true,
  },
};

/** Extra charges available on top of a membership, per the pitch's "ingresos adicionales" section. */
export interface ExtraDefinition {
  type: ExtraType;
  label: string;
  /** Fixed price in cents, or null when the amount is computed dynamically (e.g. upgrade price diff). */
  defaultPriceCents: number | null;
  currency: "USD";
}

export const EXTRA_DEFINITIONS: Record<ExtraType, ExtraDefinition> = {
  [ExtraType.UPGRADE]: {
    type: ExtraType.UPGRADE,
    label: "Upgrade de acceso (General -> VIP)",
    defaultPriceCents: 3_500,
    currency: "USD",
  },
  [ExtraType.LATE_ENTRY]: {
    type: ExtraType.LATE_ENTRY,
    label: "Late entry (post 2am)",
    defaultPriceCents: 1_800,
    currency: "USD",
  },
  [ExtraType.WEATHER_INSURANCE]: {
    type: ExtraType.WEATHER_INSURANCE,
    label: "Seguro de clima (fiestas al aire libre)",
    defaultPriceCents: 2_500,
    currency: "USD",
  },
  [ExtraType.CANCELLATION_FEE]: {
    type: ExtraType.CANCELLATION_FEE,
    label: "Fee por segunda cancelacion",
    defaultPriceCents: 2_000,
    currency: "USD",
  },
  [ExtraType.TABLE_FACILITATION]: {
    type: ExtraType.TABLE_FACILITATION,
    label: "Facilitacion de mesa (plan Black)",
    defaultPriceCents: null,
    currency: "USD",
  },
};

/** Minutes a PENDING reservation hold is kept before it's released back to the pool. */
export const RESERVATION_HOLD_MINUTES = 15;

/** First cancellation per membership is free; the second onward incurs CANCELLATION_FEE. */
export const FREE_CANCELLATIONS_PER_MEMBERSHIP = 1;
