import type { Prisma } from "@prisma/client";
import {
  AccessTier,
  EventStatus,
  ExtraStatus,
  ExtraType,
  MembershipStatus,
  ReservationStatus,
  EXTRA_DEFINITIONS,
  FREE_CANCELLATIONS_PER_MEMBERSHIP,
  RESERVATION_HOLD_MINUTES,
  type ReservationDto,
} from "@heaven-pass/types";
import { addMinutes } from "@heaven-pass/utils";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import { generateQrToken } from "../lib/qr";
import { toReservationDto } from "../lib/mappers";

const RESERVATION_INCLUDE = {
  eventSlot: { include: { event: true } },
  extras: true,
} satisfies Prisma.ReservationInclude;

type ReservationWithRelations = Prisma.ReservationGetPayload<{ include: typeof RESERVATION_INCLUDE }>;

/**
 * Creates a PENDING reservation, atomically claiming both a slot spot and a
 * membership access. Neither claim is allowed to push its counter past its
 * limit, even under concurrent requests for the last spot:
 *
 *   UPDATE event_slots SET reserved = reserved + 1
 *   WHERE id = $1 AND (sold + reserved + 1) <= capacity
 *
 * Postgres evaluates the WHERE clause and applies the row lock atomically per
 * statement, so two concurrent transactions racing for the last spot can
 * never both succeed: whichever commits first makes the second one's WHERE
 * clause false. `$executeRaw` returns the affected row count, which is 0 when
 * the guard failed - that's the signal to abort with 409 instead of
 * overselling. The same pattern guards the membership's accessesUsed counter.
 */
export async function createReservation(params: {
  userId: string;
  membershipId: string;
  eventId: string;
  tier?: AccessTier;
}): Promise<ReservationDto> {
  const { userId, membershipId, eventId } = params;

  const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!membership || membership.userId !== userId) {
    throw new HttpError(404, "MEMBERSHIP_NOT_FOUND", "Membership not found");
  }
  if (membership.status !== MembershipStatus.ACTIVE) {
    throw new HttpError(409, "MEMBERSHIP_INACTIVE", "Membership is not active");
  }
  if (membership.expiresAt.getTime() <= Date.now()) {
    throw new HttpError(409, "MEMBERSHIP_EXPIRED", "Membership has expired");
  }

  const tier = params.tier ?? (membership.accessTier as AccessTier);
  if (tier !== membership.accessTier) {
    throw new HttpError(
      409,
      "TIER_UPGRADE_REQUIRED",
      "Reserving above your membership's tier requires booking at your tier first, then adding an UPGRADE extra",
    );
  }

  const slot = await prisma.eventSlot.findUnique({
    where: { eventId_tier: { eventId, tier } },
    include: { event: true },
  });
  if (!slot) {
    throw new HttpError(404, "SLOT_NOT_FOUND", "No slot for this event/tier");
  }
  if (slot.event.status !== EventStatus.SCHEDULED) {
    throw new HttpError(409, "EVENT_NOT_BOOKABLE", `Event is ${slot.event.status.toLowerCase()}`);
  }

  const existing = await prisma.reservation.findFirst({
    where: {
      membershipId,
      eventSlot: { eventId },
      status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.USED] },
    },
  });
  if (existing) {
    throw new HttpError(409, "ALREADY_RESERVED", "This membership already has an active reservation for this event");
  }

  const qrCode = generateQrToken();
  const holdExpiresAt = addMinutes(new Date(), RESERVATION_HOLD_MINUTES);

  const reservation = await prisma.$transaction(async (tx) => {
    const slotUpdate = await tx.$executeRaw`
      UPDATE "event_slots"
      SET reserved = reserved + 1, "updatedAt" = now()
      WHERE id = ${slot.id} AND (sold + reserved + 1) <= capacity
    `;
    if (slotUpdate === 0) {
      throw new HttpError(409, "SLOT_FULL", "No spots left for this tier");
    }

    const membershipUpdate = await tx.$executeRaw`
      UPDATE "memberships"
      SET "accessesUsed" = "accessesUsed" + 1, "updatedAt" = now()
      WHERE id = ${membershipId} AND ("accessesUsed" + 1) <= "accessesTotal"
    `;
    if (membershipUpdate === 0) {
      throw new HttpError(409, "NO_ACCESSES_LEFT", "This membership has no accesses remaining");
    }

    return tx.reservation.create({
      data: {
        userId,
        membershipId,
        eventSlotId: slot.id,
        accessTier: tier,
        status: ReservationStatus.PENDING,
        qrCode,
        holdExpiresAt,
      },
      include: RESERVATION_INCLUDE,
    });
  });

  return toReservationDto(reservation);
}

/** Locks in a PENDING hold: moves the slot claim from `reserved` to `sold` and clears the hold expiry. */
export async function confirmReservation(reservationId: string, userId: string): Promise<ReservationDto> {
  const reservation = await getOwnedReservationOrThrow(reservationId, userId);
  if (reservation.status !== ReservationStatus.PENDING) {
    throw new HttpError(409, "INVALID_STATE", `Cannot confirm a reservation in status ${reservation.status}`);
  }
  if (reservation.holdExpiresAt && reservation.holdExpiresAt.getTime() <= Date.now()) {
    throw new HttpError(409, "HOLD_EXPIRED", "This reservation's hold has expired");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "event_slots"
      SET sold = sold + 1, reserved = reserved - 1, "updatedAt" = now()
      WHERE id = ${reservation.eventSlotId}
    `;
    return tx.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.CONFIRMED, confirmedAt: new Date(), holdExpiresAt: null },
      include: RESERVATION_INCLUDE,
    });
  });

  return toReservationDto(updated);
}

export async function cancelReservation(
  reservationId: string,
  userId: string,
  reason?: string,
): Promise<ReservationDto> {
  const reservation = await getOwnedReservationOrThrow(reservationId, userId);
  if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.CONFIRMED) {
    throw new HttpError(409, "INVALID_STATE", `Cannot cancel a reservation in status ${reservation.status}`);
  }

  const wasConfirmed = reservation.status === ReservationStatus.CONFIRMED;
  const slotColumn = wasConfirmed ? "sold" : "reserved";

  const updated = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `UPDATE "event_slots" SET ${slotColumn} = GREATEST(${slotColumn} - 1, 0), "updatedAt" = now() WHERE id = $1`,
      reservation.eventSlotId,
    );
    await tx.$executeRaw`
      UPDATE "memberships"
      SET "accessesUsed" = GREATEST("accessesUsed" - 1, 0), "updatedAt" = now()
      WHERE id = ${reservation.membershipId}
    `;

    const membership = await tx.membership.update({
      where: { id: reservation.membershipId },
      data: { cancellationsCount: { increment: 1 } },
    });

    // First cancellation per membership is free (per plan benefits); the next ones incur a fee.
    if (membership.cancellationsCount > FREE_CANCELLATIONS_PER_MEMBERSHIP) {
      await tx.extra.create({
        data: {
          reservationId,
          type: ExtraType.CANCELLATION_FEE,
          status: ExtraStatus.PENDING,
          amountCents: EXTRA_DEFINITIONS[ExtraType.CANCELLATION_FEE].defaultPriceCents ?? 0,
          currency: EXTRA_DEFINITIONS[ExtraType.CANCELLATION_FEE].currency,
        },
      });
    }

    return tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledReason: reason,
        holdExpiresAt: null,
      },
      include: RESERVATION_INCLUDE,
    });
  });

  return toReservationDto(updated);
}

export async function checkInReservation(reservationId: string): Promise<ReservationDto> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: RESERVATION_INCLUDE,
  });
  if (!reservation) {
    throw new HttpError(404, "RESERVATION_NOT_FOUND", "Reservation not found");
  }
  if (reservation.status !== ReservationStatus.CONFIRMED) {
    throw new HttpError(409, "INVALID_STATE", `Cannot check in a reservation in status ${reservation.status}`);
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: ReservationStatus.USED, checkedInAt: new Date() },
    include: RESERVATION_INCLUDE,
  });
  return toReservationDto(updated);
}

export async function listReservationsForUser(userId: string): Promise<ReservationDto[]> {
  const reservations = await prisma.reservation.findMany({
    where: { userId },
    include: RESERVATION_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return reservations.map(toReservationDto);
}

export async function getReservationForUser(reservationId: string, userId: string): Promise<ReservationDto> {
  const reservation = await getOwnedReservationOrThrow(reservationId, userId);
  return toReservationDto(reservation);
}

async function getOwnedReservationOrThrow(reservationId: string, userId: string): Promise<ReservationWithRelations> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: RESERVATION_INCLUDE,
  });
  if (!reservation || reservation.userId !== userId) {
    throw new HttpError(404, "RESERVATION_NOT_FOUND", "Reservation not found");
  }
  return reservation;
}

export { RESERVATION_INCLUDE };
export type { ReservationWithRelations };
