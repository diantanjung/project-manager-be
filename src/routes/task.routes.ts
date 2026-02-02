import { Router } from "express";
import { taskController } from "../controllers/task.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema,
    taskIdSchema,
    getTasksQuerySchema,
} from "../schemas/task.schema.js";
import { authenticate } from "../middlewares/auth.js";
import { requireProjectManager } from "../middlewares/rbac.js";

const router = Router();

router.use(authenticate);

// Read operations - all authenticated users
router.get("/", validate(getTasksQuerySchema), taskController.getAllTasks);
router.get("/:id", validate(taskIdSchema), taskController.getTaskById);

// Create task - projectManager and above
router.post("/", requireProjectManager, validate(createTaskSchema), taskController.createTask);

// Update task - all authenticated users can update (for status changes by assignees)
router.patch("/:id", validate(updateTaskSchema), taskController.updateTask);
router.patch("/:id/status", validate(updateTaskStatusSchema), taskController.updateTaskStatus);

// Delete - projectManager and above
router.delete("/:id", requireProjectManager, validate(taskIdSchema), taskController.deleteTask);

export const taskRoutes = router;
