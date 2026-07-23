import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { UserRole } from "@heaven-pass/types";
import { addExtraSchema, cancelReservationSchema, createReservationSchema } from "@heaven-pass/validations";
import type { AuthVariables } from "../middleware/auth";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  cancelReservation,
  checkInReservation,
  confirmReservation,
  createReservation,
  getReservationForUser,
  listReservationsForUser,
} from "../services/reservation.service";
import { addExtraToReservation } from "../services/extra.service";

export const reservationsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("*", requireAuth)
  .get("/", async (c) => {
    const reservations = await listReservationsForUser(c.get("userId"));
    return c.json(reservations);
  })
  .post("/", zValidator("json", createReservationSchema), async (c) => {
    const input = c.req.valid("json");
    const reservation = await createReservation({ userId: c.get("userId"), ...input });
    return c.json(reservation, 201);
  })
  .get("/:id", async (c) => {
    const reservation = await getReservationForUser(c.req.param("id"), c.get("userId"));
    return c.json(reservation);
  })
  .post("/:id/confirm", async (c) => {
    const reservation = await confirmReservation(c.req.param("id"), c.get("userId"));
    return c.json(reservation);
  })
  .post("/:id/cancel", zValidator("json", cancelReservationSchema.optional().default({})), async (c) => {
    const { reason } = c.req.valid("json");
    const reservation = await cancelReservation(c.req.param("id"), c.get("userId"), reason);
    return c.json(reservation);
  })
  .post("/:id/extras", zValidator("json", addExtraSchema), async (c) => {
    const input = c.req.valid("json");
    const reservation = await addExtraToReservation({
      reservationId: c.req.param("id"),
      userId: c.get("userId"),
      ...input,
    });
    return c.json(reservation, 201);
  })
  .post("/:id/checkin", requireRole(UserRole.STAFF, UserRole.ADMIN), async (c) => {
    const reservation = await checkInReservation(c.req.param("id"));
    return c.json(reservation);
  });
