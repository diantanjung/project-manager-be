import { z } from "../lib/zod.js";

const taskStatusValues = ["backlog", "todo", "in_progress", "review", "done"] as const;
const taskPriorityValues = ["low", "medium", "high", "urgent"] as const;

export const createTaskSchema = z.object({
    body: z.object({
        title: z
            .string({ message: "Task title is required" })
            .min(2, { message: "Task title must be at least 2 characters" }),
        description: z.string().optional(),
        status: z.enum(taskStatusValues).optional().default("backlog"),
        priority: z.enum(taskPriorityValues).optional().default("medium"),
        projectId: z.number({ message: "Project ID is required" }),
        assigneeId: z.number({ message: "Assignee ID is required" }),
        dueDate: z.string().optional(),
        position: z.number().optional(),
    }),
});

export const updateTaskSchema = z.object({
    params: z.object({
        id: z.string({ message: "Task ID is required" }),
    }),
    body: z.object({
        title: z
            .string()
            .min(2, { message: "Task title must be at least 2 characters" })
            .optional(),
        description: z.string().optional(),
        status: z.enum(taskStatusValues).optional(),
        priority: z.enum(taskPriorityValues).optional(),
        projectId: z.number().optional(),
        assigneeId: z.number().optional(),
        dueDate: z.string().optional(),
        position: z.number().optional(),
    }),
});

export const updateTaskStatusSchema = z.object({
    params: z.object({
        id: z.string({ message: "Task ID is required" }),
    }),
    body: z.object({
        status: z.enum(taskStatusValues, { message: "Invalid status value" }),
    }),
});

export const taskIdSchema = z.object({
    params: z.object({
        id: z.string({ message: "Task ID is required" }),
    }),
});

export const getTasksQuerySchema = z.object({
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
        projectId: z
            .string()
            .transform(Number)
            .pipe(z.number().int().positive())
            .optional(),
        status: z.enum(taskStatusValues).optional(),
        priority: z.enum(taskPriorityValues).optional(),
        assigneeId: z
            .string()
            .transform(Number)
            .pipe(z.number().int().positive())
            .optional(),
        sortBy: z.enum(["title", "createdAt", "updatedAt", "dueDate", "priority"]).optional(),
        order: z.enum(["asc", "desc"]).optional(),
    }),
});
