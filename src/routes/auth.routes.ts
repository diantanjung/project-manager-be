import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
// Refresh token is now read from HttpOnly cookie, no body validation needed
router.post("/refresh", authController.refreshToken);
// Logout also reads refresh token from cookie
router.post("/logout", authenticate, authController.logout);

export const authRoutes = router;
