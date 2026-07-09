import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, users } from "../db/schema.js";
import { notificationService } from "./notification.service.js";

export const commentService = {
    async createComment(data: typeof comments.$inferInsert) {
        const [newComment] = await db.insert(comments).values(data).returning();

        // Parse mentions (@name)
        const content = data.content;
        const mentionRegex = /@(\w+)/g;
        const matches = [...content.matchAll(mentionRegex)];
        const mentionedNames = matches.map((match) => match[1]);

        if (mentionedNames.length > 0) {
            for (const name of mentionedNames) {
                const matchedUser = await db.select({ id: users.id }).from(users).where(eq(users.name, name)).limit(1);
                if (matchedUser.length > 0) {
                    const mentionedUserId = matchedUser[0].id;
                    // Avoid notifying the author themselves
                    if (mentionedUserId !== data.authorId) {
                        await notificationService.createNotification({
                            userId: mentionedUserId,
                            actorId: data.authorId,
                            type: "mention",
                            taskId: data.taskId,
                        });
                    }
                }
            }
        }

        return newComment;
    },

    async getCommentsByTaskId(taskId: number) {
        const data = await db
            .select({
                id: comments.id,
                content: comments.content,
                taskId: comments.taskId,
                authorId: comments.authorId,
                authorName: users.name,
                createdAt: comments.createdAt,
                updatedAt: comments.updatedAt,
            })
            .from(comments)
            .leftJoin(users, eq(comments.authorId, users.id))
            .where(eq(comments.taskId, taskId))
            .orderBy(desc(comments.createdAt));

        return data;
    },

    async getCommentById(id: number) {
        const [comment] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, id));
        return comment;
    },

    async updateComment(id: number, content: string) {
        const [updatedComment] = await db
            .update(comments)
            .set({ content, updatedAt: new Date() })
            .where(eq(comments.id, id))
            .returning();
        return updatedComment;
    },

    async deleteComment(id: number) {
        const [deletedComment] = await db
            .delete(comments)
            .where(eq(comments.id, id))
            .returning();
        return deletedComment;
    },
};
