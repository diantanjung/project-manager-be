import { Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const notificationController = {
    getNotifications: async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user!.id;
            const notifications = await notificationService.getNotificationsByUserId(
                userId
            );
            res.json({ success: true, count: notifications.length, data: notifications });
        } catch (error) {
            return next(error);
        }
    },

    markAsRead: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const userId = req.user!.id;
            const notification = await notificationService.markAsRead(id, userId);

            res.json({
                success: true,
                message: "Notification marked as read",
                data: notification,
            });
        } catch (error) {
            return next(error);
        }
    },

    markAllAsRead: async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user!.id;
            const updated = await notificationService.markAllAsRead(userId);

            res.json({
                success: true,
                message: "All notifications marked as read",
                data: updated,
            });
        } catch (error) {
            return next(error);
        }
    },
};
