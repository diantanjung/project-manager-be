import { Router } from "express";
import { taskAssignmentController } from "../controllers/taskAssignment.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    assignUserToTaskSchema,
    taskAssignmentIdSchema,
    taskIdParamSchema,
} from "../schemas/taskAssignment.schema.js";
import { authenticate } from "../middlewares/auth.js";
import { requireProjectManager } from "../middlewares/rbac.js";

const router = Router();

router.use(authenticate);

// Read - all authenticated users
router.get("/tasks/:taskId/assignments", validate(taskIdParamSchema), taskAssignmentController.getTaskAssignments);

// Assign user to task - projectManager and above
router.post("/", requireProjectManager, validate(assignUserToTaskSchema), taskAssignmentController.assignUserToTask);

// Remove assignment - projectManager and above
router.delete("/:id", requireProjectManager, validate(taskAssignmentIdSchema), taskAssignmentController.removeAssignment);

export const taskAssignmentRoutes = router;
