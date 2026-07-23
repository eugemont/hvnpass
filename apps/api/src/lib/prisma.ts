import { PrismaClient } from "@prisma/client";

/**
 * Single PrismaClient instance per process, cached on `globalThis` in dev so
 * `tsx watch` reloads don't exhaust the Postgres connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error", "warn"] : ["error", "warn", "query"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
