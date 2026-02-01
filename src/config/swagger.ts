import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerUserEndpoints } from "./swagger/user.swagger.js";
import { registerAuthEndpoints } from "./swagger/auth.swagger.js";

const registry = new OpenAPIRegistry();

// Security
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// Register endpoints from separate files
registerUserEndpoints(registry);
registerAuthEndpoints(registry);

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
