import { Response, NextFunction } from "express";
import { projectService } from "../services/project.service.js";
import { projectTeamService } from "../services/projectTeam.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const projectController = {
    async createProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const project = await projectService.createProject({
                ...req.body,
                ownerId: req.user?.id,
            });
            return res.status(201).json(project);
        } catch (error) {
            next(error);
        }
    },

    async getAllProjects(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { page, limit, search, teamId, sortBy, order } = req.query;
            const result = await projectService.getAllProjects({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                search: search as string | undefined,
                teamId: teamId ? Number(teamId) : undefined,
                sortBy: sortBy as "name" | "createdAt" | "updatedAt" | undefined,
                order: order as "asc" | "desc" | undefined,
            });
            return res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getProjectById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const project = await projectService.getProjectById(Number(req.params.id));
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }
            return res.json(project);
        } catch (error) {
            next(error);
        }
    },

    async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const project = await projectService.updateProject(
                Number(req.params.id),
                req.body
            );
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }
            return res.json(project);
        } catch (error) {
            next(error);
        }
    },

    async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const project = await projectService.deleteProject(Number(req.params.id));
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }
            return res.json({ message: "Project deleted successfully" });
        } catch (error) {
            next(error);
        }
    },

    async getProjectTasks(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const project = await projectService.getProjectById(Number(req.params.id));
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            const { page, limit } = req.query;
            const result = await projectService.getProjectTasks(Number(req.params.id), {
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });
            return res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getProjectTeams(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const project = await projectService.getProjectById(Number(req.params.id));
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            const teams = await projectTeamService.getProjectTeams(Number(req.params.id));
            return res.json(teams);
        } catch (error) {
            next(error);
        }
    },
};
