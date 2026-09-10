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

    const mockProjectRowsQuery = (rows: unknown[]) => {
        vi.mocked(db.select).mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                offset: vi.fn().mockResolvedValue(rows),
                            }),
                        }),
                    }),
                }),
            }),
        } as never);
    };

    const mockProjectByIdQuery = (rows: unknown[]) => {
        vi.mocked(db.select).mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue(rows),
                }),
            }),
        } as never);
    };

    const mockProjectTeamsQuery = (rows: unknown[]) => {
        vi.mocked(db.select).mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockResolvedValue(rows),
                    }),
                }),
            }),
        } as never);
    };

    const mockProjectSidebarRowsQuery = (rows: unknown[]) => {
        vi.mocked(db.select).mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValue(rows),
                }),
            }),
        } as never);
    };

    const mockTaskCountRowsQuery = (rows: unknown[]) => {
        vi.mocked(db.select).mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    groupBy: vi.fn().mockResolvedValue(rows),
                }),
            }),
        } as never);
    };

    describe('createProject', () => {
        it('should create a new project', async () => {
            const input = { name: 'Test Project', description: 'A test project', teamId: 1, ownerId: 1 };
            const createdProject = createProjectFixture({ ...input });

            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([createdProject]),
                }),
            } as never);
            vi.mocked(db.insert).mockReturnValueOnce({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([createdProject]),
                }),
            } as never);
            vi.mocked(db.insert).mockReturnValueOnce({
                values: vi.fn().mockResolvedValue(undefined),
            } as never);
            mockProjectByIdQuery([{
                id: createdProject.id,
                name: createdProject.name,
                description: createdProject.description,
                ownerId: createdProject.ownerId,
                ownerName: 'Owner 1',
                createdAt: createdProject.createdAt,
                updatedAt: createdProject.updatedAt,
            }]);
            mockProjectTeamsQuery([{ projectId: createdProject.id, teamId: 1, teamName: 'Team 1' }]);

            const result = await projectService.createProject(input);

            expect(db.insert).toHaveBeenCalled();
            expect(result).toMatchObject({
                ...createdProject,
                ownerName: 'Owner 1',
                teamId: 1,
                teamName: 'Team 1',
            });
        });
    });

    describe('getAllProjects', () => {
        it('should return paginated projects with joined data', async () => {
            const projects = [
                { id: 1, name: 'Project 1', ownerId: 1, ownerName: 'Owner 1' },
                { id: 2, name: 'Project 2', ownerId: 2, ownerName: 'Owner 2' },
            ];
            const expectedProjects = [
                { ...projects[0], teamId: 1, teamName: 'Team 1' },
                { ...projects[1], teamId: 2, teamName: 'Team 2' },
            ];

            // Mock count query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([{ total: 2 }]),
                }),
            } as never);

            // Mock data query
            mockProjectRowsQuery(projects);
            mockProjectTeamsQuery([
                { projectId: 1, teamId: 1, teamName: 'Team 1' },
                { projectId: 2, teamId: 2, teamName: 'Team 2' },
            ]);

            const result = await projectService.getAllProjects({ page: 1, limit: 10 });

            expect(result.data).toEqual(expectedProjects);
            expect(result.pagination.totalItems).toBe(2);
        });

        it('should use default pagination options', async () => {
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([{ total: 0 }]),
                }),
            } as never);

            mockProjectRowsQuery([]);

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
                ownerId: 1,
                ownerName: 'Owner 1',
            };
            const expectedProject = { ...project, teamId: 1, teamName: 'Team 1' };

            mockProjectByIdQuery([project]);
            mockProjectTeamsQuery([{ projectId: 1, teamId: 1, teamName: 'Team 1' }]);

            const result = await projectService.getProjectById(1);

            expect(result).toEqual(expectedProject);
        });

        it('should return undefined when project not found', async () => {
            mockProjectByIdQuery([]);

            const result = await projectService.getProjectById(999);

            expect(result).toBeUndefined();
        });
    });

    describe('getProjectSidebar', () => {
        it('should return sidebar projects with open task counts', async () => {
            mockProjectSidebarRowsQuery([
                { id: 1, name: 'Project 1' },
                { id: 2, name: 'Project 2' },
            ]);
            mockTaskCountRowsQuery([
                { projectId: 1, openTaskCount: 7 },
            ]);

            const result = await projectService.getProjectSidebar();

            expect(result).toEqual({
                data: [
                    { id: 1, name: 'Project 1', openTaskCount: 7 },
                    { id: 2, name: 'Project 2', openTaskCount: 0 },
                ],
            });
        });

        it('should skip task count query when no projects are visible', async () => {
            mockProjectSidebarRowsQuery([]);

            const result = await projectService.getProjectSidebar();

            expect(result).toEqual({ data: [] });
            expect(db.select).toHaveBeenCalledTimes(1);
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
            mockProjectByIdQuery([{
                id: updatedProject.id,
                name: updatedProject.name,
                description: updatedProject.description,
                ownerId: updatedProject.ownerId,
                ownerName: 'Owner 1',
                createdAt: updatedProject.createdAt,
                updatedAt: updatedProject.updatedAt,
            }]);
            mockProjectTeamsQuery([{ projectId: updatedProject.id, teamId: 1, teamName: 'Team 1' }]);

            const result = await projectService.updateProject(1, { name: 'Updated Project' });

            expect(db.update).toHaveBeenCalled();
            expect(result).toMatchObject({
                ...updatedProject,
                ownerName: 'Owner 1',
                teamId: 1,
                teamName: 'Team 1',
            });
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
