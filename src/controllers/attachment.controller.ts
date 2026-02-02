import { Response, NextFunction } from "express";
import { attachmentService } from "../services/attachment.service.js";
import { AuthRequest } from "../middlewares/auth.js";

export const attachmentController = {
    async createAttachment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const attachment = await attachmentService.createAttachment({
                fileName: req.body.fileName,
                fileUrl: req.body.fileUrl,
                fileSize: req.body.fileSize,
                mimeType: req.body.mimeType,
                taskId: Number(req.params.taskId),
                uploaderId: req.user?.id!,
            });
            return res.status(201).json(attachment);
        } catch (error) {
            next(error);
        }
    },

    async getAttachmentsByTaskId(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const attachments = await attachmentService.getAttachmentsByTaskId(
                Number(req.params.taskId)
            );
            return res.json(attachments);
        } catch (error) {
            next(error);
        }
    },

    async getAttachmentById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const attachment = await attachmentService.getAttachmentById(
                Number(req.params.id)
            );
            if (!attachment) {
                return res.status(404).json({ message: "Attachment not found" });
            }
            return res.json(attachment);
        } catch (error) {
            next(error);
        }
    },

    async deleteAttachment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const attachment = await attachmentService.getAttachmentById(
                Number(req.params.id)
            );
            if (!attachment) {
                return res.status(404).json({ message: "Attachment not found" });
            }

            // Check if user is the uploader
            if (attachment.uploaderId !== req.user?.id) {
                return res.status(403).json({ message: "Not authorized to delete this attachment" });
            }

            await attachmentService.deleteAttachment(Number(req.params.id));
            return res.json({ message: "Attachment deleted successfully" });
        } catch (error) {
            next(error);
        }
    },
};
