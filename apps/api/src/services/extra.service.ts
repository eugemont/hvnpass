import {
  AccessTier,
  EXTRA_DEFINITIONS,
  ExtraStatus,
  ExtraType,
  ReservationStatus,
  type ReservationDto,
} from "@heaven-pass/types";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import { toReservationDto } from "../lib/mappers";
import { RESERVATION_INCLUDE, type ReservationWithRelations } from "./reservation.service";

/**
 * Adds a paid extra to a reservation. UPGRADE is special-cased: it also moves
 * the reservation's slot claim from the GENERAL EventSlot to the VIP one for
 * that same event, atomically guarded the same way slot creation is.
 */
export async function addExtraToReservation(params: {
  reservationId: string;
  userId: string;
  type: ExtraType;
  amountCents?: number;
}): Promise<ReservationDto> {
  const { reservationId, userId, type } = params;

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: RESERVATION_INCLUDE,
  });
  if (!reservation || reservation.userId !== userId) {
    throw new HttpError(404, "RESERVATION_NOT_FOUND", "Reservation not found");
  }
  if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.CONFIRMED) {
    throw new HttpError(409, "INVALID_STATE", `Cannot add extras to a reservation in status ${reservation.status}`);
  }

  if (type === ExtraType.CANCELLATION_FEE) {
    throw new HttpError(400, "NOT_SELF_SERVICE", "Cancellation fees are generated automatically on cancellation");
  }
  if (type === ExtraType.WEATHER_INSURANCE && !reservation.eventSlot.event.isOutdoor) {
    throw new HttpError(400, "NOT_APPLICABLE", "Weather insurance only applies to outdoor events");
  }

  if (type === ExtraType.UPGRADE) {
    return upgradeReservationTier(reservation);
  }

  const definition = EXTRA_DEFINITIONS[type];
  const amountCents = params.amountCents ?? definition.defaultPriceCents;
  if (amountCents == null) {
    throw new HttpError(400, "AMOUNT_REQUIRED", `amountCents is required for ${type}`);
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      extras: {
        create: { type, status: ExtraStatus.PENDING, amountCents, currency: definition.currency },
      },
    },
    include: RESERVATION_INCLUDE,
  });

  return toReservationDto(updated);
}

async function upgradeReservationTier(reservation: ReservationWithRelations): Promise<ReservationDto> {
  if (reservation.accessTier !== AccessTier.GENERAL) {
    throw new HttpError(400, "NOT_APPLICABLE", "Only GENERAL access can be upgraded to VIP");
  }

  const targetSlot = await prisma.eventSlot.findUnique({
    where: { eventId_tier: { eventId: reservation.eventSlot.eventId, tier: AccessTier.VIP } },
  });
  if (!targetSlot) {
    throw new HttpError(404, "SLOT_NOT_FOUND", "This event has no VIP tier to upgrade into");
  }

  const claimColumn = reservation.status === ReservationStatus.CONFIRMED ? "sold" : "reserved";
  const definition = EXTRA_DEFINITIONS[ExtraType.UPGRADE];

  const updated = await prisma.$transaction(async (tx) => {
    const claimUpdate = await tx.$executeRawUnsafe(
      `UPDATE "event_slots" SET ${claimColumn} = ${claimColumn} + 1, "updatedAt" = now()
       WHERE id = $1 AND (sold + reserved + 1) <= capacity`,
      targetSlot.id,
    );
    if (claimUpdate === 0) {
      throw new HttpError(409, "SLOT_FULL", "No VIP spots left for this event");
    }

    await tx.$executeRawUnsafe(
      `UPDATE "event_slots" SET ${claimColumn} = GREATEST(${claimColumn} - 1, 0), "updatedAt" = now() WHERE id = $1`,
      reservation.eventSlotId,
    );

    return tx.reservation.update({
      where: { id: reservation.id },
      data: {
        accessTier: AccessTier.VIP,
        eventSlotId: targetSlot.id,
        extras: {
          create: {
            type: ExtraType.UPGRADE,
            status: ExtraStatus.PENDING,
            amountCents: definition.defaultPriceCents ?? 0,
            currency: definition.currency,
          },
        },
      },
      include: RESERVATION_INCLUDE,
    });
  });

  return toReservationDto(updated);
}
