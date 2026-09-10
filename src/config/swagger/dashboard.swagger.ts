import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export function registerDashboardEndpoints(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/v1/dashboard",
    summary: "Get dashboard summary",
    tags: ["Dashboard"],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Dashboard summary",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                totalActiveProjects: { type: "number" },
                taskCountPerStatus: {
                  type: "object",
                  properties: {
                    backlog: { type: "number" },
                    todo: { type: "number" },
                    in_progress: { type: "number" },
                    review: { type: "number" },
                    done: { type: "number" },
                  },
                },
                activeProgress: {
                  type: "object",
                  properties: {
                    doing: { type: "number" },
                    todo: { type: "number" },
                    total: { type: "number" },
                    ratio: { type: "number" },
                    percentage: { type: "number" },
                  },
                },
                inReview: { type: "number" },
                dueSoon: { type: "number" },
                overdue: { type: "number" },
                overdueTaskCount: { type: "number" },
                workloadPerMember: {
                  type: "object",
                  additionalProperties: { type: "number" },
                },
                recentlyUpdatedTasks: { type: "array", items: { type: "object" } },
                recentTasks: { type: "array", items: { type: "object" } },
                upcomingDeadlines: { type: "array", items: { type: "object" } },
                highPriorityTasks: { type: "array", items: { type: "object" } },
                latestUpdates: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
}
