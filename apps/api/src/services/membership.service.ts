import { MEMBERSHIP_PLANS, MembershipPlan, MembershipStatus, type MembershipDto } from "@heaven-pass/types";
import { addMinutes } from "@heaven-pass/utils";
import { prisma } from "../lib/prisma";
import { toMembershipDto } from "../lib/mappers";

/** Membership validity window for a single Punta del Este summer season. */
const SEASON_DURATION_MINUTES = 90 * 24 * 60;

/** Assumes the caller already confirmed payment client-side; the payments webhook reconciles/cancels if it later fails. */
export async function purchaseMembership(userId: string, plan: MembershipPlan): Promise<MembershipDto> {
  const definition = MEMBERSHIP_PLANS[plan];
  const now = new Date();

  const membership = await prisma.membership.create({
    data: {
      userId,
      plan,
      status: MembershipStatus.ACTIVE,
      accessTier: definition.accessTier,
      accessesTotal: definition.accessesIncluded,
      priceCents: definition.basePriceCents,
      currency: definition.currency,
      purchasedAt: now,
      expiresAt: addMinutes(now, SEASON_DURATION_MINUTES),
    },
  });

  return toMembershipDto(membership);
}

export async function listMembershipsForUser(userId: string): Promise<MembershipDto[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    orderBy: { purchasedAt: "desc" },
  });
  return memberships.map(toMembershipDto);
}
