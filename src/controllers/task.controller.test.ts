import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../__tests__/helpers/mockRequest.js';
import { createTaskFixture, createTaskInput } from '../__tests__/fixtures/task.fixtures.js';

// Mock the task service
vi.mock('../services/task.service.js', () => ({
    taskService: {
        createTask: vi.fn(),
        getAllTasks: vi.fn(),
        getTaskById: vi.fn(),
        updateTask: vi.fn(),
        updateTaskStatus: vi.fn(),
        deleteTask: vi.fn(),
    },
}));

// Import after mocking
import { taskController } from './task.controller.js';
import { taskService } from '../services/task.service.js';

describe('taskController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createTask', () => {
        it('should return 201 and created task with creatorId from user', async () => {
            const mockTask = createTaskFixture();
            vi.mocked(taskService.createTask).mockResolvedValue(mockTask);

            const req = createMockRequest({
                body: createTaskInput,
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.createTask(req, res, next);

            expect(taskService.createTask).toHaveBeenCalledWith({
                ...createTaskInput,
                creatorId: 1,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockTask);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(taskService.createTask).mockRejectedValue(error);

            const req = createMockRequest({ body: createTaskInput });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.createTask(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllTasks', () => {
        it('should return paginated tasks with filters', async () => {
            const mockResult = {
                data: [createTaskFixture()],
                pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
            };
            vi.mocked(taskService.getAllTasks).mockResolvedValue(mockResult);

            const req = createMockRequest({
                query: {
                    page: '1',
                    limit: '10',
                    search: 'test',
                    projectId: '1',
                    status: 'todo',
                    priority: 'high',
                    assigneeId: '2',
                    sortBy: 'title',
                    order: 'asc',
                },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.getAllTasks(req, res, next);

            expect(taskService.getAllTasks).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: 'test',
                projectId: 1,
                status: 'todo',
                priority: 'high',
                assigneeId: 2,
                sortBy: 'title',
                order: 'asc',
            });
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(taskService.getAllTasks).mockRejectedValue(error);

            const req = createMockRequest({ query: {} });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.getAllTasks(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getTaskById', () => {
        it('should return task when found', async () => {
            const mockTask = createTaskFixture({ id: 1 });
            vi.mocked(taskService.getTaskById).mockResolvedValue(mockTask);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.getTaskById(req, res, next);

            expect(taskService.getTaskById).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockTask);
        });

        it('should return 404 when task not found', async () => {
            vi.mocked(taskService.getTaskById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.getTaskById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
        });
    });

    describe('updateTask', () => {
        it('should return updated task on success', async () => {
            const mockTask = createTaskFixture({ id: 1, title: 'Updated Task' });
            vi.mocked(taskService.updateTask).mockResolvedValue(mockTask);

            const req = createMockRequest({
                params: { id: '1' },
                body: { title: 'Updated Task' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.updateTask(req, res, next);

            expect(taskService.updateTask).toHaveBeenCalledWith(1, { title: 'Updated Task' });
            expect(res.json).toHaveBeenCalledWith(mockTask);
        });

        it('should return 404 when task not found', async () => {
            vi.mocked(taskService.updateTask).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                params: { id: '999' },
                body: { title: 'Updated Task' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.updateTask(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
        });
    });

    describe('updateTaskStatus', () => {
        it('should return updated task on success', async () => {
            const mockTask = createTaskFixture({ id: 1, status: 'in_progress' });
            vi.mocked(taskService.updateTaskStatus).mockResolvedValue(mockTask);

            const req = createMockRequest({
                params: { id: '1' },
                body: { status: 'in_progress' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.updateTaskStatus(req, res, next);

            expect(taskService.updateTaskStatus).toHaveBeenCalledWith(1, 'in_progress');
            expect(res.json).toHaveBeenCalledWith(mockTask);
        });

        it('should return 404 when task not found', async () => {
            vi.mocked(taskService.updateTaskStatus).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                params: { id: '999' },
                body: { status: 'in_progress' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.updateTaskStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
        });
    });

    describe('deleteTask', () => {
        it('should return success message on delete', async () => {
            const mockTask = createTaskFixture({ id: 1 });
            vi.mocked(taskService.deleteTask).mockResolvedValue(mockTask);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.deleteTask(req, res, next);

            expect(taskService.deleteTask).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
        });

        it('should return 404 when task not found', async () => {
            vi.mocked(taskService.deleteTask).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await taskController.deleteTask(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
        });
    });
});
