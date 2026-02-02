import { Router } from "express";
import { teamController } from "../controllers/team.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createTeamSchema,
    updateTeamSchema,
    teamIdSchema,
    getTeamsQuerySchema,
    addTeamMemberSchema,
    removeTeamMemberSchema,
} from "../schemas/team.schema.js";
import { authenticate } from "../middlewares/auth.js";
import { requireAdmin, requireProductOwner, requireProjectManager } from "../middlewares/rbac.js";

const router = Router();

router.use(authenticate);

// Read operations - all authenticated users
router.get("/", validate(getTeamsQuerySchema), teamController.getAllTeams);
router.get("/:id", validate(teamIdSchema), teamController.getTeamById);
router.get("/:id/members", validate(teamIdSchema), teamController.getTeamMembers);

// Create/Update team - productOwner and above
router.post("/", requireProductOwner, validate(createTeamSchema), teamController.createTeam);
router.patch("/:id", requireProductOwner, validate(updateTeamSchema), teamController.updateTeam);

// Delete team - admin only
router.delete("/:id", requireAdmin, validate(teamIdSchema), teamController.deleteTeam);

// Team member management - projectManager and above
router.post("/:id/members", requireProjectManager, validate(addTeamMemberSchema), teamController.addTeamMember);
router.delete("/:id/members/:userId", requireProjectManager, validate(removeTeamMemberSchema), teamController.removeTeamMember);

export const teamRoutes = router;
