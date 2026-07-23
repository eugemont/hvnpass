/**
 * Standalone entry point for running the expiration sweep from an external
 * scheduler (cron, a serverless scheduled function, k8s CronJob) instead of
 * the in-process interval started by src/index.ts. Exits with a non-zero
 * code on failure so the scheduler can alert/retry.
 */
import { expirePendingReservations } from "./expire-reservations.job";
import { prisma } from "../lib/prisma";

expirePendingReservations()
  .then(({ expiredCount }) => {
    console.log(`[expire-reservations] released ${expiredCount} expired hold(s)`);
  })
  .catch((err) => {
    console.error("[expire-reservations] sweep failed", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
