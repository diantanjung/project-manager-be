import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { AuthRequest } from "../middlewares/auth.js";

// Cookie options for refresh token
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

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

      // Set refresh token as HttpOnly cookie
      res.cookie(
        "refreshToken",
        result.refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS,
      );

      // Don't send refreshToken in response body - only accessToken and user
      const { refreshToken, ...responseData } = result;
      return res.json(responseData);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "Invalid credentials") {
        return res.status(401).json({ message: error.message });
      }
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      // Read refresh token from HttpOnly cookie
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token not found" });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      // Set new rotated refresh token as HttpOnly cookie
      res.cookie(
        "refreshToken",
        result.refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS,
      );

      // Return only accessToken in response body
      return res.json({ accessToken: result.accessToken });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message === "Invalid or expired refresh token" ||
          error.message === "Refresh token not found or revoked" ||
          error.message === "Invalid refresh token")
      ) {
        // Clear invalid cookie
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          path: "/",
        });
        return res.status(401).json({ message: error.message });
      }
      next(error);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Read refresh token from HttpOnly cookie
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await authService.revokeUserRefreshToken(req.user!.id, refreshToken);
      }

      // Clear the refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/",
      });

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
