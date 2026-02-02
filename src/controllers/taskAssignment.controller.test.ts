import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../__tests__/helpers/mockRequest.js';
import { createTaskFixture } from '../__tests__/fixtures/task.fixtures.js';
import { createUserResponseFixture } from '../__tests__/fixtures/user.fixtures.js';

// Mock the services
vi.mock('../services/taskAssignment.service.js', () => ({
    taskAssignmentService: {
        assignUserToTask: vi.fn(),
        getTaskAssignments: vi.fn(),
        getAssignmentById: vi.fn(),
        removeAssignment: vi.fn(),
    },
}));

vi.mock('../services/task.service.js', () => ({
    taskService: {
        getTaskById: vi.fn(),
    },
}));

vi.mock('../services/user.service.js', () => ({
    userService: {
        getUserById: vi.fn(),
    },
}));

// Import after mocking
import { taskAssignmentController } from './taskAssignment.controller.js';
import { taskAssignmentService } from '../services/taskAssignment.service.js';
import { taskService } from '../services/task.service.js';
import { userService } from '../services/user.service.js';

describe('taskAssignmentController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('assignUserToTask', () => {
        it('should return 201 and assignment on success', async () => {
            const mockTask = createTaskFixture({ id: 1 });
            const mockUser = createUserResponseFixture({ id: 2 });
            const mockAssignment = { id: 1, taskId: 1, userId: 2 };

            vi.mocked(taskService.getTaskById).mockResolvedValue(mockTask);
            vi.mocked(userService.getUserById).mockResolvedValue(mockUser);
            vi.mocked(taskAssignmentService.assignUserToTask).mockResolvedValue({
                exists: false,
                data: mockAssignment,
            });

            const req = createMockRequest({
                body: { taskId: 1, userId: 2 },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskAssignmentController.assignUserToTask(req, res, next);

            expect(taskAssignmentService.assignUserToTask).toHaveBeenCalledWith(1, 2);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockAssignment);
        });

        it('should return 404 when task not found', async () => {
            vi.mocked(taskService.getTaskById).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                body: { taskId: 999, userId: 2 },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskAssignmentController.assignUserToTask(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
        });

        it('should return 404 when user not found', async () => {
            const mockTask = createTaskFixture({ id: 1 });
            vi.mocked(taskService.getTaskById).mockResolvedValue(mockTask);
            vi.mocked(userService.getUserById).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                body: { taskId: 1, userId: 999 },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskAssignmentController.assignUserToTask(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should return 400 when user already assigned', async () => {
            const mockTask = createTaskFixture({ id: 1 });
            const mockUser = createUserResponseFixture({ id: 2 });

            vi.mocked(taskService.getTaskById).mockResolvedValue(mockTask);
            vi.mocked(userService.getUserById).mockResolvedValue(mockUser);
            vi.mocked(taskAssignmentService.assignUserToTask).mockResolvedValue({
                exists: true,
            });

            const req = createMockRequest({
                body: { taskId: 1, userId: 2 },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskAssignmentController.assignUserToTask(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User already assigned to this task' });
        });
    });

    describe('getTaskAssignments', () => {
        it('should return assignments for a task', async () => {
            const mockTask = createTaskFixture({ id: 1 });
            const mockAssignments = [
                { id: 1, taskId: 1, userId: 1 },
                { id: 2, taskId: 1, userId: 2 },
            ];

            vi.mocked(taskService.getTaskById).mockResolvedValue(mockTask);
            vi.mocked(taskAssignmentService.getTaskAssignments).mockResolvedValue(mockAssignments);

            const req = createMockRequest({ params: { taskId: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await taskAssignmentController.getTaskAssignments(req, res, next);

            expect(taskAssignmentService.getTaskAssignments).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockAssignments);
        });

        it('should return 404 when task not found', async () => {
            vi.mocked(taskService.getTaskById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { taskId: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await taskAssignmentController.getTaskAssignments(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
        });
    });

    describe('removeAssignment', () => {
        it('should return success message on removal', async () => {
            const mockAssignment = { id: 1, taskId: 1, userId: 2 };
            vi.mocked(taskAssignmentService.getAssignmentById).mockResolvedValue(mockAssignment);
            vi.mocked(taskAssignmentService.removeAssignment).mockResolvedValue(mockAssignment);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await taskAssignmentController.removeAssignment(req, res, next);

            expect(taskAssignmentService.removeAssignment).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'Assignment removed successfully' });
        });

        it('should return 404 when assignment not found', async () => {
            vi.mocked(taskAssignmentService.getAssignmentById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await taskAssignmentController.removeAssignment(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Task assignment not found' });
        });
    });
});
