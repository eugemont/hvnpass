import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { UserRole } from "@heaven-pass/types";
import { env } from "../lib/env";
import { HttpError } from "../lib/http-error";

export interface AuthVariables {
  userId: string;
  userRole: UserRole;
}

const verifyJwt = jwt({ secret: env.JWT_SECRET });

/** Verifies the Bearer JWT and exposes `userId` / `userRole` on the context. */
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  await verifyJwt(c, async () => {});

  const payload = c.get("jwtPayload") as { sub?: string; role?: UserRole } | undefined;
  if (!payload?.sub) {
    throw new HttpError(401, "UNAUTHORIZED", "Invalid or missing token");
  }

  c.set("userId", payload.sub);
  c.set("userRole", payload.role ?? UserRole.MEMBER);
  await next();
});

export function requireRole(...roles: UserRole[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const role = c.get("userRole");
    if (!roles.includes(role)) {
      throw new HttpError(403, "FORBIDDEN", "You do not have access to this resource");
    }
    await next();
  });
}
