import { Response, NextFunction } from "express";
import { projectService } from "../services/project.service.js";
import { projectTeamService } from "../services/projectTeam.service.js";
import { AuthRequest } from "../middlewares/auth.js";
import { authorizationService } from "../services/authorization.service.js";

export const projectController = {
    async createProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const canCreate = await authorizationService.canCreateProjectForTeam(
                req.user,
                req.body.teamId
            );
            if (!canCreate) {
                return res.status(403).json({ message: "Access denied for this team" });
            }
            const project = await projectService.createProject({
                ...req.body,
                ownerId: req.user.id,
            });
            return res.status(201).json(project);
        } catch (error) {
            return next(error);
        }
    },

    async getAllProjects(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { page, limit, search, teamId, sortBy, order } = req.query;
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const result = await projectService.getAllProjects({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                search: search as string | undefined,
                teamId: teamId ? Number(teamId) : undefined,
                sortBy: sortBy as "name" | "createdAt" | "updatedAt" | undefined,
                order: order as "asc" | "desc" | undefined,
            }, req.user);
            return res.json(result);
        } catch (error) {
            return next(error);
        }
    },

    async getProjectById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const project = await projectService.getProjectById(Number(req.params.id), req.user);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }
            return res.json(project);
        } catch (error) {
            return next(error);
        }
    },

    async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const existingProject = await projectService.getProjectById(Number(req.params.id), req.user);
            if (!existingProject) {
                return res.status(404).json({ message: "Project not found" });
            }
            if (!authorizationService.canManageProject(req.user, existingProject)) {
                return res.status(403).json({ message: "Access denied for this project" });
            }
            const project = await projectService.updateProject(
                Number(req.params.id),
                req.body
            );
            return res.json(project);
        } catch (error) {
            return next(error);
        }
    },

    async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const existingProject = await projectService.getProjectById(Number(req.params.id), req.user);
            if (!existingProject) {
                return res.status(404).json({ message: "Project not found" });
            }
            await projectService.deleteProject(Number(req.params.id));
            return res.json({ message: "Project deleted successfully" });
        } catch (error) {
            return next(error);
        }
    },

    async getProjectTasks(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const project = await projectService.getProjectById(Number(req.params.id), req.user);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            const { page, limit } = req.query;
            const result = await projectService.getProjectTasks(Number(req.params.id), {
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            }, req.user);
            return res.json(result);
        } catch (error) {
            return next(error);
        }
    },

    async getProjectTeams(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const project = await projectService.getProjectById(Number(req.params.id), req.user);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            const teams = await projectTeamService.getProjectTeams(Number(req.params.id));
            return res.json(teams);
        } catch (error) {
            return next(error);
        }
    },
};
