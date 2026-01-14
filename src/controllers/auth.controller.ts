import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      return res.status(201).json(user);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "User already exists") {
        return res.status(409).json({ message: error.message });
      }
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "Invalid credentials") {
        return res.status(401).json({ message: error.message });
      }
      next(error);
    }
  },
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshAccessToken(
        req.body.refreshToken
      );
      return res.json(result);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message === "Invalid or expired refresh token" ||
          error.message === "Refresh token not found or revoked" ||
          error.message === "Invalid refresh token")
      ) {
        return res.status(401).json({ message: error.message });
      }
      next(error);
    }
  },
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.revokeUserRefreshToken(
        req.user!.id,
        req.body.refreshToken
      );
      return res.status(204).send();
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "Refresh token not found or does not belong to user"
      ) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  },
};
