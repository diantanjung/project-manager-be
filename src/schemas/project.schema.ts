import { z } from "../lib/zod.js";

export const createProjectSchema = z.object({
    body: z.object({
        name: z
            .string({ message: "Project name is required" })
            .min(2, { message: "Project name must be at least 2 characters" }),
        description: z.string().optional(),
        teamId: z.number({ message: "Team ID is required" }),
    }),
});

export const updateProjectSchema = z.object({
    params: z.object({
        id: z.string({ message: "Project ID is required" }),
    }),
    body: z.object({
        name: z
            .string()
            .min(2, { message: "Project name must be at least 2 characters" })
            .optional(),
        description: z.string().optional(),
        teamId: z.number().optional(),
    }),
});

export const projectIdSchema = z.object({
    params: z.object({
        id: z.string({ message: "Project ID is required" }),
    }),
});

export const getProjectsQuerySchema = z.object({
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
        search: z.string().optional(),
        teamId: z
            .string()
            .transform(Number)
            .pipe(z.number().int().positive())
            .optional(),
        sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional(),
        order: z.enum(["asc", "desc"]).optional(),
    }),
});

export const getProjectTasksSchema = z.object({
    params: z.object({
        id: z.string({ message: "Project ID is required" }),
    }),
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
