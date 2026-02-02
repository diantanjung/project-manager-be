import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../../lib/zod.js";

export function registerProjectEndpoints(registry: OpenAPIRegistry) {
    // POST /api/projects
    registry.registerPath({
        method: "post",
        path: "/api/projects",
        summary: "Create a new project",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            name: z.string(),
                            description: z.string().optional(),
                            teamId: z.number(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: { description: "Project created" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/projects
    registry.registerPath({
        method: "get",
        path: "/api/projects",
        summary: "List all projects",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
                search: z.string().optional(),
                teamId: z.string().optional(),
                sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional(),
                order: z.enum(["asc", "desc"]).optional(),
            }),
        },
        responses: {
            200: { description: "Paginated list of projects" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/projects/:id
    registry.registerPath({
        method: "get",
        path: "/api/projects/{id}",
        summary: "Get project by ID",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Project found" },
            404: { description: "Project not found" },
            401: { description: "Unauthorized" },
        },
    });

    // PATCH /api/projects/:id
    registry.registerPath({
        method: "patch",
        path: "/api/projects/{id}",
        summary: "Update project",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            name: z.string().optional(),
                            description: z.string().optional(),
                            teamId: z.number().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: { description: "Project updated" },
            404: { description: "Project not found" },
            401: { description: "Unauthorized" },
        },
    });

    // DELETE /api/projects/:id
    registry.registerPath({
        method: "delete",
        path: "/api/projects/{id}",
        summary: "Delete project",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Project deleted" },
            404: { description: "Project not found" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/projects/:id/tasks
    registry.registerPath({
        method: "get",
        path: "/api/projects/{id}/tasks",
        summary: "Get project tasks",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
            }),
        },
        responses: {
            200: { description: "Paginated list of project tasks" },
            404: { description: "Project not found" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/projects/:id/teams
    registry.registerPath({
        method: "get",
        path: "/api/projects/{id}/teams",
        summary: "Get teams assigned to project",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "List of teams assigned to project" },
            404: { description: "Project not found" },
            401: { description: "Unauthorized" },
        },
    });
}
