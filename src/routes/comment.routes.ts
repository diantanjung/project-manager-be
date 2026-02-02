import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createCommentSchema,
    updateCommentSchema,
    commentIdSchema,
    taskIdParamSchema,
} from "../schemas/comment.schema.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate);

// All authenticated users can read, create, update (own), and delete (own) comments
// Authorization for update/delete is handled in the controller (author check)
router.post("/tasks/:taskId/comments", validate(createCommentSchema), commentController.createComment);
router.get("/tasks/:taskId/comments", validate(taskIdParamSchema), commentController.getCommentsByTaskId);
router.patch("/comments/:id", validate(updateCommentSchema), commentController.updateComment);
router.delete("/comments/:id", validate(commentIdSchema), commentController.deleteComment);

export const commentRoutes = router;
