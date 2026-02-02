import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../../lib/zod.js";

export function registerCommentEndpoints(registry: OpenAPIRegistry) {
    // POST /api/tasks/:taskId/comments
    registry.registerPath({
        method: "post",
        path: "/api/tasks/{taskId}/comments",
        summary: "Add comment to task",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ taskId: z.string() }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            content: z.string(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: { description: "Comment created" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/tasks/:taskId/comments
    registry.registerPath({
        method: "get",
        path: "/api/tasks/{taskId}/comments",
        summary: "List comments for task",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ taskId: z.string() }) },
        responses: {
            200: { description: "List of comments" },
            401: { description: "Unauthorized" },
        },
    });

    // PATCH /api/comments/:id
    registry.registerPath({
        method: "patch",
        path: "/api/comments/{id}",
        summary: "Update comment",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            content: z.string(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: { description: "Comment updated" },
            403: { description: "Not authorized" },
            404: { description: "Comment not found" },
            401: { description: "Unauthorized" },
        },
    });

    // DELETE /api/comments/:id
    registry.registerPath({
        method: "delete",
        path: "/api/comments/{id}",
        summary: "Delete comment",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Comment deleted" },
            403: { description: "Not authorized" },
            404: { description: "Comment not found" },
            401: { description: "Unauthorized" },
        },
    });
}
