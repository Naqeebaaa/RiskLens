import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  SIMULATE_PROCESSING_FAILURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  PORT: z.coerce.number().int().positive().default(8000),

  RABBITMQ_USER: z.string().min(1),
  RABBITMQ_PASSWORD: z.string().min(1),

  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),

  REDIS_URL: z.string().url().default("redis://localhost:6379"),
});

export const env = envSchema.parse(process.env);