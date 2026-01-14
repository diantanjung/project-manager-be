import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { refreshTokens, users } from "../db/schema.js";
import { env } from "../config/env.js";
import { userService } from "./user.service.js";
import crypto from "crypto";

interface RefreshTokenPayload extends jwt.JwtPayload {
  id: number;
  email: string;
  type: string;
}

export const authService = {
  async register(data: typeof users.$inferInsert) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    return userService.createUser(data);
  },

  async login(data: Pick<typeof users.$inferInsert, "email" | "password">) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id, user.email);

    await this.saveRefreshToken(user.id, refreshToken);

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  },
  generateAccessToken(id: number, email: string) {
    return jwt.sign({ id, email, type: "access" }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  },
  generateRefreshToken(id: number, email: string) {
    return jwt.sign({ id, email, type: "refresh" }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  },
  async saveRefreshToken(userId: number, token: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiresIn = env.JWT_REFRESH_EXPIRES_IN;
    const match = expiresIn.match(/^(\d+)([dhms])$/);

    if (!match) {
      throw new Error("Invalid JWT_REFRESH_EXPIRES_IN format");
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const expiresAt = new Date();

    switch (unit) {
      case "d":
        expiresAt.setDate(expiresAt.getDate() + value);
        break;
      case "h":
        expiresAt.setHours(expiresAt.getHours() + value);
        break;
      case "m":
        expiresAt.setMinutes(expiresAt.getMinutes() + value);
        break;
      case "s":
        expiresAt.setSeconds(expiresAt.getSeconds() + value);
        break;
    }

    await db.insert(refreshTokens).values({
      userId,
      token: hashedToken,
      expiresAt,
    });
  },
  async refreshAccessToken(refreshToken: string) {
    let payload: RefreshTokenPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        env.JWT_REFRESH_SECRET
      ) as RefreshTokenPayload;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const existingToken = await db.query.refreshTokens.findFirst({
      where: (refreshTokens, { and, eq, gte }) =>
        and(
          eq(refreshTokens.token, hashedToken),
          eq(refreshTokens.userId, payload.id),
          eq(refreshTokens.isRevoked, false),
          gte(refreshTokens.expiresAt, new Date())
        ),
    });
    if (!existingToken) {
      throw new Error("Invalid refresh token");
    }
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.id),
    });
    if (!user) {
      throw new Error("Invalid refresh token");
    }
    const newAccessToken = this.generateAccessToken(user.id, user.email);

    // Token rotation: revoke old token and issue new one
    await this.revokeRefreshToken(refreshToken);
    const newRefreshToken = this.generateRefreshToken(user.id, user.email);
    await this.saveRefreshToken(user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },
  async revokeRefreshToken(refreshToken: string) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.token, hashedToken));
  },
  async revokeUserRefreshToken(userId: number, refreshToken: string) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Verify the token belongs to this user before revoking
    const existingToken = await db.query.refreshTokens.findFirst({
      where: (refreshTokens, { and, eq }) =>
        and(
          eq(refreshTokens.token, hashedToken),
          eq(refreshTokens.userId, userId)
        ),
    });

    if (!existingToken) {
      throw new Error("Refresh token not found or does not belong to user");
    }

    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.token, hashedToken));
  },
};
