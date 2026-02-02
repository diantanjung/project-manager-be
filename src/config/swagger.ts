import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerUserEndpoints } from "./swagger/user.swagger.js";
import { registerAuthEndpoints } from "./swagger/auth.swagger.js";
import { registerTeamEndpoints } from "./swagger/team.swagger.js";
import { registerProjectEndpoints } from "./swagger/project.swagger.js";
import { registerProjectTeamEndpoints } from "./swagger/projectTeam.swagger.js";
import { registerTaskEndpoints } from "./swagger/task.swagger.js";
import { registerTaskAssignmentEndpoints } from "./swagger/taskAssignment.swagger.js";
import { registerCommentEndpoints } from "./swagger/comment.swagger.js";
import { registerAttachmentEndpoints } from "./swagger/attachment.swagger.js";

const registry = new OpenAPIRegistry();

// Security
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// Register endpoints from separate files
registerAuthEndpoints(registry);
registerUserEndpoints(registry);
registerTeamEndpoints(registry);
registerProjectEndpoints(registry);
registerProjectTeamEndpoints(registry);
registerTaskEndpoints(registry);
registerTaskAssignmentEndpoints(registry);
registerCommentEndpoints(registry);
registerAttachmentEndpoints(registry);

// Generate OpenAPI spec
const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Project Manager API",
    version: "1.0.0",
    description: "API documentation for Project Manager",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
    },
  ],
});
