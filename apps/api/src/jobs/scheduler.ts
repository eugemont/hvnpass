import { env } from "../lib/env";
import { expirePendingReservations } from "./expire-reservations.job";

/** Starts the in-process expiration sweep for local dev / single-instance deploys. Returns a stop function. */
export function startExpirationScheduler(): () => void {
  const timer = setInterval(() => {
    expirePendingReservations().catch((err) => {
      console.error("[expire-reservations] sweep failed", err);
    });
  }, env.EXPIRATION_JOB_INTERVAL_MS);

  timer.unref?.();
  return () => clearInterval(timer);
}
