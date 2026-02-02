import { z } from "../lib/zod.js";

export const createTeamSchema = z.object({
    body: z.object({
        name: z
            .string({ message: "Team name is required" })
            .min(2, { message: "Team name must be at least 2 characters" }),
        description: z.string().optional(),
    }),
});

export const updateTeamSchema = z.object({
    params: z.object({
        id: z.string({ message: "Team ID is required" }),
    }),
    body: z.object({
        name: z
            .string()
            .min(2, { message: "Team name must be at least 2 characters" })
            .optional(),
        description: z.string().optional(),
    }),
});

export const teamIdSchema = z.object({
    params: z.object({
        id: z.string({ message: "Team ID is required" }),
    }),
});

export const getTeamsQuerySchema = z.object({
    query: z.object({
        page: z
            .string()
            .transform(Number)
            .pipe(z.number().int().positive())
            .optional(),
        limit: z
            .string()
            .transform(Number)
            .pipe(z.number().int().min(1).max(100))
            .optional(),
    }),
});

export const addTeamMemberSchema = z.object({
    params: z.object({
        id: z.string({ message: "Team ID is required" }),
    }),
    body: z.object({
        userId: z.number({ message: "User ID is required" }),
        role: z.enum(["owner", "admin", "member"]).optional().default("member"),
    }),
});

export const removeTeamMemberSchema = z.object({
    params: z.object({
        id: z.string({ message: "Team ID is required" }),
        userId: z.string({ message: "User ID is required" }),
    }),
});
