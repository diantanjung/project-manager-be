import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { attachments } from "../db/schema.js";

export const attachmentService = {
    async createAttachment(data: typeof attachments.$inferInsert) {
        const [newAttachment] = await db.insert(attachments).values(data).returning();
        return newAttachment;
    },

    async getAttachmentsByTaskId(taskId: number) {
        const data = await db
            .select()
            .from(attachments)
            .where(eq(attachments.taskId, taskId));
        return data;
    },

    async getAttachmentById(id: number) {
        const [attachment] = await db
            .select()
            .from(attachments)
            .where(eq(attachments.id, id));
        return attachment;
    },

    async deleteAttachment(id: number) {
        const [deletedAttachment] = await db
            .delete(attachments)
            .where(eq(attachments.id, id))
            .returning();
        return deletedAttachment;
    },
};
