import { Response, NextFunction } from "express";
import { teamService } from "../services/team.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const teamController = {
    async createTeam(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const team = await teamService.createTeam(req.body);
            return res.status(201).json(team);
        } catch (error) {
            next(error);
        }
    },

    async getAllTeams(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { page, limit } = req.query;
            const result = await teamService.getAllTeams({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });
            return res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getTeamById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const team = await teamService.getTeamById(Number(req.params.id));
            if (!team) {
                return res.status(404).json({ message: "Team not found" });
            }
            return res.json(team);
        } catch (error) {
            next(error);
        }
    },

    async updateTeam(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const team = await teamService.updateTeam(Number(req.params.id), req.body);
            if (!team) {
                return res.status(404).json({ message: "Team not found" });
            }
            return res.json(team);
        } catch (error) {
            next(error);
        }
    },

    async deleteTeam(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const team = await teamService.deleteTeam(Number(req.params.id));
            if (!team) {
                return res.status(404).json({ message: "Team not found" });
            }
            return res.json({ message: "Team deleted successfully" });
        } catch (error) {
            next(error);
        }
    },

    async getTeamMembers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const team = await teamService.getTeamById(Number(req.params.id));
            if (!team) {
                return res.status(404).json({ message: "Team not found" });
            }
            const members = await teamService.getTeamMembers(Number(req.params.id));
            return res.json(members);
        } catch (error) {
            next(error);
        }
    },

    async addTeamMember(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const team = await teamService.getTeamById(Number(req.params.id));
            if (!team) {
                return res.status(404).json({ message: "Team not found" });
            }
            const result = await teamService.addTeamMember(
                Number(req.params.id),
                req.body.userId,
                req.body.role
            );
            if ("error" in result) {
                return res.status(400).json({ message: result.error });
            }
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    },

    async removeTeamMember(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const deleted = await teamService.removeTeamMember(
                Number(req.params.id),
                Number(req.params.userId)
            );
            if (!deleted) {
                return res.status(404).json({ message: "Team member not found" });
            }
            return res.json({ message: "Member removed from team" });
        } catch (error) {
            next(error);
        }
    },
};
