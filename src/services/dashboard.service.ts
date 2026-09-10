import { and, asc, count, desc, eq, exists, gte, inArray, ne, or, SQL, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import {
    activityLogs,
    projects,
    projectTeams,
    taskAssignments,
    tasks,
    teamMembers,
    users,
} from "../db/schema.js";
import { AuthUser } from "./authorization.service.js";

const taskStatuses = ["backlog", "todo", "in_progress", "review", "done"] as const;
type TaskStatus = (typeof taskStatuses)[number];

type DashboardTask = {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: "low" | "medium" | "high" | "urgent" | null;
    projectId: number;
    projectName: string | null;
    creatorId: number;
    assigneeId: number;
    assigneeName: string | null;
    assigneeAvatarUrl: string | null;
    assignee: {
        id: number;
        name: string | null;
        avatarUrl: string | null;
    };
    dueDate: string | null;
    position: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};

type DashboardActivityLog = {
    id: number;
    actorId: number | null;
    entityType: string;
    entityId: number;
    action: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | null;
    actor:
        | {
              id: number;
              name: string;
              email: string;
              role: string;
              avatarUrl: string | null;
          }
        | null;
};

type DashboardSummary = {
    totalActiveProjects: number;
    taskCountPerStatus: Record<TaskStatus, number>;
    activeProgress: {
        doing: number;
        todo: number;
        total: number;
        ratio: number;
        percentage: number;
    };
    inReview: number;
    dueSoon: number;
    overdue: number;
    overdueTaskCount: number;
    workloadPerMember: Record<string, number>;
    recentlyUpdatedTasks: DashboardTask[];
    recentTasks: DashboardTask[];
    upcomingDeadlines: DashboardTask[];
    highPriorityTasks: DashboardTask[];
    latestUpdates: DashboardActivityLog[];
};

const projectEntityTypes = ["App\\Models\\Project", "Project"];
const taskEntityTypes = ["App\\Models\\Task", "Task"];
const dashboardCacheTtlMs = 15_000;
const dashboardCache = new Map<number, { expiresAt: number; payload: DashboardSummary }>();

const toDateString = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
};

const round = (value: number, decimals: number) => {
    const multiplier = 10 ** decimals;
    return Math.round(value * multiplier) / multiplier;
};

const isAdmin = (user: AuthUser) => user.role === "admin";

const assignedTeamMembershipExists = (userId: number) =>
    exists(
        db
            .select({ id: projectTeams.id })
            .from(projectTeams)
            .innerJoin(teamMembers, eq(teamMembers.teamId, projectTeams.teamId))
            .where(and(eq(projectTeams.projectId, projects.id), eq(teamMembers.userId, userId)))
    );

const taskAssignmentExists = (userId: number) =>
    exists(
        db
            .select({ taskId: taskAssignments.taskId })
            .from(taskAssignments)
            .where(and(eq(taskAssignments.taskId, tasks.id), eq(taskAssignments.userId, userId)))
    );

const projectTaskAccessExists = (userId: number) =>
    exists(
        db
            .select({ id: tasks.id })
            .from(tasks)
            .where(
                and(
                    eq(tasks.projectId, projects.id),
                    or(eq(tasks.creatorId, userId), eq(tasks.assigneeId, userId), taskAssignmentExists(userId))
                )
            )
    );

const taskProjectAccessExists = (userId: number) =>
    exists(
        db
            .select({ id: projects.id })
            .from(projects)
            .where(
                and(
                    eq(projects.id, tasks.projectId),
                    or(eq(projects.ownerId, userId), assignedTeamMembershipExists(userId))
                )
            )
    );

const buildVisibleTaskWhere = (currentUser: AuthUser): SQL | undefined => {
    if (isAdmin(currentUser)) {
        return undefined;
    }

    return or(
        eq(tasks.creatorId, currentUser.id),
        eq(tasks.assigneeId, currentUser.id),
        taskAssignmentExists(currentUser.id),
        taskProjectAccessExists(currentUser.id)
    );
};

const buildVisibleProjectWhere = (currentUser: AuthUser): SQL | undefined => {
    if (isAdmin(currentUser)) {
        return undefined;
    }

    return or(
        eq(projects.ownerId, currentUser.id),
        assignedTeamMembershipExists(currentUser.id),
        projectTaskAccessExists(currentUser.id)
    );
};

const buildVisibleActivityWhere = (currentUser: AuthUser): SQL | undefined => {
    if (isAdmin(currentUser)) {
        return undefined;
    }

    const visibleProjectIds = db
        .select({ id: projects.id })
        .from(projects)
        .where(buildVisibleProjectWhere(currentUser));

    const visibleTaskIds = db
        .select({ id: tasks.id })
        .from(tasks)
        .where(buildVisibleTaskWhere(currentUser));

    return or(
        and(
            inArray(activityLogs.entityType, projectEntityTypes),
            inArray(activityLogs.entityId, visibleProjectIds)
        ),
        and(
            inArray(activityLogs.entityType, taskEntityTypes),
            inArray(activityLogs.entityId, visibleTaskIds)
        )
    );
};

const combineWhere = (...conditions: Array<SQL | undefined>): SQL | undefined => {
    const filters = conditions.filter((condition): condition is SQL => condition !== undefined);
    return filters.length > 0 ? and(...filters) : undefined;
};

const normalizeTask = (task: Omit<DashboardTask, "assignee">): DashboardTask => ({
    ...task,
    assignee: {
        id: task.assigneeId,
        name: task.assigneeName,
        avatarUrl: task.assigneeAvatarUrl,
    },
});

const selectDashboardTasks = async (
    whereClause: SQL | undefined,
    orderBy: SQL[]
): Promise<DashboardTask[]> => {
    const taskRows = await db
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
            assigneeName: users.name,
            assigneeAvatarUrl: users.avatarStorageKey,
            dueDate: tasks.dueDate,
            position: tasks.position,
            createdAt: tasks.createdAt,
            updatedAt: tasks.updatedAt,
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(5);

    return taskRows.map(normalizeTask);
};

const getCachedDashboard = (userId: number): DashboardSummary | undefined => {
    const cached = dashboardCache.get(userId);
    if (!cached || cached.expiresAt <= Date.now()) {
        dashboardCache.delete(userId);
        return undefined;
    }

    return cached.payload;
};

const putCachedDashboard = (userId: number, payload: DashboardSummary): DashboardSummary => {
    dashboardCache.set(userId, {
        expiresAt: Date.now() + dashboardCacheTtlMs,
        payload,
    });

    return payload;
};

export const dashboardService = {
    async getDashboard(currentUser: AuthUser) {
        const cached = getCachedDashboard(currentUser.id);
        if (cached) {
            return cached;
        }

        const today = new Date();
        const todayString = toDateString(today);
        const dueSoonEndString = toDateString(addDays(today, 7));
        const visibleTaskWhere = buildVisibleTaskWhere(currentUser);
        const visibleProjectWhere = buildVisibleProjectWhere(currentUser);

        const [[{ total: totalActiveProjects }], rawTaskCounts, [deadlineCounts], rawWorkload] =
            await Promise.all([
                db.select({ total: count() }).from(projects).where(visibleProjectWhere),
                db
                    .select({
                        status: tasks.status,
                        taskCount: count(),
                    })
                    .from(tasks)
                    .where(visibleTaskWhere)
                    .groupBy(tasks.status),
                db
                    .select({
                        dueSoon: sql<number>`cast(count(*) filter (where ${tasks.status} <> 'done' and ${tasks.dueDate} >= ${todayString} and ${tasks.dueDate} <= ${dueSoonEndString}) as int)`,
                        overdue: sql<number>`cast(count(*) filter (where ${tasks.status} <> 'done' and ${tasks.dueDate} < ${todayString}) as int)`,
                    })
                    .from(tasks)
                    .where(visibleTaskWhere),
                db
                    .select({
                        assigneeId: tasks.assigneeId,
                        taskCount: count(),
                    })
                    .from(tasks)
                    .where(visibleTaskWhere)
                    .groupBy(tasks.assigneeId),
            ]);

        const taskCountPerStatus = taskStatuses.reduce<Record<TaskStatus, number>>(
            (counts, status) => {
                counts[status] = 0;
                return counts;
            },
            {} as Record<TaskStatus, number>
        );

        for (const row of rawTaskCounts) {
            taskCountPerStatus[row.status] = Number(row.taskCount);
        }

        const workloadPerMember = rawWorkload.reduce<Record<string, number>>((workload, row) => {
            workload[String(row.assigneeId)] = Number(row.taskCount);
            return workload;
        }, {});

        const todo = taskCountPerStatus.todo;
        const doing = taskCountPerStatus.in_progress;
        const activeTotal = todo + doing;
        const activeRatio = activeTotal === 0 ? 0 : round(doing / activeTotal, 4);
        const notDoneTaskWhere = combineWhere(visibleTaskWhere, ne(tasks.status, "done"));
        const [
            recentlyUpdatedTasks,
            recentTasks,
            upcomingDeadlines,
            highPriorityTasks,
            latestUpdates,
        ] = await Promise.all([
            selectDashboardTasks(visibleTaskWhere, [desc(tasks.updatedAt)]),
            selectDashboardTasks(visibleTaskWhere, [desc(tasks.createdAt)]),
            selectDashboardTasks(
                combineWhere(notDoneTaskWhere, gte(tasks.dueDate, todayString)),
                [asc(tasks.dueDate), asc(tasks.id)]
            ),
            selectDashboardTasks(
                combineWhere(
                    notDoneTaskWhere,
                    or(eq(tasks.priority, "high"), eq(tasks.priority, "urgent"))
                ),
                [
                    sql`case ${tasks.priority} when 'urgent' then 0 when 'high' then 1 else 2 end`,
                    asc(tasks.dueDate),
                ]
            ),
            db
                .select({
                    id: activityLogs.id,
                    actorId: activityLogs.actorId,
                    entityType: activityLogs.entityType,
                    entityId: activityLogs.entityId,
                    action: activityLogs.action,
                    before: activityLogs.before,
                    after: activityLogs.after,
                    ipAddress: activityLogs.ipAddress,
                    userAgent: activityLogs.userAgent,
                    createdAt: activityLogs.createdAt,
                    actorName: users.name,
                    actorEmail: users.email,
                    actorRole: users.role,
                    actorAvatarUrl: users.avatarStorageKey,
                })
                .from(activityLogs)
                .leftJoin(users, eq(activityLogs.actorId, users.id))
                .where(buildVisibleActivityWhere(currentUser))
                .orderBy(desc(activityLogs.createdAt))
                .limit(5),
        ]);

        return putCachedDashboard(currentUser.id, {
            totalActiveProjects,
            taskCountPerStatus,
            activeProgress: {
                doing,
                todo,
                total: activeTotal,
                ratio: activeRatio,
                percentage: round(activeRatio * 100, 2),
            },
            inReview: taskCountPerStatus.review,
            dueSoon: deadlineCounts?.dueSoon ?? 0,
            overdue: deadlineCounts?.overdue ?? 0,
            overdueTaskCount: deadlineCounts?.overdue ?? 0,
            workloadPerMember,
            recentlyUpdatedTasks,
            recentTasks,
            upcomingDeadlines,
            highPriorityTasks,
            latestUpdates: latestUpdates.map(
                (activity): DashboardActivityLog => ({
                    id: activity.id,
                    actorId: activity.actorId,
                    entityType: activity.entityType,
                    entityId: activity.entityId,
                    action: activity.action,
                    before: activity.before,
                    after: activity.after,
                    ipAddress: activity.ipAddress,
                    userAgent: activity.userAgent,
                    createdAt: activity.createdAt,
                    actor:
                        activity.actorId === null || activity.actorName === null
                            ? null
                            : {
                                  id: activity.actorId,
                                  name: activity.actorName,
                                  email: activity.actorEmail ?? "",
                                  role: activity.actorRole ?? "teamMember",
                                  avatarUrl: activity.actorAvatarUrl,
                              },
                })
            ),
        });
    },
};
