import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { UserRole } from "@heaven-pass/types";
import { env } from "../lib/env";
import { prisma } from "../lib/prisma";

/**
 * DEV-ONLY: mints a JWT for an (upserted) user by email, with no password check.
 * Stands in for a real login/signup flow so /memberships and /reservations are
 * reachable in local dev and tests. Mounted only when NODE_ENV !== "production" (see src/index.ts).
 */
const devTokenSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).default("Dev Member"),
  role: z.nativeEnum(UserRole).default(UserRole.MEMBER),
});

export const authDevRoute = new Hono().post("/dev-token", zValidator("json", devTokenSchema), async (c) => {
  const { email, name, role } = c.req.valid("json");

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, role, passwordHash: "dev-mode-no-password" },
  });

  const token = await sign(
    { sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 },
    env.JWT_SECRET,
  );

  return c.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});
