import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../../lib/zod.js";

export function registerProjectTeamEndpoints(registry: OpenAPIRegistry) {
    // POST /api/project-teams
    registry.registerPath({
        method: "post",
        path: "/api/project-teams",
        summary: "Assign team to project",
        tags: ["Project Teams"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            projectId: z.number(),
                            teamId: z.number(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: { description: "Team assigned to project" },
            400: { description: "Team already assigned to project" },
            404: { description: "Project or team not found" },
            401: { description: "Unauthorized" },
        },
    });

    // DELETE /api/project-teams/:id
    registry.registerPath({
        method: "delete",
        path: "/api/project-teams/{id}",
        summary: "Remove team from project",
        tags: ["Project Teams"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: { description: "Team removed from project" },
            404: { description: "Assignment not found" },
            401: { description: "Unauthorized" },
        },
    });

    // GET /api/project-teams/projects/:projectId/teams
    registry.registerPath({
        method: "get",
        path: "/api/project-teams/projects/{projectId}/teams",
        summary: "Get teams assigned to project",
        tags: ["Project Teams"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ projectId: z.string() }) },
        responses: {
            200: { description: "List of teams assigned to project" },
            404: { description: "Project not found" },
            401: { description: "Unauthorized" },
        },
    });
}
