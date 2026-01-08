import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "../lib/zod.js";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";

const registry = new OpenAPIRegistry();

// 1. Define Schemas
registry.register(
  "User",
  z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
);

registry.register("CreateUserRequest", createUserSchema.shape.body);
registry.register("UpdateUserRequest", updateUserSchema.shape.body);

// 2. Define Bearer Auth
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// User Endpoints
registry.registerPath({
  method: "get",
  path: "/api/users",
  description: "Get all users",
  summary: "Retrieve a list of users",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of users",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              email: z.string().email(),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
          ),
        },
      },
    },
    401: {
      description: "Unauthorized - Invalid or missing token",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/users",
  description: "Create a new user",
  summary: "Create a user",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUserSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string().email(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized - Invalid or missing token",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/users/{id}",
  description: "Get a user by ID",
  summary: "Retrieve a specific user",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "User found",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string().email(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        },
      },
    },
    404: {
      description: "User not found",
    },
    401: {
      description: "Unauthorized - Invalid or missing token",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/users/{id}",
  description: "Update a user",
  summary: "Update user information",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateUserSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string().email(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        },
      },
    },
    404: {
      description: "User not found",
    },
    401: {
      description: "Unauthorized - Invalid or missing token",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/users/{id}",
  description: "Delete a user",
  summary: "Remove a user from the system",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "User deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "User not found",
    },
    401: {
      description: "Unauthorized - Invalid or missing token",
    },
  },
});

// Auth schemas
registry.register("RegisterRequest", registerSchema.shape.body);
registry.register("LoginRequest", loginSchema.shape.body);
registry.register(
  "AuthResponse",
  z.object({
    token: z.string(),
    user: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
    }),
  })
);

// Auth Endpoints
registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  description: "Register a new user",
  summary: "User registration",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: z.object({
            token: z.string(),
            user: z.object({
              id: z.number(),
              name: z.string(),
              email: z.string().email(),
            }),
          }),
        },
      },
    },
    400: {
      description: "Validation error or user already exists",
    },
  },
});
registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  description: "Login with email and password",
  summary: "User login",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: z.object({
            token: z.string(),
            user: z.object({
              id: z.number(),
              name: z.string(),
              email: z.string().email(),
            }),
          }),
        },
      },
    },
    401: {
      description: "Invalid credentials",
    },
  },
});

// Generate Generator
const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Project Manager API",
    version: "1.0.0",
    description: "API Documentation for Project Manager Application",
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
});
