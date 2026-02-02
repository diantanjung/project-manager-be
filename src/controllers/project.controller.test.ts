import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../__tests__/helpers/mockRequest.js';
import { createProjectFixture, createProjectInput } from '../__tests__/fixtures/project.fixtures.js';

// Mock the services
vi.mock('../services/project.service.js', () => ({
    projectService: {
        createProject: vi.fn(),
        getAllProjects: vi.fn(),
        getProjectById: vi.fn(),
        updateProject: vi.fn(),
        deleteProject: vi.fn(),
        getProjectTasks: vi.fn(),
    },
}));

vi.mock('../services/projectTeam.service.js', () => ({
    projectTeamService: {
        getProjectTeams: vi.fn(),
    },
}));

// Import after mocking
import { projectController } from './project.controller.js';
import { projectService } from '../services/project.service.js';
import { projectTeamService } from '../services/projectTeam.service.js';

describe('projectController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createProject', () => {
        it('should return 201 and created project with ownerId from user', async () => {
            const mockProject = createProjectFixture();
            vi.mocked(projectService.createProject).mockResolvedValue(mockProject);

            const req = createMockRequest({
                body: createProjectInput,
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.createProject(req, res, next);

            expect(projectService.createProject).toHaveBeenCalledWith({
                ...createProjectInput,
                ownerId: 1,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockProject);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(projectService.createProject).mockRejectedValue(error);

            const req = createMockRequest({ body: createProjectInput });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.createProject(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllProjects', () => {
        it('should return paginated projects with filters', async () => {
            const mockResult = {
                data: [createProjectFixture()],
                pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
            };
            vi.mocked(projectService.getAllProjects).mockResolvedValue(mockResult);

            const req = createMockRequest({
                query: { page: '1', limit: '10', search: 'test', teamId: '1', sortBy: 'name', order: 'asc' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.getAllProjects(req, res, next);

            expect(projectService.getAllProjects).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: 'test',
                teamId: 1,
                sortBy: 'name',
                order: 'asc',
            });
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(projectService.getAllProjects).mockRejectedValue(error);

            const req = createMockRequest({ query: {} });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.getAllProjects(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getProjectById', () => {
        it('should return project when found', async () => {
            const mockProject = createProjectFixture({ id: 1 });
            vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.getProjectById(req, res, next);

            expect(projectService.getProjectById).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockProject);
        });

        it('should return 404 when project not found', async () => {
            vi.mocked(projectService.getProjectById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.getProjectById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
        });
    });

    describe('updateProject', () => {
        it('should return updated project on success', async () => {
            const mockProject = createProjectFixture({ id: 1, name: 'Updated Project' });
            vi.mocked(projectService.updateProject).mockResolvedValue(mockProject);

            const req = createMockRequest({
                params: { id: '1' },
                body: { name: 'Updated Project' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.updateProject(req, res, next);

            expect(projectService.updateProject).toHaveBeenCalledWith(1, { name: 'Updated Project' });
            expect(res.json).toHaveBeenCalledWith(mockProject);
        });

        it('should return 404 when project not found', async () => {
            vi.mocked(projectService.updateProject).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                params: { id: '999' },
                body: { name: 'Updated Project' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.updateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
        });
    });

    describe('deleteProject', () => {
        it('should return success message on delete', async () => {
            const mockProject = createProjectFixture({ id: 1 });
            vi.mocked(projectService.deleteProject).mockResolvedValue(mockProject);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.deleteProject(req, res, next);

            expect(projectService.deleteProject).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'Project deleted successfully' });
        });

        it('should return 404 when project not found', async () => {
            vi.mocked(projectService.deleteProject).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.deleteProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
        });
    });

    describe('getProjectTasks', () => {
        it('should return project tasks when project found', async () => {
            const mockProject = createProjectFixture({ id: 1 });
            const mockTaskResult = {
                data: [{ id: 1, title: 'Task 1' }],
                pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
            };
            vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
            vi.mocked(projectService.getProjectTasks).mockResolvedValue(mockTaskResult);

            const req = createMockRequest({
                params: { id: '1' },
                query: { page: '1', limit: '10' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.getProjectTasks(req, res, next);

            expect(projectService.getProjectById).toHaveBeenCalledWith(1);
            expect(projectService.getProjectTasks).toHaveBeenCalledWith(1, { page: 1, limit: 10 });
            expect(res.json).toHaveBeenCalledWith(mockTaskResult);
        });

        it('should return 404 when project not found', async () => {
            vi.mocked(projectService.getProjectById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.getProjectTasks(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
        });
    });

    describe('getProjectTeams', () => {
        it('should return project teams when project found', async () => {
            const mockProject = createProjectFixture({ id: 1 });
            const mockTeams = [{ id: 1, name: 'Team 1' }];
            vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
            vi.mocked(projectTeamService.getProjectTeams).mockResolvedValue(mockTeams);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.getProjectTeams(req, res, next);

            expect(projectService.getProjectById).toHaveBeenCalledWith(1);
            expect(projectTeamService.getProjectTeams).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockTeams);
        });

        it('should return 404 when project not found', async () => {
            vi.mocked(projectService.getProjectById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectController.getProjectTeams(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
        });
    });
});
