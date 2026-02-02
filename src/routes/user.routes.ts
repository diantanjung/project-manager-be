import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  getUsersQuerySchema,
  getUserTasksSchema,
} from "../schemas/user.schema.js";
import { authenticate } from "../middlewares/auth.js";
import { requireAdmin, requireProjectManager } from "../middlewares/rbac.js";

const router = Router();

router.use(authenticate);

// Read operations - all authenticated users
router.get("/", validate(getUsersQuerySchema), userController.getAllUsers);
router.get("/:id", validate(userIdSchema), userController.getUserById);
router.get("/:id/tasks", validate(getUserTasksSchema), userController.getUserTasks);

// Create/Update - admin only
router.post("/", requireAdmin, validate(createUserSchema), userController.createUser);
router.patch("/:id", requireProjectManager, validate(updateUserSchema), userController.updateUser);

// Delete - admin only
router.delete("/:id", requireAdmin, validate(userIdSchema), userController.deleteUser);

export const userRoutes = router;
