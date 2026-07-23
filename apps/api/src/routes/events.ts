import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { listEventsQuerySchema } from "@heaven-pass/validations";
import { getEvent, listEvents } from "../services/event.service";

export const eventsRoute = new Hono()
  .get("/", zValidator("query", listEventsQuerySchema), async (c) => {
    const query = c.req.valid("query");
    const result = await listEvents(query);
    return c.json(result);
  })
  .get("/:idOrSlug", async (c) => {
    const event = await getEvent(c.req.param("idOrSlug"));
    return c.json(event);
  });
