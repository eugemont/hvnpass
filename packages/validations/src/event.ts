import { z } from "zod";
import { paginationSchema } from "./common";

export const listEventsQuerySchema = paginationSchema.extend({
  city: z.string().trim().min(1).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
export type ListEventsQuerySchema = z.infer<typeof listEventsQuerySchema>;
