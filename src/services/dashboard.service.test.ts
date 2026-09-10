import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../db/index.js", () => ({
    db: {
        select: vi.fn(),
    },
}));

import { db } from "../db/index.js";
import { dashboardService } from "./dashboard.service.js";

const dashboardTask = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    title: "Build dashboard",
    description: null,
    status: "todo",
    priority: "high",
    projectId: 1,
    projectName: "Project Alpha",
    creatorId: 1,
    assigneeId: 2,
    assigneeName: "Dian",
    assigneeAvatarUrl: "/avatar.png",
    dueDate: "2026-09-09",
    position: 1,
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
    updatedAt: new Date("2026-09-05T00:00:00.000Z"),
    ...overrides,
});

const mockCountQuery = (rows: unknown[]) => {
    vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(rows),
        }),
    } as never);
};

const mockGroupedQuery = (rows: unknown[]) => {
    vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue(rows),
            }),
        }),
    } as never);
};

const mockDashboardTaskListQuery = (rows: unknown[]) => {
    vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue(rows),
                        }),
                    }),
                }),
            }),
        }),
    } as never);
};

const mockLatestUpdatesQuery = (rows: unknown[]) => {
    vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue(rows),
                    }),
                }),
            }),
        }),
    } as never);
};

const mockDashboardQueries = () => {
    const recentlyUpdatedTasks = [
        dashboardTask({
            id: 2,
            title: "Review API",
            status: "in_progress",
            priority: "urgent",
            assigneeId: 3,
            assigneeName: "Ayu",
            assigneeAvatarUrl: null,
            dueDate: "2026-09-05",
            createdAt: new Date("2026-09-02T00:00:00.000Z"),
            updatedAt: new Date("2026-09-06T00:00:00.000Z"),
        }),
    ];
    const latestUpdates = [
        {
            id: 10,
            actorId: 2,
            entityType: "App\\Models\\Task",
            entityId: 1,
            action: "updated",
            before: { status: "todo" },
            after: { status: "in_progress" },
            ipAddress: "127.0.0.1",
            userAgent: "Vitest",
            createdAt: new Date("2026-09-06T09:00:00.000Z"),
            actorName: "Dian",
            actorEmail: "dian@example.com",
            actorRole: "teamMember",
            actorAvatarUrl: "/avatar.png",
        },
    ];

    mockCountQuery([{ total: 2 }]);
    mockGroupedQuery([
        { status: "todo", taskCount: 2 },
        { status: "in_progress", taskCount: 1 },
        { status: "review", taskCount: 1 },
        { status: "done", taskCount: 1 },
    ]);
    mockCountQuery([{ dueSoon: 2, overdue: 1 }]);
    mockGroupedQuery([
        { assigneeId: 2, taskCount: 3 },
        { assigneeId: 3, taskCount: 1 },
    ]);
    mockDashboardTaskListQuery(recentlyUpdatedTasks);
    mockDashboardTaskListQuery([dashboardTask({ id: 5 })]);
    mockDashboardTaskListQuery([dashboardTask({ id: 1 }), dashboardTask({ id: 2 })]);
    mockDashboardTaskListQuery([dashboardTask({ id: 2, priority: "urgent" }), dashboardTask({ id: 4 })]);
    mockLatestUpdatesQuery(latestUpdates);

    return { latestUpdates, recentlyUpdatedTasks };
};

describe("dashboardService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-09-06T10:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns dashboard metrics from aggregate queries and task lists limited by query", async () => {
        mockDashboardQueries();

        const summary = await dashboardService.getDashboard({
            id: 101,
            role: "admin",
        });

        expect(db.select).toHaveBeenCalledTimes(9);
        expect(summary.totalActiveProjects).toBe(2);
        expect(summary.taskCountPerStatus).toEqual({
            backlog: 0,
            todo: 2,
            in_progress: 1,
            review: 1,
            done: 1,
        });
        expect(summary.activeProgress).toEqual({
            doing: 1,
            todo: 2,
            total: 3,
            ratio: 0.3333,
            percentage: 33.33,
        });
        expect(summary.inReview).toBe(1);
        expect(summary.dueSoon).toBe(2);
        expect(summary.overdue).toBe(1);
        expect(summary.overdueTaskCount).toBe(1);
        expect(summary.workloadPerMember).toEqual({ "2": 3, "3": 1 });
        expect(summary.recentlyUpdatedTasks[0]).toMatchObject({
            id: 2,
            assignee: { id: 3, name: "Ayu", avatarUrl: null },
        });
        expect(summary.recentTasks.map((task) => task.id)).toEqual([5]);
        expect(summary.upcomingDeadlines.map((task) => task.id)).toEqual([1, 2]);
        expect(summary.highPriorityTasks.map((task) => task.id)).toEqual([2, 4]);
        expect(summary.latestUpdates).toEqual([
            {
                id: 10,
                actorId: 2,
                entityType: "App\\Models\\Task",
                entityId: 1,
                action: "updated",
                before: { status: "todo" },
                after: { status: "in_progress" },
                ipAddress: "127.0.0.1",
                userAgent: "Vitest",
                createdAt: new Date("2026-09-06T09:00:00.000Z"),
                actor: {
                    id: 2,
                    name: "Dian",
                    email: "dian@example.com",
                    role: "teamMember",
                    avatarUrl: "/avatar.png",
                },
            },
        ]);
    });

    it("returns zero active progress when there are no todo or in-progress tasks", async () => {
        mockCountQuery([{ total: 0 }]);
        mockGroupedQuery([]);
        mockCountQuery([{ dueSoon: 0, overdue: 0 }]);
        mockGroupedQuery([]);
        mockDashboardTaskListQuery([]);
        mockDashboardTaskListQuery([]);
        mockDashboardTaskListQuery([]);
        mockDashboardTaskListQuery([]);
        mockLatestUpdatesQuery([]);

        const summary = await dashboardService.getDashboard({
            id: 102,
            role: "admin",
        });

        expect(summary.activeProgress).toEqual({
            doing: 0,
            todo: 0,
            total: 0,
            ratio: 0,
            percentage: 0,
        });
    });

    it("caches dashboard responses per user for fifteen seconds", async () => {
        mockDashboardQueries();

        const currentUser = { id: 103, role: "admin" };
        const firstSummary = await dashboardService.getDashboard(currentUser);
        const secondSummary = await dashboardService.getDashboard(currentUser);

        expect(secondSummary).toBe(firstSummary);
        expect(db.select).toHaveBeenCalledTimes(9);

        vi.setSystemTime(new Date("2026-09-06T10:00:16.000Z"));
        mockDashboardQueries();

        await dashboardService.getDashboard(currentUser);

        expect(db.select).toHaveBeenCalledTimes(18);
    });
});
