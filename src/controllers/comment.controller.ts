import { Response, NextFunction } from "express";
import { commentService } from "../services/comment.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const commentController = {
    async createComment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const comment = await commentService.createComment({
                content: req.body.content,
                taskId: Number(req.params.taskId),
                authorId: req.user?.id!,
            });
            return res.status(201).json(comment);
        } catch (error) {
            next(error);
        }
    },

    async getCommentsByTaskId(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const comments = await commentService.getCommentsByTaskId(
                Number(req.params.taskId)
            );
            return res.json(comments);
        } catch (error) {
            next(error);
        }
    },

    async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const comment = await commentService.getCommentById(Number(req.params.id));
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            // Check if user is the author
            if (comment.authorId !== req.user?.id) {
                return res.status(403).json({ message: "Not authorized to update this comment" });
            }

            const updatedComment = await commentService.updateComment(
                Number(req.params.id),
                req.body.content
            );
            return res.json(updatedComment);
        } catch (error) {
            next(error);
        }
    },

    async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const comment = await commentService.getCommentById(Number(req.params.id));
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            // Check if user is the author
            if (comment.authorId !== req.user?.id) {
                return res.status(403).json({ message: "Not authorized to delete this comment" });
            }

            await commentService.deleteComment(Number(req.params.id));
            return res.json({ message: "Comment deleted successfully" });
        } catch (error) {
            next(error);
        }
    },
};
