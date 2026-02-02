import { z } from "../lib/zod.js";

export const createCommentSchema = z.object({
    params: z.object({
        taskId: z.string({ message: "Task ID is required" }),
    }),
    body: z.object({
        content: z
            .string({ message: "Comment content is required" })
            .min(1, { message: "Comment cannot be empty" }),
    }),
});

export const updateCommentSchema = z.object({
    params: z.object({
        id: z.string({ message: "Comment ID is required" }),
    }),
    body: z.object({
        content: z
            .string({ message: "Comment content is required" })
            .min(1, { message: "Comment cannot be empty" }),
    }),
});

export const commentIdSchema = z.object({
    params: z.object({
        id: z.string({ message: "Comment ID is required" }),
    }),
});

export const taskIdParamSchema = z.object({
    params: z.object({
        taskId: z.string({ message: "Task ID is required" }),
    }),
});
