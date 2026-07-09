import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications, users } from "../db/schema.js";

export const notificationService = {
    async createNotification(data: typeof notifications.$inferInsert) {
        const [newNotification] = await db
            .insert(notifications)
            .values(data)
            .returning();
        return newNotification;
    },

    async getNotificationsByUserId(userId: number) {
        const data = await db
            .select({
                id: notifications.id,
                userId: notifications.userId,
                actorId: notifications.actorId,
                actorName: users.name,
                actorAvatarUrl: users.avatarUrl,
                type: notifications.type,
                taskId: notifications.taskId,
                isRead: notifications.isRead,
                createdAt: notifications.createdAt,
            })
            .from(notifications)
            .leftJoin(users, eq(notifications.actorId, users.id))
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt));

        return data;
    },

    async markAsRead(id: number, userId: number) {
        // Only mark it read if it belongs to the user
        const [updated] = await db
            .update(notifications)
            .set({ isRead: true })
            .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
            .returning();
        return updated;
    },

    async markAllAsRead(userId: number) {
        const updated = await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId))
            .returning();
        return updated;
    },
};
