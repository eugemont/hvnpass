import { timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { paymentWebhookSchema } from "@heaven-pass/validations";
import { ExtraStatus, MembershipStatus } from "@heaven-pass/types";
import { env } from "../lib/env";
import { HttpError } from "../lib/http-error";
import { prisma } from "../lib/prisma";

function verifyWebhookSecret(c: { req: { header: (name: string) => string | undefined } }): void {
  const provided = c.req.header("x-webhook-secret") ?? "";
  const expected = env.PAYMENTS_WEBHOOK_SECRET;
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
    throw new HttpError(401, "INVALID_WEBHOOK_SIGNATURE", "Invalid webhook secret");
  }
}

export const webhooksRoute = new Hono().post(
  "/payments",
  zValidator("json", paymentWebhookSchema),
  async (c) => {
    verifyWebhookSecret(c);
    const payload = c.req.valid("json");

    await prisma.webhookEvent.create({
      data: {
        provider: payload.provider,
        eventType: payload.eventType,
        referenceType: payload.referenceType,
        referenceId: payload.referenceId,
        payload,
      },
    });

    if (payload.referenceType === "EXTRA") {
      await applyExtraPayment(payload.referenceId, payload.eventType);
    } else {
      await applyMembershipPayment(payload.referenceId, payload.eventType);
    }

    return c.json({ received: true });
  },
);

async function applyExtraPayment(extraId: string, eventType: string): Promise<void> {
  const status =
    eventType === "payment.succeeded"
      ? ExtraStatus.PAID
      : eventType === "payment.refunded"
        ? ExtraStatus.REFUNDED
        : ExtraStatus.FAILED;

  await prisma.extra.updateMany({ where: { id: extraId }, data: { status } });
}

async function applyMembershipPayment(membershipId: string, eventType: string): Promise<void> {
  if (eventType === "payment.failed") {
    await prisma.membership.updateMany({
      where: { id: membershipId },
      data: { status: MembershipStatus.CANCELLED },
    });
  }
  // payment.succeeded: membership is already created ACTIVE at purchase time (see membership.service.ts).
  // payment.refunded: handled the same as a failed payment for the membership's active status.
  if (eventType === "payment.refunded") {
    await prisma.membership.updateMany({
      where: { id: membershipId },
      data: { status: MembershipStatus.CANCELLED },
    });
  }
}
