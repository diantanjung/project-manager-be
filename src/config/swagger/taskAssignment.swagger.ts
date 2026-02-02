import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../../lib/zod.js";

export function registerTaskAssignmentEndpoints(registry: OpenAPIRegistry) {
    // POST /api/task-assignments
    registry.registerPath({
        method: "post",
        path: "/api/task-assignments",
        summary: "Assign user to task",
        tags: ["Task Assignments"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            taskId: z.number(),
                            userId: z.number(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: { description: "User assigned to task" },
            400: { description: "User already assigned to task" },
            404: { description: "Task or user not found" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/task-assignments/tasks/:taskId/assignments
    registry.registerPath({
        method: "get",
        path: "/api/task-assignments/tasks/{taskId}/assignments",
        summary: "Get task assignments",
        tags: ["Task Assignments"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ taskId: z.string() }) },
        responses: {
            200: { description: "List of task assignments" },
            404: { description: "Task not found" },
            401: { description: "Unauthorized" },
        },
    });

    // DELETE /api/task-assignments/:id
    registry.registerPath({
        method: "delete",
        path: "/api/task-assignments/{id}",
        summary: "Remove task assignment",
        tags: ["Task Assignments"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Assignment removed" },
            404: { description: "Assignment not found" },
            401: { description: "Unauthorized" },
        },
    });
}
