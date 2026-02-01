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

const router = Router();

router.use(authenticate);

router.post("/", validate(createUserSchema), userController.createUser);
router.get("/", validate(getUsersQuerySchema), userController.getAllUsers);
router.get("/:id", validate(userIdSchema), userController.getUserById);
router.get("/:id/tasks", validate(getUserTasksSchema), userController.getUserTasks);
router.patch("/:id", validate(updateUserSchema), userController.updateUser);
router.delete("/:id", validate(userIdSchema), userController.deleteUser);

export const userRoutes = router;
