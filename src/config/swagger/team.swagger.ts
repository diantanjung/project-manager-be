import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../../lib/zod.js";

export function registerTeamEndpoints(registry: OpenAPIRegistry) {
    // POST /api/teams
    registry.registerPath({
        method: "post",
        path: "/api/teams",
        summary: "Create a new team",
        tags: ["Teams"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            name: z.string(),
                            description: z.string().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: { description: "Team created" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/teams
    registry.registerPath({
        method: "get",
        path: "/api/teams",
        summary: "List all teams",
        tags: ["Teams"],
        security: [{ bearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
            }),
        },
        responses: {
            200: { description: "List of teams" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/teams/:id
    registry.registerPath({
        method: "get",
        path: "/api/teams/{id}",
        summary: "Get team by ID",
        tags: ["Teams"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Team found" },
            404: { description: "Team not found" },
            401: { description: "Unauthorized" },
        },
    });

    // PATCH /api/teams/:id
    registry.registerPath({
        method: "patch",
        path: "/api/teams/{id}",
        summary: "Update team",
        tags: ["Teams"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            name: z.string().optional(),
                            description: z.string().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: { description: "Team updated" },
            404: { description: "Team not found" },
            401: { description: "Unauthorized" },
        },
    });

    // DELETE /api/teams/:id
    registry.registerPath({
        method: "delete",
        path: "/api/teams/{id}",
        summary: "Delete team",
        tags: ["Teams"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Team deleted" },
            404: { description: "Team not found" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/teams/:id/members
    registry.registerPath({
        method: "get",
        path: "/api/teams/{id}/members",
        summary: "Get team members",
        tags: ["Teams"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "List of team members" },
            404: { description: "Team not found" },
            401: { description: "Unauthorized" },
        },
    });

    // POST /api/teams/:id/members
    registry.registerPath({
        method: "post",
        path: "/api/teams/{id}/members",
        summary: "Add member to team",
        tags: ["Teams"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string() }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            userId: z.number(),
                            role: z.enum(["owner", "admin", "member"]).optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: { description: "Member added" },
            400: { description: "User already a member" },
            404: { description: "Team not found" },
            401: { description: "Unauthorized" },
        },
    });

    // DELETE /api/teams/:id/members/:userId
    registry.registerPath({
        method: "delete",
        path: "/api/teams/{id}/members/{userId}",
        summary: "Remove member from team",
        tags: ["Teams"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string(), userId: z.string() }),
        },
        responses: {
            200: { description: "Member removed" },
            404: { description: "Team member not found" },
            401: { description: "Unauthorized" },
        },
    });
}
