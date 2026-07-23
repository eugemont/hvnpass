import type { Event, EventSlot, Extra, Membership, Reservation } from "@prisma/client";
import type {
  AccessTier,
  EventDto,
  EventSlotDto,
  ExtraDto,
  MembershipDto,
  ReservationDto,
} from "@heaven-pass/types";

export function toEventSlotDto(slot: EventSlot): EventSlotDto {
  return {
    id: slot.id,
    eventId: slot.eventId,
    tier: slot.tier as AccessTier,
    capacity: slot.capacity,
    sold: slot.sold,
    reserved: slot.reserved,
    available: Math.max(0, slot.capacity - slot.sold - slot.reserved),
    priceOverrideCents: slot.priceOverrideCents,
  };
}

export function toEventDto(event: Event & { slots: EventSlot[] }): EventDto {
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    description: event.description,
    venue: event.venue,
    city: event.city,
    country: event.country,
    startsAt: event.startsAt.toISOString(),
    doorsOpen: event.doorsOpen.toISOString(),
    coverImageUrl: event.coverImageUrl,
    isOutdoor: event.isOutdoor,
    status: event.status as EventDto["status"],
    slots: event.slots.map(toEventSlotDto),
  };
}

export function toMembershipDto(membership: Membership): MembershipDto {
  return {
    id: membership.id,
    userId: membership.userId,
    plan: membership.plan as MembershipDto["plan"],
    status: membership.status as MembershipDto["status"],
    accessTier: membership.accessTier as AccessTier,
    accessesTotal: membership.accessesTotal,
    accessesUsed: membership.accessesUsed,
    accessesRemaining: Math.max(0, membership.accessesTotal - membership.accessesUsed),
    priceCents: membership.priceCents,
    currency: membership.currency,
    cancellationsCount: membership.cancellationsCount,
    freeRescheduleUsed: membership.freeRescheduleUsed,
    purchasedAt: membership.purchasedAt.toISOString(),
    expiresAt: membership.expiresAt.toISOString(),
  };
}

export function toExtraDto(extra: Extra): ExtraDto {
  return {
    id: extra.id,
    reservationId: extra.reservationId,
    type: extra.type as ExtraDto["type"],
    status: extra.status as ExtraDto["status"],
    amountCents: extra.amountCents,
    currency: extra.currency,
    createdAt: extra.createdAt.toISOString(),
  };
}

type ReservationWithRelations = Reservation & {
  eventSlot: EventSlot & { event: Event };
  extras: Extra[];
};

export function toReservationDto(reservation: ReservationWithRelations): ReservationDto {
  return {
    id: reservation.id,
    userId: reservation.userId,
    membershipId: reservation.membershipId,
    eventSlotId: reservation.eventSlotId,
    event: {
      id: reservation.eventSlot.event.id,
      slug: reservation.eventSlot.event.slug,
      name: reservation.eventSlot.event.name,
      venue: reservation.eventSlot.event.venue,
      startsAt: reservation.eventSlot.event.startsAt.toISOString(),
      coverImageUrl: reservation.eventSlot.event.coverImageUrl,
    },
    accessTier: reservation.accessTier as AccessTier,
    status: reservation.status as ReservationDto["status"],
    qrCode: reservation.qrCode,
    expiresAt: reservation.holdExpiresAt?.toISOString() ?? null,
    confirmedAt: reservation.confirmedAt?.toISOString() ?? null,
    cancelledAt: reservation.cancelledAt?.toISOString() ?? null,
    checkedInAt: reservation.checkedInAt?.toISOString() ?? null,
    extras: reservation.extras.map(toExtraDto),
    createdAt: reservation.createdAt.toISOString(),
  };
}
