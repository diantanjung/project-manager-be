import { z } from "../lib/zod.js";

export const createProjectSchema = z.object({
    body: z.object({
        name: z
            .string({ message: "Project name is required" })
            .min(2, { message: "Project name must be at least 2 characters" }),
        description: z.string().optional(),
        teamId: z.coerce.number({ message: "Team ID is required" }).int().positive(),
    }),
});

export const updateProjectSchema = z.object({
    params: z.object({
        id: z.coerce.number({ message: "Project ID is required" }).int().positive(),
    }),
    body: z.object({
        name: z
            .string()
            .min(2, { message: "Project name must be at least 2 characters" })
            .optional(),
        description: z.string().optional(),
        teamId: z.coerce.number().int().positive().optional(),
    }),
});

export const projectIdSchema = z.object({
    params: z.object({
        id: z.coerce.number({ message: "Project ID is required" }).int().positive(),
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
        id: z.coerce.number({ message: "Project ID is required" }).int().positive(),
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
