import { z } from "zod";
import dotenv from "dotenv";

// Load variables from .env
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1).default("supersecret"),
  JWT_EXPIRES_IN: z.string().default("1d"),
});

export const env = envSchema.parse(process.env);
