import { Router } from "express";
import { projectController } from "../controllers/project.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createProjectSchema,
    updateProjectSchema,
    projectIdSchema,
    getProjectsQuerySchema,
    getProjectTasksSchema,
} from "../schemas/project.schema.js";
import { authenticate } from "../middlewares/auth.js";
import { requireProductOwner, requireProjectManager } from "../middlewares/rbac.js";

const router = Router();

router.use(authenticate);

// Read operations - all authenticated users
router.get("/", validate(getProjectsQuerySchema), projectController.getAllProjects);
router.get("/:id", validate(projectIdSchema), projectController.getProjectById);
router.get("/:id/tasks", validate(getProjectTasksSchema), projectController.getProjectTasks);
router.get("/:id/teams", validate(projectIdSchema), projectController.getProjectTeams);

// Create/Update - projectManager and above
router.post("/", requireProjectManager, validate(createProjectSchema), projectController.createProject);
router.patch("/:id", requireProjectManager, validate(updateProjectSchema), projectController.updateProject);

// Delete - productOwner and above
router.delete("/:id", requireProductOwner, validate(projectIdSchema), projectController.deleteProject);

export const projectRoutes = router;
