import { Router } from "express";
import { projectTeamController } from "../controllers/projectTeam.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    assignTeamToProjectSchema,
    projectTeamIdSchema,
    projectIdParamSchema,
} from "../schemas/projectTeam.schema.js";
import { authenticate } from "../middlewares/auth.js";
import { requireProductOwner, requireProjectManager } from "../middlewares/rbac.js";

const router = Router();

router.use(authenticate);

// Read - all authenticated users
router.get("/projects/:projectId/teams", validate(projectIdParamSchema), projectTeamController.getProjectTeams);

// Assign team to project - projectManager and above
router.post("/", requireProjectManager, validate(assignTeamToProjectSchema), projectTeamController.assignTeamToProject);

// Remove team from project - productOwner and above
router.delete("/:id", requireProductOwner, validate(projectTeamIdSchema), projectTeamController.removeTeamFromProject);

export const projectTeamRoutes = router;
