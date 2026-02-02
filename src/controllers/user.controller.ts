import { Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const userController = {
  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, role, sortBy, order } = req.query;

      const result = await userService.getAllUsers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string | undefined,
        role: role as "admin" | "productOwner" | "projectManager" | "teamMember" | undefined,
        sortBy: sortBy as "name" | "email" | "role" | "createdAt" | "updatedAt" | undefined,
        order: order as "asc" | "desc" | undefined,
      });

      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(
        Number(req.params.id),
        req.body
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.deleteUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  async getUserTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const userId = Number(req.params.id);

      // Check if user exists
      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const result = await userService.getUserTasks(userId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
