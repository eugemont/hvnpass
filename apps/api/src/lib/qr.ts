import { randomBytes } from "node:crypto";

/**
 * Reservation QR codes are opaque, unguessable reference tokens (not self-contained
 * signed payloads): the mobile wallet renders the token as a QR image, and door
 * staff verify it with a DB lookup (`prisma.reservation.findUnique({ where: { qrCode } })`),
 * which they need to do anyway to check status/expiry/tier before granting access.
 */
export function generateQrToken(): string {
  return randomBytes(24).toString("base64url");
}
