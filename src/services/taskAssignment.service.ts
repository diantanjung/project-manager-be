import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { taskAssignments, users } from "../db/schema.js";
import { notificationService } from "./notification.service.js";

export const taskAssignmentService = {
    async assignUserToTask(taskId: number, userId: number) {
        // Check if assignment already exists
        const existing = await db
            .select()
            .from(taskAssignments)
            .where(
                and(
                    eq(taskAssignments.taskId, taskId),
                    eq(taskAssignments.userId, userId)
                )
            );

        if (existing.length > 0) {
            return { exists: true, data: existing[0] };
        }

        const [assignment] = await db
            .insert(taskAssignments)
            .values({ taskId, userId })
            .returning();

        // Get the task details to find the actor (we can just say actor is the one who did the action, but taskAssignmentService doesn't receive actorId. Let's just create a generic notification for now without actorId, or we can fetch task details.)
        // Actually, we don't have req.user here. We'll leave actorId as null for now, or just send a notification without it.
        await notificationService.createNotification({
            userId: userId,
            type: "task_assigned",
            taskId: taskId,
        });

        return { exists: false, data: assignment };
    },

    async getTaskAssignments(taskId: number) {
        const data = await db
            .select({
                id: taskAssignments.id,
                taskId: taskAssignments.taskId,
                userId: taskAssignments.userId,
                userName: users.name,
                userEmail: users.email,
                userAvatarUrl: users.avatarUrl,
                assignedAt: taskAssignments.assignedAt,
            })
            .from(taskAssignments)
            .leftJoin(users, eq(taskAssignments.userId, users.id))
            .where(eq(taskAssignments.taskId, taskId));

        return data;
    },

    async getAssignmentById(id: number) {
        const [assignment] = await db
            .select()
            .from(taskAssignments)
            .where(eq(taskAssignments.id, id));
        return assignment;
    },

    async removeAssignment(id: number) {
        const [deleted] = await db
            .delete(taskAssignments)
            .where(eq(taskAssignments.id, id))
            .returning();
        return deleted;
    },
};
