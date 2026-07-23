import { z } from "zod";
import { AccessTier, ExtraType } from "@heaven-pass/types";
import { idSchema } from "./common";

export const createReservationSchema = z.object({
  membershipId: idSchema,
  eventId: idSchema,
  tier: z.nativeEnum(AccessTier).optional(),
});
export type CreateReservationSchema = z.infer<typeof createReservationSchema>;

export const cancelReservationSchema = z.object({
  reason: z.string().trim().min(1).max(280).optional(),
});
export type CancelReservationSchema = z.infer<typeof cancelReservationSchema>;

export const addExtraSchema = z
  .object({
    type: z.nativeEnum(ExtraType),
    amountCents: z.number().int().positive().optional(),
  })
  .refine(
    (data) => data.type !== ExtraType.TABLE_FACILITATION || data.amountCents !== undefined,
    { message: "amountCents is required for TABLE_FACILITATION", path: ["amountCents"] },
  );
export type AddExtraSchema = z.infer<typeof addExtraSchema>;
