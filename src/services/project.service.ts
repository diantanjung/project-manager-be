import { eq, count, ilike, or, asc, desc, SQL, and, exists, inArray, ne } from "drizzle-orm";
import { db } from "../db/index.js";
import {
    projects,
    projectTeams,
    taskAssignments,
    tasks,
    teamMembers,
    teams,
    users,
} from "../db/schema.js";
import { AuthUser, authorizationService } from "./authorization.service.js";

export interface ProjectPaginationOptions {
    page?: number;
    limit?: number;
    search?: string;
    teamId?: number;
    sortBy?: "name" | "createdAt" | "updatedAt";
    order?: "asc" | "desc";
}

type ProjectWriteData = typeof projects.$inferInsert & {
    teamId?: number;
};

const projectTeamExists = (teamId: number) =>
    exists(
        db
            .select({ id: projectTeams.id })
            .from(projectTeams)
            .where(and(eq(projectTeams.projectId, projects.id), eq(projectTeams.teamId, teamId)))
    );

const sidebarTeamMembershipExists = (userId: number) =>
    exists(
        db
            .select({ id: projectTeams.id })
            .from(projectTeams)
            .innerJoin(teamMembers, eq(teamMembers.teamId, projectTeams.teamId))
            .where(and(eq(projectTeams.projectId, projects.id), eq(teamMembers.userId, userId)))
    );

const sidebarTaskAssignmentExists = (userId: number) =>
    exists(
        db
            .select({ taskId: taskAssignments.taskId })
            .from(taskAssignments)
            .where(and(eq(taskAssignments.taskId, tasks.id), eq(taskAssignments.userId, userId)))
    );

const sidebarProjectTaskAccessExists = (userId: number) =>
    exists(
        db
            .select({ id: tasks.id })
            .from(tasks)
            .where(
                and(
                    eq(tasks.projectId, projects.id),
                    or(
                        eq(tasks.creatorId, userId),
                        eq(tasks.assigneeId, userId),
                        sidebarTaskAssignmentExists(userId)
                    )
                )
            )
    );

const sidebarProjectAccessWhere = (currentUser: AuthUser): SQL | undefined => {
    if (currentUser.role === "admin") {
        return undefined;
    }

    return or(
        eq(projects.ownerId, currentUser.id),
        sidebarTeamMembershipExists(currentUser.id),
        sidebarProjectTaskAccessExists(currentUser.id)
    );
};

const attachPrimaryTeams = async <T extends { id: number }>(projectRows: T[]) => {
    if (projectRows.length === 0) {
        return [];
    }

    const teamRows = await db
        .select({
            projectId: projectTeams.projectId,
            teamId: projectTeams.teamId,
            teamName: teams.name,
        })
        .from(projectTeams)
        .leftJoin(teams, eq(projectTeams.teamId, teams.id))
        .where(inArray(projectTeams.projectId, projectRows.map((project) => project.id)))
        .orderBy(asc(projectTeams.assignedAt));

    const primaryTeamByProjectId = new Map<number, (typeof teamRows)[number]>();
    for (const team of teamRows) {
        if (!primaryTeamByProjectId.has(team.projectId)) {
            primaryTeamByProjectId.set(team.projectId, team);
        }
    }

    return projectRows.map((project) => {
        const team = primaryTeamByProjectId.get(project.id);
        return {
            ...project,
            teamId: team?.teamId ?? null,
            teamName: team?.teamName ?? null,
        };
    });
};

export const projectService = {
    async createProject(data: ProjectWriteData) {
        const { teamId, ...projectData } = data;
        const now = new Date();
        const [newProject] = await db
            .insert(projects)
            .values({ ...projectData, createdAt: now, updatedAt: now })
            .returning();

        if (teamId !== undefined) {
            await db.insert(projectTeams).values({
                projectId: newProject.id,
                teamId,
                assignedAt: now,
            });
        }

        return this.getProjectById(newProject.id);
    },

    async getAllProjects(options: ProjectPaginationOptions = {}, currentUser?: AuthUser) {
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
            filters.push(projectTeamExists(teamId));
        }
        if (currentUser) {
            const accessFilter = authorizationService.projectAccessWhere(currentUser);
            if (accessFilter) filters.push(accessFilter);
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
                ownerId: projects.ownerId,
                ownerName: users.name,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects)
            .leftJoin(users, eq(projects.ownerId, users.id))
            .where(whereClause)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        return {
            data: await attachPrimaryTeams(data),
            pagination: {
                page,
                limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getProjectSidebar(currentUser?: AuthUser) {
        const filters: SQL[] = [];
        if (currentUser) {
            const accessFilter = sidebarProjectAccessWhere(currentUser);
            if (accessFilter) filters.push(accessFilter);
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        const projectRows = await db
            .select({
                id: projects.id,
                name: projects.name,
            })
            .from(projects)
            .where(whereClause)
            .orderBy(asc(projects.name));

        if (projectRows.length === 0) {
            return { data: [] };
        }

        const taskFilters: SQL[] = [
            inArray(tasks.projectId, projectRows.map((project) => project.id)),
            ne(tasks.status, "done"),
        ];
        const taskCountRows = await db
            .select({
                projectId: tasks.projectId,
                openTaskCount: count(),
            })
            .from(tasks)
            .where(and(...taskFilters))
            .groupBy(tasks.projectId);

        const openTaskCountByProjectId = new Map(
            taskCountRows.map((row) => [row.projectId, Number(row.openTaskCount)])
        );

        return {
            data: projectRows.map((project) => ({
                id: project.id,
                name: project.name,
                openTaskCount: openTaskCountByProjectId.get(project.id) ?? 0,
            })),
        };
    },

    async getProjectById(id: number, currentUser?: AuthUser) {
        const filters: SQL[] = [eq(projects.id, id)];
        if (currentUser) {
            const accessFilter = authorizationService.projectAccessWhere(currentUser);
            if (accessFilter) filters.push(accessFilter);
        }

        const [project] = await db
            .select({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                ownerId: projects.ownerId,
                ownerName: users.name,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects)
            .leftJoin(users, eq(projects.ownerId, users.id))
            .where(and(...filters));

        const [projectWithTeam] = await attachPrimaryTeams(project ? [project] : []);
        return projectWithTeam;
    },

    async updateProject(id: number, data: Partial<ProjectWriteData>) {
        const { teamId, ...projectData } = data;
        const now = new Date();
        const [updatedProject] = await db
            .update(projects)
            .set({ ...projectData, updatedAt: now })
            .where(eq(projects.id, id))
            .returning();

        if (teamId !== undefined) {
            const [existingAssignment] = await db
                .select({ id: projectTeams.id })
                .from(projectTeams)
                .where(and(eq(projectTeams.projectId, id), eq(projectTeams.teamId, teamId)));

            if (!existingAssignment) {
                await db.insert(projectTeams).values({
                    projectId: id,
                    teamId,
                    assignedAt: now,
                });
            }
        }

        return updatedProject ? this.getProjectById(updatedProject.id) : undefined;
    },

    async deleteProject(id: number) {
        const [deletedProject] = await db
            .delete(projects)
            .where(eq(projects.id, id))
            .returning();
        return deletedProject;
    },

    async getProjectTasks(
        projectId: number,
        options: { page?: number; limit?: number } = {},
        currentUser?: AuthUser
    ) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;
        const filters: SQL[] = [eq(tasks.projectId, projectId)];
        if (currentUser) {
            const accessFilter = authorizationService.taskAccessWhere(currentUser);
            if (accessFilter) filters.push(accessFilter);
        }
        const whereClause = and(...filters);

        const [{ total }] = await db
            .select({ total: count() })
            .from(tasks)
            .where(whereClause);

        const data = await db
            .select()
            .from(tasks)
            .where(whereClause)
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
