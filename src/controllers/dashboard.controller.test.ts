import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    createMockNext,
    createMockRequest,
    createMockResponse,
} from "../__tests__/helpers/mockRequest.js";

vi.mock("../services/dashboard.service.js", () => ({
    dashboardService: {
        getDashboard: vi.fn(),
    },
}));

import { dashboardController } from "./dashboard.controller.js";
import { dashboardService } from "../services/dashboard.service.js";

describe("dashboardController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns dashboard summary for authenticated users", async () => {
        const summary = {
            totalActiveProjects: 1,
            taskCountPerStatus: {
                backlog: 0,
                todo: 1,
                in_progress: 0,
                review: 0,
                done: 0,
            },
            activeProgress: {
                doing: 0,
                todo: 1,
                total: 1,
                ratio: 0,
                percentage: 0,
            },
            inReview: 0,
            dueSoon: 0,
            overdue: 0,
            overdueTaskCount: 0,
            workloadPerMember: {},
            recentlyUpdatedTasks: [],
            recentTasks: [],
            upcomingDeadlines: [],
            highPriorityTasks: [],
            latestUpdates: [],
        };
        vi.mocked(dashboardService.getDashboard).mockResolvedValue(summary);

        const req = createMockRequest({
            user: { id: 1, email: "dian@example.com", role: "teamMember" },
        });
        const res = createMockResponse();
        const next = createMockNext();

        await dashboardController.getDashboard(req, res, next);

        expect(dashboardService.getDashboard).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1 })
        );
        expect(res.json).toHaveBeenCalledWith(summary);
    });

    it("returns 401 when user is missing", async () => {
        const req = createMockRequest({ user: undefined });
        const res = createMockResponse();
        const next = createMockNext();

        await dashboardController.getDashboard(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Authentication required",
        });
        expect(dashboardService.getDashboard).not.toHaveBeenCalled();
    });

    it("passes service errors to error middleware", async () => {
        const error = new Error("Database error");
        vi.mocked(dashboardService.getDashboard).mockRejectedValue(error);

        const req = createMockRequest({
            user: { id: 1, email: "dian@example.com", role: "teamMember" },
        });
        const res = createMockResponse();
        const next = createMockNext();

        await dashboardController.getDashboard(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
