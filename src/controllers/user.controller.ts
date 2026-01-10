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
      const users = await userService.getAllUsers();
      return res.json(users);
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

};
