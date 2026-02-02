import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../../lib/zod.js";

export function registerAttachmentEndpoints(registry: OpenAPIRegistry) {
    // POST /api/tasks/:taskId/attachments
    registry.registerPath({
        method: "post",
        path: "/api/tasks/{taskId}/attachments",
        summary: "Upload attachment to task",
        tags: ["Attachments"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ taskId: z.string() }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            fileName: z.string(),
                            fileUrl: z.string(),
                            fileSize: z.number().optional(),
                            mimeType: z.string().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: { description: "Attachment created" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/tasks/:taskId/attachments
    registry.registerPath({
        method: "get",
        path: "/api/tasks/{taskId}/attachments",
        summary: "List attachments for task",
        tags: ["Attachments"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ taskId: z.string() }) },
        responses: {
            200: { description: "List of attachments" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/attachments/:id
    registry.registerPath({
        method: "get",
        path: "/api/attachments/{id}",
        summary: "Get attachment by ID",
        tags: ["Attachments"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Attachment found" },
            404: { description: "Attachment not found" },
            401: { description: "Unauthorized" },
        },
    });

    // DELETE /api/attachments/:id
    registry.registerPath({
        method: "delete",
        path: "/api/attachments/{id}",
        summary: "Delete attachment",
        tags: ["Attachments"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Attachment deleted" },
            403: { description: "Not authorized" },
            404: { description: "Attachment not found" },
            401: { description: "Unauthorized" },
        },
    });
}
