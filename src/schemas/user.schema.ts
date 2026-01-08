import { z } from "../lib/zod.js";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().or(z.number().transform(Number)),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.string().or(z.number().transform(Number)),
  }),
});
