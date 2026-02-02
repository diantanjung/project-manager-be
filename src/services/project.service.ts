import { eq, count, ilike, or, asc, desc, SQL, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects, tasks, teams, users } from "../db/schema.js";

export interface ProjectPaginationOptions {
    page?: number;
    limit?: number;
    search?: string;
    teamId?: number;
    sortBy?: "name" | "createdAt" | "updatedAt";
    order?: "asc" | "desc";
}

export const projectService = {
    async createProject(data: typeof projects.$inferInsert) {
        const [newProject] = await db.insert(projects).values(data).returning();
        return newProject;
    },

    async getAllProjects(options: ProjectPaginationOptions = {}) {
        const {
            page = 1,
            limit = 10,
            search,
            teamId,
            sortBy = "createdAt",
            order = "desc",
        } = options;

        const offset = (page - 1) * limit;

        // Build filters
        const filters: SQL[] = [];
        if (search) {
            filters.push(
                or(
                    ilike(projects.name, `%${search}%`),
                    ilike(projects.description, `%${search}%`)
                )!
            );
        }
        if (teamId) {
            filters.push(eq(projects.teamId, teamId));
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        const sortColumn = projects[sortBy];
        const orderBy = order === "asc" ? asc(sortColumn) : desc(sortColumn);

        const [{ total }] = await db
            .select({ total: count() })
            .from(projects)
            .where(whereClause);

        const data = await db
            .select({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                teamId: projects.teamId,
                teamName: teams.name,
                ownerId: projects.ownerId,
                ownerName: users.name,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects)
            .leftJoin(teams, eq(projects.teamId, teams.id))
            .leftJoin(users, eq(projects.ownerId, users.id))
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

    async getProjectById(id: number) {
        const [project] = await db
            .select({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                teamId: projects.teamId,
                teamName: teams.name,
                ownerId: projects.ownerId,
                ownerName: users.name,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects)
            .leftJoin(teams, eq(projects.teamId, teams.id))
            .leftJoin(users, eq(projects.ownerId, users.id))
            .where(eq(projects.id, id));
        return project;
    },

    async updateProject(id: number, data: Partial<typeof projects.$inferInsert>) {
        const [updatedProject] = await db
            .update(projects)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(projects.id, id))
            .returning();
        return updatedProject;
    },

    async deleteProject(id: number) {
        const [deletedProject] = await db
            .delete(projects)
            .where(eq(projects.id, id))
            .returning();
        return deletedProject;
    },

    async getProjectTasks(projectId: number, options: { page?: number; limit?: number } = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const [{ total }] = await db
            .select({ total: count() })
            .from(tasks)
            .where(eq(tasks.projectId, projectId));

        const data = await db
            .select()
            .from(tasks)
            .where(eq(tasks.projectId, projectId))
            .orderBy(desc(tasks.createdAt))
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
};
