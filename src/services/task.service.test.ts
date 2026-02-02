import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTaskFixture } from '../__tests__/fixtures/task.fixtures.js';

// Mock the database module
vi.mock('../db/index.js', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

// Import after mocking
import { taskService } from './task.service.js';
import { db } from '../db/index.js';

describe('taskService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createTask', () => {
        it('should create a new task', async () => {
            const input = { title: 'Test Task', description: 'A test task', projectId: 1, creatorId: 1 };
            const createdTask = createTaskFixture({ ...input });

            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([createdTask]),
                }),
            } as never);

            const result = await taskService.createTask(input);

            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(createdTask);
        });
    });

    describe('getAllTasks', () => {
        it('should return paginated tasks with project data', async () => {
            const tasks = [
                { id: 1, title: 'Task 1', projectId: 1, projectName: 'Project 1' },
                { id: 2, title: 'Task 2', projectId: 1, projectName: 'Project 1' },
            ];

            // Mock count query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([{ total: 2 }]),
                }),
            } as never);

            // Mock data query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockReturnValue({
                                limit: vi.fn().mockReturnValue({
                                    offset: vi.fn().mockResolvedValue(tasks),
                                }),
                            }),
                        }),
                    }),
                }),
            } as never);

            const result = await taskService.getAllTasks({ page: 1, limit: 10 });

            expect(result.data).toEqual(tasks);
            expect(result.pagination.totalItems).toBe(2);
        });

        it('should use default pagination options', async () => {
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([{ total: 0 }]),
                }),
            } as never);

            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockReturnValue({
                                limit: vi.fn().mockReturnValue({
                                    offset: vi.fn().mockResolvedValue([]),
                                }),
                            }),
                        }),
                    }),
                }),
            } as never);

            const result = await taskService.getAllTasks();

            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });
    });

    describe('getTaskById', () => {
        it('should return task with comments and attachments when found', async () => {
            const task = {
                id: 1,
                title: 'Task 1',
                projectId: 1,
                projectName: 'Project 1',
            };
            const comments = [{ id: 1, content: 'Comment 1', authorId: 1, authorName: 'User 1' }];
            const attachments = [{ id: 1, fileName: 'file.pdf', taskId: 1 }];

            // Mock task query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue([task]),
                    }),
                }),
            } as never);

            // Mock comments query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockResolvedValue(comments),
                        }),
                    }),
                }),
            } as never);

            // Mock attachments query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue(attachments),
                }),
            } as never);

            const result = await taskService.getTaskById(1);

            expect(result).toEqual({
                ...task,
                comments,
                attachments,
            });
        });

        it('should return null when task not found', async () => {
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue([]),
                    }),
                }),
            } as never);

            const result = await taskService.getTaskById(999);

            expect(result).toBeNull();
        });
    });

    describe('updateTask', () => {
        it('should update task and return updated data', async () => {
            const updatedTask = createTaskFixture({ id: 1, title: 'Updated Task' });

            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([updatedTask]),
                    }),
                }),
            } as never);

            const result = await taskService.updateTask(1, { title: 'Updated Task' });

            expect(db.update).toHaveBeenCalled();
            expect(result).toEqual(updatedTask);
        });
    });

    describe('updateTaskStatus', () => {
        it('should update task status', async () => {
            const updatedTask = createTaskFixture({ id: 1, status: 'in_progress' });

            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([updatedTask]),
                    }),
                }),
            } as never);

            const result = await taskService.updateTaskStatus(1, 'in_progress');

            expect(db.update).toHaveBeenCalled();
            expect(result).toEqual(updatedTask);
        });
    });

    describe('deleteTask', () => {
        it('should delete task and return deleted data', async () => {
            const deletedTask = createTaskFixture({ id: 1 });

            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([deletedTask]),
                }),
            } as never);

            const result = await taskService.deleteTask(1);

            expect(db.delete).toHaveBeenCalled();
            expect(result).toEqual(deletedTask);
        });

        it('should return undefined when task not found', async () => {
            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await taskService.deleteTask(999);

            expect(result).toBeUndefined();
        });
    });
});
