import { Router, Request, Response, NextFunction } from "express";
import { userController } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  getUsersQuerySchema,
  getUserTasksSchema,
} from "../schemas/user.schema.js";
import { authenticate, AuthRequest } from "../middlewares/auth.js";
import { requireAdmin, requireProjectManager } from "../middlewares/rbac.js";

const router = Router();

router.use(authenticate);

// Custom middleware to allow self-update or projectManager
const requireSelfOrProjectManager = (req: AuthRequest, res: Response, next: NextFunction) => {
  const targetId = Number(req.params.id);
  if (req.user && req.user.id === targetId) {
    return next();
  }
  return requireProjectManager(req, res, next);
};

// Read operations - all authenticated users
router.get("/", validate(getUsersQuerySchema), userController.getAllUsers);
router.get("/:id", validate(userIdSchema), userController.getUserById);
router.get("/:id/tasks", validate(getUserTasksSchema), userController.getUserTasks);

// Create/Update - admin only
router.post("/", requireAdmin, validate(createUserSchema), userController.createUser);
router.patch("/:id", requireSelfOrProjectManager, validate(updateUserSchema), userController.updateUser);

// Delete - admin only
router.delete("/:id", requireAdmin, validate(userIdSchema), userController.deleteUser);

export const userRoutes = router;
