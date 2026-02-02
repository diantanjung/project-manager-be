import { z } from "../lib/zod.js";

export const assignUserToTaskSchema = z.object({
    body: z.object({
        taskId: z.number({ message: "Task ID is required" }),
        userId: z.number({ message: "User ID is required" }),
    }),
});

export const taskAssignmentIdSchema = z.object({
    params: z.object({
        id: z.string({ message: "Assignment ID is required" }),
    }),
});

export const taskIdParamSchema = z.object({
    params: z.object({
        taskId: z.string({ message: "Task ID is required" }),
    }),
});
