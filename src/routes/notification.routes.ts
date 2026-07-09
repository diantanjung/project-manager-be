import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { notificationIdSchema } from "../schemas/notification.schema.js";

const router = Router();

// Define routes
router.use(authenticate); // Require authentication for all notification routes

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch(
    "/:id/read",
    validate(notificationIdSchema),
    notificationController.markAsRead
);

export { router as notificationRoutes };
