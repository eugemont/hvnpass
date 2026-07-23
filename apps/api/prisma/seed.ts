import { PrismaClient } from "@prisma/client";
import { AccessTier, MEMBERSHIP_PLANS, MembershipPlan, MembershipStatus, UserRole } from "@heaven-pass/types";
import { slugify } from "@heaven-pass/utils";

const prisma = new PrismaClient();

const PARTIES: Array<{
  name: string;
  venue: string;
  city: string;
  daysFromNow: number;
  isOutdoor: boolean;
  capacities: Record<AccessTier, number>;
}> = [
  {
    name: "Templo Opening",
    venue: "Open Park",
    city: "Punta del Este",
    daysFromNow: 5,
    isOutdoor: true,
    capacities: { GENERAL: 4000, VIP: 400, BACKSTAGE: 60 },
  },
  {
    name: "Sensation White Night",
    venue: "Open Park",
    city: "Punta del Este",
    daysFromNow: 8,
    isOutdoor: true,
    capacities: { GENERAL: 5000, VIP: 500, BACKSTAGE: 80 },
  },
  {
    name: "Pixel Closing",
    venue: "La Barra",
    city: "Punta del Este",
    daysFromNow: 12,
    isOutdoor: false,
    capacities: { GENERAL: 1500, VIP: 200, BACKSTAGE: 40 },
  },
  {
    name: "Arde x Pimienta B2B",
    venue: "José Ignacio",
    city: "José Ignacio",
    daysFromNow: 15,
    isOutdoor: true,
    capacities: { GENERAL: 2000, VIP: 250, BACKSTAGE: 50 },
  },
];

async function main() {
  console.log("Seeding Heaven Pass demo data...");

  for (const party of PARTIES) {
    const startsAt = new Date(Date.now() + party.daysFromNow * 24 * 60 * 60 * 1000);
    startsAt.setHours(23, 30, 0, 0);
    const doorsOpen = new Date(startsAt.getTime() - 60 * 60 * 1000);

    await prisma.event.upsert({
      where: { slug: slugify(`${party.name}-${party.venue}`) },
      update: {},
      create: {
        slug: slugify(`${party.name}-${party.venue}`),
        name: party.name,
        description: `${party.name} en ${party.venue}, temporada Punta del Este 2025-2026.`,
        venue: party.venue,
        city: party.city,
        country: "Uruguay",
        startsAt,
        doorsOpen,
        isOutdoor: party.isOutdoor,
        slots: {
          create: (Object.keys(party.capacities) as AccessTier[]).map((tier) => ({
            tier,
            capacity: party.capacities[tier],
          })),
        },
      },
    });
  }

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@heavenpass.com" },
    update: {},
    create: {
      email: "demo@heavenpass.com",
      name: "Demo Member",
      role: UserRole.MEMBER,
      passwordHash: "dev-mode-no-password",
    },
  });

  const vipDefinition = MEMBERSHIP_PLANS[MembershipPlan.VIP];
  await prisma.membership.upsert({
    where: { id: "seed-demo-membership" },
    update: {},
    create: {
      id: "seed-demo-membership",
      userId: demoUser.id,
      plan: MembershipPlan.VIP,
      status: MembershipStatus.ACTIVE,
      accessTier: vipDefinition.accessTier,
      accessesTotal: vipDefinition.accessesIncluded,
      priceCents: vipDefinition.basePriceCents,
      currency: vipDefinition.currency,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Seeded ${PARTIES.length} events and demo user ${demoUser.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
