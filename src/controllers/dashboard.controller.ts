import { Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const dashboardController = {
    async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }

            const summary = await dashboardService.getDashboard(req.user);
            return res.json(summary);
        } catch (error) {
            return next(error);
        }
    },
};
