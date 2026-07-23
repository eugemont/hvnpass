import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./lib/env";
import { errorHandler } from "./middleware/error-handler";
import { eventsRoute } from "./routes/events";
import { membershipsRoute } from "./routes/memberships";
import { reservationsRoute } from "./routes/reservations";
import { webhooksRoute } from "./routes/webhooks";
import { startExpirationScheduler } from "./jobs/scheduler";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.onError(errorHandler);

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/events", eventsRoute);
app.route("/memberships", membershipsRoute);
app.route("/reservations", reservationsRoute);
app.route("/webhooks", webhooksRoute);

if (process.env.NODE_ENV !== "production") {
  const { authDevRoute } = await import("./routes/auth.dev");
  app.route("/auth", authDevRoute);
}

const stopExpirationScheduler = startExpirationScheduler();

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Heaven Pass API listening on http://localhost:${info.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    stopExpirationScheduler();
    process.exit(0);
  });
}

export default app;
