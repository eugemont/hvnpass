import { z } from "zod";

export const paymentWebhookSchema = z.object({
  provider: z.literal("PAYMENTS"),
  eventType: z.enum(["payment.succeeded", "payment.failed", "payment.refunded"]),
  referenceType: z.enum(["MEMBERSHIP", "EXTRA"]),
  referenceId: z.string().cuid(),
  amountCents: z.number().int().positive(),
  currency: z.string().length(3),
  occurredAt: z.string().datetime(),
});
export type PaymentWebhookSchema = z.infer<typeof paymentWebhookSchema>;
