import { z } from "zod";
import { MembershipPlan } from "@heaven-pass/types";

export const purchaseMembershipSchema = z.object({
  plan: z.nativeEnum(MembershipPlan),
});
export type PurchaseMembershipSchema = z.infer<typeof purchaseMembershipSchema>;
