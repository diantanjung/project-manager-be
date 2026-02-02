import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../__tests__/helpers/mockRequest.js';
import { createProjectFixture } from '../__tests__/fixtures/project.fixtures.js';
import { createTeamFixture } from '../__tests__/fixtures/team.fixtures.js';

// Mock the services
vi.mock('../services/projectTeam.service.js', () => ({
    projectTeamService: {
        assignTeamToProject: vi.fn(),
        getProjectTeams: vi.fn(),
        getAssignmentById: vi.fn(),
        removeTeamFromProject: vi.fn(),
    },
}));

vi.mock('../services/project.service.js', () => ({
    projectService: {
        getProjectById: vi.fn(),
    },
}));

vi.mock('../services/team.service.js', () => ({
    teamService: {
        getTeamById: vi.fn(),
    },
}));

// Import after mocking
import { projectTeamController } from './projectTeam.controller.js';
import { projectTeamService } from '../services/projectTeam.service.js';
import { projectService } from '../services/project.service.js';
import { teamService } from '../services/team.service.js';

describe('projectTeamController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('assignTeamToProject', () => {
        it('should return 201 and assignment on success', async () => {
            const mockProject = createProjectFixture({ id: 1 });
            const mockTeam = createTeamFixture({ id: 2 });
            const mockAssignment = { id: 1, projectId: 1, teamId: 2, assignedAt: new Date() };

            vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
            vi.mocked(teamService.getTeamById).mockResolvedValue(mockTeam);
            vi.mocked(projectTeamService.assignTeamToProject).mockResolvedValue({
                exists: false,
                data: mockAssignment,
            });

            const req = createMockRequest({
                body: { projectId: 1, teamId: 2 },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await projectTeamController.assignTeamToProject(req, res, next);

            expect(projectTeamService.assignTeamToProject).toHaveBeenCalledWith(1, 2);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockAssignment);
        });

        it('should return 404 when project not found', async () => {
            vi.mocked(projectService.getProjectById).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                body: { projectId: 999, teamId: 2 },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await projectTeamController.assignTeamToProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
        });

        it('should return 404 when team not found', async () => {
            const mockProject = createProjectFixture({ id: 1 });
            vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
            vi.mocked(teamService.getTeamById).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                body: { projectId: 1, teamId: 999 },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await projectTeamController.assignTeamToProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
        });

        it('should return 400 when team already assigned', async () => {
            const mockProject = createProjectFixture({ id: 1 });
            const mockTeam = createTeamFixture({ id: 2 });

            vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
            vi.mocked(teamService.getTeamById).mockResolvedValue(mockTeam);
            vi.mocked(projectTeamService.assignTeamToProject).mockResolvedValue({
                exists: true,
                data: { id: 1, projectId: 1, teamId: 2, assignedAt: new Date() },
            });

            const req = createMockRequest({
                body: { projectId: 1, teamId: 2 },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await projectTeamController.assignTeamToProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team already assigned to this project' });
        });
    });

    describe('getProjectTeams', () => {
        it('should return teams for a project', async () => {
            const mockProject = createProjectFixture({ id: 1 });
            const mockTeams = [
                { id: 1, projectId: 1, teamId: 1, teamName: 'Team 1', teamDescription: 'Description 1', assignedAt: new Date() },
                { id: 2, projectId: 1, teamId: 2, teamName: 'Team 2', teamDescription: 'Description 2', assignedAt: new Date() },
            ];

            vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
            vi.mocked(projectTeamService.getProjectTeams).mockResolvedValue(mockTeams);

            const req = createMockRequest({ params: { projectId: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectTeamController.getProjectTeams(req, res, next);

            expect(projectTeamService.getProjectTeams).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockTeams);
        });

        it('should return 404 when project not found', async () => {
            vi.mocked(projectService.getProjectById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { projectId: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectTeamController.getProjectTeams(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
        });
    });

    describe('removeTeamFromProject', () => {
        it('should return success message on removal', async () => {
            const mockAssignment = { id: 1, projectId: 1, teamId: 2, assignedAt: new Date() };
            vi.mocked(projectTeamService.getAssignmentById).mockResolvedValue(mockAssignment);
            vi.mocked(projectTeamService.removeTeamFromProject).mockResolvedValue(mockAssignment);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectTeamController.removeTeamFromProject(req, res, next);

            expect(projectTeamService.removeTeamFromProject).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team removed from project successfully' });
        });

        it('should return 404 when assignment not found', async () => {
            vi.mocked(projectTeamService.getAssignmentById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await projectTeamController.removeTeamFromProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Project-team assignment not found' });
        });
    });
});
