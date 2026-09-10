import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../../lib/zod.js";

const userResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
    role: z.enum(["admin", "productOwner", "projectManager", "teamMember"]),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
});

export function registerUserEndpoints(registry: OpenAPIRegistry) {
    // GET /api/users
    registry.registerPath({
        method: "get",
        path: "/api/users",
        summary: "Get all users (paginated)",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
                search: z.string().optional(),
                sortBy: z.enum(["name", "email", "createdAt", "updatedAt"]).optional(),
                order: z.enum(["asc", "desc"]).optional(),
            }),
        },
        responses: {
            200: {
                description: "Paginated list of users",
                content: {
                    "application/json": {
                        schema: z.object({
                            data: z.array(userResponseSchema),
                            pagination: z.object({
                                page: z.number(),
                                limit: z.number(),
                                totalItems: z.number(),
                                totalPages: z.number(),
                            }),
                        }),
                    },
                },
            },
            401: { description: "Unauthorized" },
        },
    });

    // POST /api/users
    registry.registerPath({
        method: "post",
        path: "/api/users",
        summary: "Create a new user",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            name: z.string(),
                            email: z.string(),
                            password: z.string(),
                            role: z.enum(["admin", "productOwner", "projectManager", "teamMember"]).optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: {
                description: "User created",
                content: {
                    "application/json": {
                        schema: userResponseSchema,
                    },
                },
            },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/users/:id
    registry.registerPath({
        method: "get",
        path: "/api/users/{id}",
        summary: "Get user by ID",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
        },
        responses: {
            200: {
                description: "User found",
                content: {
                    "application/json": {
                        schema: userResponseSchema,
                    },
                },
            },
            404: { description: "User not found" },
            401: { description: "Unauthorized" },
        },
    });

    // PATCH /api/users/:id
    registry.registerPath({
        method: "patch",
        path: "/api/users/{id}",
        summary: "Update user",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            name: z.string().optional(),
                            email: z.string().optional(),
                            password: z.string().optional(),
                            role: z.enum(["admin", "productOwner", "projectManager", "teamMember"]).optional(),
                            avatarUrl: z.string().nullable().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: {
                description: "User updated",
                content: {
                    "application/json": {
                        schema: userResponseSchema,
                    },
                },
            },
            404: { description: "User not found" },
            401: { description: "Unauthorized" },
        },
    });

    // POST /api/users/:id/avatar
    registry.registerPath({
        method: "post",
        path: "/api/users/{id}/avatar",
        summary: "Upload user avatar",
        description: "Stores the uploaded avatar as the user's avatarStorageKey and returns the runtime avatarUrl",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            body: {
                content: {
                    "multipart/form-data": {
                        schema: z.object({
                            avatar: z.any(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Avatar uploaded",
                content: {
                    "application/json": {
                        schema: z.object({
                            data: z.object({
                                avatarStorageKey: z.string(),
                                avatarUrl: z.string(),
                            }),
                        }),
                    },
                },
            },
            400: { description: "No file uploaded or invalid file" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "User not found" },
        },
    });

    // DELETE /api/users/:id
    registry.registerPath({
        method: "delete",
        path: "/api/users/{id}",
        summary: "Delete user",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
        },
        responses: {
            200: {
                description: "User deleted",
                content: {
                    "application/json": {
                        schema: z.object({ message: z.string() }),
                    },
                },
            },
            404: { description: "User not found" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/users/:id/tasks
    registry.registerPath({
        method: "get",
        path: "/api/users/{id}/tasks",
        summary: "Get user's tasks",
        description: "Returns paginated tasks where the user is either the creator or assignee",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
            }),
        },
        responses: {
            200: {
                description: "Paginated list of user's tasks",
                content: {
                    "application/json": {
                        schema: z.object({
                            data: z.array(
                                z.object({
                                    id: z.number(),
                                    title: z.string(),
                                    description: z.string().nullable(),
                                    status: z.enum(["backlog", "todo", "in_progress", "review", "done"]),
                                    priority: z.enum(["low", "medium", "high", "urgent"]).nullable(),
                                    projectId: z.number(),
                                    projectName: z.string().nullable(),
                                    creatorId: z.number(),
                                    assigneeId: z.number(),
                                    dueDate: z.string().nullable(),
                                    position: z.number().nullable(),
                                    createdAt: z.string(),
                                    updatedAt: z.string(),
                                })
                            ),
                            pagination: z.object({
                                page: z.number(),
                                limit: z.number(),
                                totalItems: z.number(),
                                totalPages: z.number(),
                            }),
                        }),
                    },
                },
            },
            404: { description: "User not found" },
            401: { description: "Unauthorized" },
        },
    });
}
