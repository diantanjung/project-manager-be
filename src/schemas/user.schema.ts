import { z } from "../lib/zod.js";

export const createUserSchema = z.object({
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

export const updateUserSchema = z.object({
  params: z.object({
    id: z
      .string({ message: "User ID is required" })
      .or(z.number().transform(Number)),
  }),
  body: z.object({
    name: z
      .string({ message: "Name must be a string" })
      .min(2, { message: "Name must be at least 2 characters" })
      .optional(),
    email: z
      .string({ message: "Email must be a string" })
      .email({ message: "Please enter a valid email address" })
      .optional(),
    password: z
      .string({ message: "Password must be a string" })
      .min(6, { message: "Password must be at least 6 characters" })
      .optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: z
      .string({ message: "User ID is required" })
      .or(z.number().transform(Number)),
  }),
});
