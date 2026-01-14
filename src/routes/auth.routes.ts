import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from "../schemas/auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken
);
router.post(
  "/logout",
  authenticate,
  validate(refreshTokenSchema),
  authController.logout
);

export const authRoutes = router;
