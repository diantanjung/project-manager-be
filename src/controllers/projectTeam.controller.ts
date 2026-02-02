import { Response, NextFunction } from "express";
import { projectTeamService } from "../services/projectTeam.service.js";
import { projectService } from "../services/project.service.js";
import { teamService } from "../services/team.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const projectTeamController = {
    async assignTeamToProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { projectId, teamId } = req.body;

            // Verify project exists
            const project = await projectService.getProjectById(projectId);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            // Verify team exists
            const team = await teamService.getTeamById(teamId);
            if (!team) {
                return res.status(404).json({ message: "Team not found" });
            }

            const result = await projectTeamService.assignTeamToProject(projectId, teamId);

            if (result.exists) {
                return res.status(400).json({ message: "Team already assigned to this project" });
            }

            return res.status(201).json(result.data);
        } catch (error) {
            next(error);
        }
    },

    async getProjectTeams(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const projectId = Number(req.params.projectId);

            // Verify project exists
            const project = await projectService.getProjectById(projectId);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            const teams = await projectTeamService.getProjectTeams(projectId);
            return res.json(teams);
        } catch (error) {
            next(error);
        }
    },

    async removeTeamFromProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            const assignment = await projectTeamService.getAssignmentById(id);
            if (!assignment) {
                return res.status(404).json({ message: "Project-team assignment not found" });
            }

            await projectTeamService.removeTeamFromProject(id);
            return res.json({ message: "Team removed from project successfully" });
        } catch (error) {
            next(error);
        }
    },
};
