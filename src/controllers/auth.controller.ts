import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { AuthRequest } from "../middlewares/auth.js";

// Cookie options for refresh token
const isProduction = process.env.NODE_ENV === "production";
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const CLEAR_REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: REFRESH_TOKEN_COOKIE_OPTIONS.secure,
  sameSite: REFRESH_TOKEN_COOKIE_OPTIONS.sameSite,
  path: REFRESH_TOKEN_COOKIE_OPTIONS.path,
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      res.cookie(
        "refreshToken",
        result.refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS,
      );

      const { refreshToken, ...responseData } = result;
      return res.status(201).json({ data: responseData });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "User already exists") {
        return res.status(409).json({ message: error.message });
      }
      return next(error);
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
      return res.json({ data: responseData });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "Invalid credentials") {
        return res.status(401).json({ message: error.message });
      }
      return next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      // Prefer the HttpOnly cookie, but allow body token for non-browser clients.
      const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;

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
      return res.json({ data: { accessToken: result.accessToken } });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message === "Invalid or expired refresh token" ||
          error.message === "Refresh token not found or revoked" ||
          error.message === "Invalid refresh token")
      ) {
        // Clear invalid cookie
        res.clearCookie("refreshToken", CLEAR_REFRESH_TOKEN_COOKIE_OPTIONS);
        return res.status(401).json({ message: error.message });
      }
      return next(error);
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
      res.clearCookie("refreshToken", CLEAR_REFRESH_TOKEN_COOKIE_OPTIONS);

      return res.status(204).send();
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "Refresh token not found or does not belong to user"
      ) {
        return res.status(403).json({ message: error.message });
      }
      return next(error);
    }
  },
};
