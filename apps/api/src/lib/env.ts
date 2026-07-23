import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(16),
  QR_SIGNING_SECRET: z.string().min(16),
  PAYMENTS_WEBHOOK_SECRET: z.string().min(1),
  EXPIRATION_JOB_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),
});

export const env = envSchema.parse(process.env);
