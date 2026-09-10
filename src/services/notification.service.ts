import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import crypto from "crypto";

type CreateNotificationData = {
    userId: number;
    actorId?: number | null;
    type: string;
    taskId?: number | null;
};

const parseNotificationData = (data: string) => {
    try {
        const parsed = JSON.parse(data) as Record<string, unknown>;
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

export const notificationService = {
    async createNotification(data: CreateNotificationData) {
        const now = new Date();
        const [newNotification] = await db
            .insert(notifications)
            .values({
                id: crypto.randomUUID(),
                type: data.type,
                notifiableType: "App\\Models\\User",
                notifiableId: data.userId,
                data: JSON.stringify({
                    actorId: data.actorId ?? null,
                    taskId: data.taskId ?? null,
                }),
                createdAt: now,
                updatedAt: now,
            })
            .returning();
        return newNotification;
    },

    async getNotificationsByUserId(userId: number) {
        const data = await db
            .select({
                id: notifications.id,
                userId: notifications.notifiableId,
                type: notifications.type,
                payload: notifications.data,
                readAt: notifications.readAt,
                createdAt: notifications.createdAt,
            })
            .from(notifications)
            .where(eq(notifications.notifiableId, userId))
            .orderBy(desc(notifications.createdAt));

        return data.map((notification) => {
            const payload = parseNotificationData(notification.payload);
            const actorId = typeof payload.actorId === "number" ? payload.actorId : null;
            const taskId = typeof payload.taskId === "number" ? payload.taskId : null;

            return {
                id: notification.id,
                userId: notification.userId,
                actorId,
                actorName: null,
                actorAvatarUrl: null,
                type: notification.type,
                taskId,
                isRead: notification.readAt !== null,
                createdAt: notification.createdAt,
            };
        });
    },

    async markAsRead(id: string, userId: number) {
        // Only mark it read if it belongs to the user
        const [updated] = await db
            .update(notifications)
            .set({ readAt: new Date(), updatedAt: new Date() })
            .where(and(eq(notifications.id, id), eq(notifications.notifiableId, userId)))
            .returning();
        return updated;
    },

    async markAllAsRead(userId: number) {
        const updated = await db
            .update(notifications)
            .set({ readAt: new Date(), updatedAt: new Date() })
            .where(eq(notifications.notifiableId, userId))
            .returning();
        return updated;
    },
};
