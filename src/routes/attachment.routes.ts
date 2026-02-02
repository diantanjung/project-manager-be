import { Router } from "express";
import { attachmentController } from "../controllers/attachment.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createAttachmentSchema,
    attachmentIdSchema,
    taskIdParamSchema,
} from "../schemas/attachment.schema.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate);

// All authenticated users can read, create, and delete (own) attachments
// Authorization for delete is handled in the controller (uploader check)
router.post("/tasks/:taskId/attachments", validate(createAttachmentSchema), attachmentController.createAttachment);
router.get("/tasks/:taskId/attachments", validate(taskIdParamSchema), attachmentController.getAttachmentsByTaskId);
router.get("/attachments/:id", validate(attachmentIdSchema), attachmentController.getAttachmentById);
router.delete("/attachments/:id", validate(attachmentIdSchema), attachmentController.deleteAttachment);

export const attachmentRoutes = router;
