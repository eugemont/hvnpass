import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { purchaseMembershipSchema } from "@heaven-pass/validations";
import type { AuthVariables } from "../middleware/auth";
import { requireAuth } from "../middleware/auth";
import { listMembershipsForUser, purchaseMembership } from "../services/membership.service";

export const membershipsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("*", requireAuth)
  .get("/", async (c) => {
    const memberships = await listMembershipsForUser(c.get("userId"));
    return c.json(memberships);
  })
  .post("/", zValidator("json", purchaseMembershipSchema), async (c) => {
    const { plan } = c.req.valid("json");
    const membership = await purchaseMembership(c.get("userId"), plan);
    return c.json(membership, 201);
  });
