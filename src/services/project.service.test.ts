import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProjectFixture } from '../__tests__/fixtures/project.fixtures.js';

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
import { projectService } from './project.service.js';
import { db } from '../db/index.js';

describe('projectService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createProject', () => {
        it('should create a new project', async () => {
            const input = { name: 'Test Project', description: 'A test project', teamId: 1, ownerId: 1 };
            const createdProject = createProjectFixture({ ...input });

            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([createdProject]),
                }),
            } as never);

            const result = await projectService.createProject(input);

            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(createdProject);
        });
    });

    describe('getAllProjects', () => {
        it('should return paginated projects with joined data', async () => {
            const projects = [
                { id: 1, name: 'Project 1', teamId: 1, teamName: 'Team 1', ownerId: 1, ownerName: 'Owner 1' },
                { id: 2, name: 'Project 2', teamId: 2, teamName: 'Team 2', ownerId: 2, ownerName: 'Owner 2' },
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
                        leftJoin: vi.fn().mockReturnValue({
                            where: vi.fn().mockReturnValue({
                                orderBy: vi.fn().mockReturnValue({
                                    limit: vi.fn().mockReturnValue({
                                        offset: vi.fn().mockResolvedValue(projects),
                                    }),
                                }),
                            }),
                        }),
                    }),
                }),
            } as never);

            const result = await projectService.getAllProjects({ page: 1, limit: 10 });

            expect(result.data).toEqual(projects);
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
                }),
            } as never);

            const result = await projectService.getAllProjects();

            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });
    });

    describe('getProjectById', () => {
        it('should return project with joined data when found', async () => {
            const project = {
                id: 1,
                name: 'Project 1',
                teamId: 1,
                teamName: 'Team 1',
                ownerId: 1,
                ownerName: 'Owner 1',
            };

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        leftJoin: vi.fn().mockReturnValue({
                            where: vi.fn().mockResolvedValue([project]),
                        }),
                    }),
                }),
            } as never);

            const result = await projectService.getProjectById(1);

            expect(result).toEqual(project);
        });

        it('should return undefined when project not found', async () => {
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        leftJoin: vi.fn().mockReturnValue({
                            where: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            } as never);

            const result = await projectService.getProjectById(999);

            expect(result).toBeUndefined();
        });
    });

    describe('updateProject', () => {
        it('should update project and return updated data', async () => {
            const updatedProject = createProjectFixture({ id: 1, name: 'Updated Project' });

            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([updatedProject]),
                    }),
                }),
            } as never);

            const result = await projectService.updateProject(1, { name: 'Updated Project' });

            expect(db.update).toHaveBeenCalled();
            expect(result).toEqual(updatedProject);
        });
    });

    describe('deleteProject', () => {
        it('should delete project and return deleted data', async () => {
            const deletedProject = createProjectFixture({ id: 1 });

            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([deletedProject]),
                }),
            } as never);

            const result = await projectService.deleteProject(1);

            expect(db.delete).toHaveBeenCalled();
            expect(result).toEqual(deletedProject);
        });

        it('should return undefined when project not found', async () => {
            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await projectService.deleteProject(999);

            expect(result).toBeUndefined();
        });
    });

    describe('getProjectTasks', () => {
        it('should return paginated tasks for a project', async () => {
            const tasks = [
                { id: 1, title: 'Task 1', projectId: 1 },
                { id: 2, title: 'Task 2', projectId: 1 },
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
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                offset: vi.fn().mockResolvedValue(tasks),
                            }),
                        }),
                    }),
                }),
            } as never);

            const result = await projectService.getProjectTasks(1, { page: 1, limit: 10 });

            expect(result.data).toEqual(tasks);
            expect(result.pagination.totalItems).toBe(2);
        });
    });
});
