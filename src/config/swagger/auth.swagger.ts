import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../../lib/zod.js";

export function registerAuthEndpoints(registry: OpenAPIRegistry) {
    // POST /api/auth/register
    registry.registerPath({
        method: "post",
        path: "/api/auth/register",
        summary: "Register new user",
        tags: ["Auth"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            name: z.string(),
                            email: z.string(),
                            password: z.string(),
                        }),
                    },
                },
            },
        },
        responses: {
            201: {
                description: "User registered",
                content: {
                    "application/json": {
                        schema: z.object({
                            id: z.number(),
                            name: z.string(),
                            email: z.string(),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                        }),
                    },
                },
            },
            400: { description: "User already exists" },
        },
    });

    // POST /api/auth/login
    registry.registerPath({
        method: "post",
        path: "/api/auth/login",
        summary: "User login",
        tags: ["Auth"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            email: z.string(),
                            password: z.string(),
                        }),
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
                            accessToken: z.string(),
                            user: z.object({
                                id: z.number(),
                                name: z.string(),
                                email: z.string(),
                                createdAt: z.string(),
                                updatedAt: z.string(),
                            }),
                        }),
                    },
                },
            },
            401: { description: "Invalid credentials" },
        },
    });

    // POST /api/auth/refresh
    registry.registerPath({
        method: "post",
        path: "/api/auth/refresh",
        summary: "Refresh access token",
        tags: ["Auth"],
        responses: {
            200: {
                description: "Token refreshed",
                content: {
                    "application/json": {
                        schema: z.object({ accessToken: z.string() }),
                    },
                },
            },
            401: { description: "Invalid refresh token" },
        },
    });

    // POST /api/auth/logout
    registry.registerPath({
        method: "post",
        path: "/api/auth/logout",
        summary: "User logout",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: {
            204: { description: "Logout successful" },
            401: { description: "Unauthorized" },
        },
    });
}
