import { z } from "../lib/zod.js";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Name is required" })
      .min(2, { message: "Name must be at least 2 characters" }),
    email: z
      .string({ message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string({ message: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters" }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string({ message: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters" }),
  }),
});
