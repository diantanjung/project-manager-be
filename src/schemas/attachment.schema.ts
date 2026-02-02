import { z } from "../lib/zod.js";

export const createAttachmentSchema = z.object({
    params: z.object({
        taskId: z.string({ message: "Task ID is required" }),
    }),
    body: z.object({
        fileName: z.string({ message: "File name is required" }),
        fileUrl: z.string({ message: "File URL is required" }).url(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
    }),
});

export const attachmentIdSchema = z.object({
    params: z.object({
        id: z.string({ message: "Attachment ID is required" }),
    }),
});

export const taskIdParamSchema = z.object({
    params: z.object({
        taskId: z.string({ message: "Task ID is required" }),
    }),
});
