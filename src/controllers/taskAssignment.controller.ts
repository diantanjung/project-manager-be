import { Response, NextFunction } from "express";
import { taskAssignmentService } from "../services/taskAssignment.service.js";
import { taskService } from "../services/task.service.js";
import { userService } from "../services/user.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const taskAssignmentController = {
    async assignUserToTask(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { taskId, userId } = req.body;

            // Verify task exists
            const task = await taskService.getTaskById(taskId);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            // Verify user exists
            const user = await userService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const result = await taskAssignmentService.assignUserToTask(taskId, userId);

            if (result.exists) {
                return res.status(400).json({ message: "User already assigned to this task" });
            }

            return res.status(201).json(result.data);
        } catch (error) {
            next(error);
        }
    },

    async getTaskAssignments(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const taskId = Number(req.params.taskId);

            // Verify task exists
            const task = await taskService.getTaskById(taskId);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            const assignments = await taskAssignmentService.getTaskAssignments(taskId);
            return res.json(assignments);
        } catch (error) {
            next(error);
        }
    },

    async removeAssignment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            const assignment = await taskAssignmentService.getAssignmentById(id);
            if (!assignment) {
                return res.status(404).json({ message: "Task assignment not found" });
            }

            await taskAssignmentService.removeAssignment(id);
            return res.json({ message: "Assignment removed successfully" });
        } catch (error) {
            next(error);
        }
    },
};
