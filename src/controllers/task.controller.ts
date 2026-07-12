import { Response, NextFunction } from "express";
import { taskService } from "../services/task.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const taskController = {
    async createTask(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const task = await taskService.createTask({
                ...req.body,
                creatorId: req.user.id,
            });
            return res.status(201).json(task);
        } catch (error) {
            return next(error);
        }
    },

    async getAllTasks(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { page, limit, search, projectId, status, priority, assigneeId, sortBy, order } = req.query;
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const result = await taskService.getAllTasks({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                search: search as string | undefined,
                projectId: projectId ? Number(projectId) : undefined,
                status: status as string | undefined,
                priority: priority as string | undefined,
                assigneeId: assigneeId ? Number(assigneeId) : undefined,
                sortBy: sortBy as "title" | "createdAt" | "updatedAt" | "dueDate" | "priority" | undefined,
                order: order as "asc" | "desc" | undefined,
            }, req.user);
            return res.json(result);
        } catch (error) {
            return next(error);
        }
    },

    async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const task = await taskService.getTaskById(Number(req.params.id), req.user);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }
            return res.json(task);
        } catch (error) {
            return next(error);
        }
    },

    async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const existingTask = await taskService.getTaskById(Number(req.params.id), req.user);
            if (!existingTask) {
                return res.status(404).json({ message: "Task not found" });
            }
            const task = await taskService.updateTask(Number(req.params.id), req.body);
            return res.json(task);
        } catch (error) {
            return next(error);
        }
    },

    async updateTaskStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const existingTask = await taskService.getTaskById(Number(req.params.id), req.user);
            if (!existingTask) {
                return res.status(404).json({ message: "Task not found" });
            }
            const task = await taskService.updateTaskStatus(
                Number(req.params.id),
                req.body.status
            );
            return res.json(task);
        } catch (error) {
            return next(error);
        }
    },

    async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const existingTask = await taskService.getTaskById(Number(req.params.id), req.user);
            if (!existingTask) {
                return res.status(404).json({ message: "Task not found" });
            }
            await taskService.deleteTask(Number(req.params.id));
            return res.json({ message: "Task deleted successfully" });
        } catch (error) {
            return next(error);
        }
    },
};
