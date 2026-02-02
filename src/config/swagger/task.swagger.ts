import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../../lib/zod.js";

export function registerTaskEndpoints(registry: OpenAPIRegistry) {
    const taskStatusEnum = z.enum(["backlog", "todo", "in_progress", "review", "done"]);
    const taskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

    // POST /api/tasks
    registry.registerPath({
        method: "post",
        path: "/api/tasks",
        summary: "Create a new task",
        tags: ["Tasks"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            title: z.string(),
                            description: z.string().optional(),
                            status: taskStatusEnum.optional(),
                            priority: taskPriorityEnum.optional(),
                            projectId: z.number(),
                            assigneeId: z.number(),
                            dueDate: z.string().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: { description: "Task created" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/tasks
    registry.registerPath({
        method: "get",
        path: "/api/tasks",
        summary: "List all tasks",
        tags: ["Tasks"],
        security: [{ bearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
                search: z.string().optional(),
                projectId: z.string().optional(),
                status: taskStatusEnum.optional(),
                priority: taskPriorityEnum.optional(),
                assigneeId: z.string().optional(),
                sortBy: z.enum(["title", "createdAt", "updatedAt", "dueDate", "priority"]).optional(),
                order: z.enum(["asc", "desc"]).optional(),
            }),
        },
        responses: {
            200: { description: "Paginated list of tasks" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/tasks/:id
    registry.registerPath({
        method: "get",
        path: "/api/tasks/{id}",
        summary: "Get task by ID",
        description: "Returns task with comments and attachments",
        tags: ["Tasks"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Task with comments and attachments" },
            404: { description: "Task not found" },
            401: { description: "Unauthorized" },
        },
    });

    // PATCH /api/tasks/:id
    registry.registerPath({
        method: "patch",
        path: "/api/tasks/{id}",
        summary: "Update task",
        tags: ["Tasks"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            title: z.string().optional(),
                            description: z.string().optional(),
                            status: taskStatusEnum.optional(),
                            priority: taskPriorityEnum.optional(),
                            assigneeId: z.number().optional(),
                            dueDate: z.string().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: { description: "Task updated" },
            404: { description: "Task not found" },
            401: { description: "Unauthorized" },
        },
    });

    // PATCH /api/tasks/:id/status
    registry.registerPath({
        method: "patch",
        path: "/api/tasks/{id}/status",
        summary: "Update task status only",
        tags: ["Tasks"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            status: taskStatusEnum,
                        }),
                    },
                },
            },
        },
        responses: {
            200: { description: "Task status updated" },
            404: { description: "Task not found" },
            401: { description: "Unauthorized" },
        },
    });

    // DELETE /api/tasks/:id
    registry.registerPath({
        method: "delete",
        path: "/api/tasks/{id}",
        summary: "Delete task",
        tags: ["Tasks"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Task deleted" },
            404: { description: "Task not found" },
            401: { description: "Unauthorized" },
        },
    });
}
