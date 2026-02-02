import { eq, count, ilike, or, asc, desc, SQL, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { tasks, projects, users, comments, attachments } from "../db/schema.js";

export interface TaskPaginationOptions {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: number;
    status?: string;
    priority?: string;
    assigneeId?: number;
    sortBy?: "title" | "createdAt" | "updatedAt" | "dueDate" | "priority";
    order?: "asc" | "desc";
}

export const taskService = {
    async createTask(data: typeof tasks.$inferInsert) {
        const [newTask] = await db.insert(tasks).values(data).returning();
        return newTask;
    },

    async getAllTasks(options: TaskPaginationOptions = {}) {
        const {
            page = 1,
            limit = 10,
            search,
            projectId,
            status,
            priority,
            assigneeId,
            sortBy = "createdAt",
            order = "desc",
        } = options;

        const offset = (page - 1) * limit;

        // Build filters
        const filters: SQL[] = [];
        if (search) {
            filters.push(
                or(
                    ilike(tasks.title, `%${search}%`),
                    ilike(tasks.description, `%${search}%`)
                )!
            );
        }
        if (projectId) {
            filters.push(eq(tasks.projectId, projectId));
        }
        if (status) {
            filters.push(eq(tasks.status, status as any));
        }
        if (priority) {
            filters.push(eq(tasks.priority, priority as any));
        }
        if (assigneeId) {
            filters.push(eq(tasks.assigneeId, assigneeId));
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        const sortColumns = {
            title: tasks.title,
            createdAt: tasks.createdAt,
            updatedAt: tasks.updatedAt,
            dueDate: tasks.dueDate,
            priority: tasks.priority,
        };
        const sortColumn = sortColumns[sortBy] ?? tasks.createdAt;
        const orderBy = order === "asc" ? asc(sortColumn) : desc(sortColumn);

        const [{ total }] = await db
            .select({ total: count() })
            .from(tasks)
            .where(whereClause);

        const data = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                description: tasks.description,
                status: tasks.status,
                priority: tasks.priority,
                projectId: tasks.projectId,
                projectName: projects.name,
                creatorId: tasks.creatorId,
                assigneeId: tasks.assigneeId,
                dueDate: tasks.dueDate,
                position: tasks.position,
                createdAt: tasks.createdAt,
                updatedAt: tasks.updatedAt,
            })
            .from(tasks)
            .leftJoin(projects, eq(tasks.projectId, projects.id))
            .where(whereClause)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        return {
            data,
            pagination: {
                page,
                limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getTaskById(id: number) {
        const [task] = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                description: tasks.description,
                status: tasks.status,
                priority: tasks.priority,
                projectId: tasks.projectId,
                projectName: projects.name,
                creatorId: tasks.creatorId,
                assigneeId: tasks.assigneeId,
                dueDate: tasks.dueDate,
                position: tasks.position,
                createdAt: tasks.createdAt,
                updatedAt: tasks.updatedAt,
            })
            .from(tasks)
            .leftJoin(projects, eq(tasks.projectId, projects.id))
            .where(eq(tasks.id, id));

        if (!task) return null;

        // Get comments
        const taskComments = await db
            .select({
                id: comments.id,
                content: comments.content,
                authorId: comments.authorId,
                authorName: users.name,
                createdAt: comments.createdAt,
                updatedAt: comments.updatedAt,
            })
            .from(comments)
            .leftJoin(users, eq(comments.authorId, users.id))
            .where(eq(comments.taskId, id))
            .orderBy(desc(comments.createdAt));

        // Get attachments
        const taskAttachments = await db
            .select()
            .from(attachments)
            .where(eq(attachments.taskId, id));

        return {
            ...task,
            comments: taskComments,
            attachments: taskAttachments,
        };
    },

    async updateTask(id: number, data: Partial<typeof tasks.$inferInsert>) {
        const [updatedTask] = await db
            .update(tasks)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(tasks.id, id))
            .returning();
        return updatedTask;
    },

    async updateTaskStatus(id: number, status: string) {
        const [updatedTask] = await db
            .update(tasks)
            .set({ status: status as any, updatedAt: new Date() })
            .where(eq(tasks.id, id))
            .returning();
        return updatedTask;
    },

    async deleteTask(id: number) {
        const [deletedTask] = await db
            .delete(tasks)
            .where(eq(tasks.id, id))
            .returning();
        return deletedTask;
    },
};
