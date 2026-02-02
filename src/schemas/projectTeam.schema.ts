import { z } from "../lib/zod.js";

export const assignTeamToProjectSchema = z.object({
    body: z.object({
        projectId: z.number({ message: "Project ID is required" }),
        teamId: z.number({ message: "Team ID is required" }),
    }),
});

export const projectTeamIdSchema = z.object({
    params: z.object({
        id: z.string({ message: "Project-team assignment ID is required" }),
    }),
});

export const projectIdParamSchema = z.object({
    params: z.object({
        projectId: z.string({ message: "Project ID is required" }),
    }),
});
