import { ReservationStatus } from "@heaven-pass/types";
import { prisma } from "../lib/prisma";

const BATCH_SIZE = 200;

/**
 * Releases PENDING reservations whose hold window has passed, freeing both the
 * EventSlot spot (`reserved`) and the membership access (`accessesUsed`) they
 * were claiming, so the next member in line can grab them.
 *
 * Runs in small transactions per reservation rather than one giant one: an
 * expiry sweep processes an unbounded number of stale holds, and a single
 * multi-hour transaction would hold locks on unrelated slots the whole time.
 */
export async function expirePendingReservations(now: Date = new Date()): Promise<{ expiredCount: number }> {
  let expiredCount = 0;

  for (;;) {
    const batch = await prisma.reservation.findMany({
      where: { status: ReservationStatus.PENDING, holdExpiresAt: { lte: now } },
      select: { id: true, eventSlotId: true, membershipId: true },
      take: BATCH_SIZE,
    });
    if (batch.length === 0) break;

    for (const reservation of batch) {
      await prisma.$transaction(async (tx) => {
        // Re-check status inside the transaction in case it was confirmed/cancelled concurrently.
        const { count } = await tx.reservation.updateMany({
          where: { id: reservation.id, status: ReservationStatus.PENDING },
          data: { status: ReservationStatus.EXPIRED, holdExpiresAt: null },
        });
        if (count === 0) return;

        await tx.$executeRaw`
          UPDATE "event_slots"
          SET reserved = GREATEST(reserved - 1, 0), "updatedAt" = now()
          WHERE id = ${reservation.eventSlotId}
        `;
        await tx.$executeRaw`
          UPDATE "memberships"
          SET "accessesUsed" = GREATEST("accessesUsed" - 1, 0), "updatedAt" = now()
          WHERE id = ${reservation.membershipId}
        `;
        expiredCount += 1;
      });
    }

    if (batch.length < BATCH_SIZE) break;
  }

  return { expiredCount };
}
