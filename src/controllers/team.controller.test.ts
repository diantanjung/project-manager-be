import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../__tests__/helpers/mockRequest.js';
import { createTeamFixture, createTeamInput } from '../__tests__/fixtures/team.fixtures.js';

// Mock the team service
vi.mock('../services/team.service.js', () => ({
    teamService: {
        createTeam: vi.fn(),
        getAllTeams: vi.fn(),
        getTeamById: vi.fn(),
        updateTeam: vi.fn(),
        deleteTeam: vi.fn(),
        getTeamMembers: vi.fn(),
        addTeamMember: vi.fn(),
        removeTeamMember: vi.fn(),
    },
}));

// Import after mocking
import { teamController } from './team.controller.js';
import { teamService } from '../services/team.service.js';

describe('teamController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createTeam', () => {
        it('should return 201 and created team on success', async () => {
            const mockTeam = createTeamFixture();
            vi.mocked(teamService.createTeam).mockResolvedValue(mockTeam);

            const req = createMockRequest({ body: createTeamInput });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.createTeam(req, res, next);

            expect(teamService.createTeam).toHaveBeenCalledWith(createTeamInput);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockTeam);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(teamService.createTeam).mockRejectedValue(error);

            const req = createMockRequest({ body: createTeamInput });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.createTeam(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllTeams', () => {
        it('should return paginated teams', async () => {
            const mockResult = {
                data: [createTeamFixture()],
                pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
            };
            vi.mocked(teamService.getAllTeams).mockResolvedValue(mockResult);

            const req = createMockRequest({ query: { page: '1', limit: '10' } });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.getAllTeams(req, res, next);

            expect(teamService.getAllTeams).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
            });
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(teamService.getAllTeams).mockRejectedValue(error);

            const req = createMockRequest({ query: {} });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.getAllTeams(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getTeamById', () => {
        it('should return team when found', async () => {
            const mockTeam = createTeamFixture({ id: 1 });
            vi.mocked(teamService.getTeamById).mockResolvedValue(mockTeam);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.getTeamById(req, res, next);

            expect(teamService.getTeamById).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockTeam);
        });

        it('should return 404 when team not found', async () => {
            vi.mocked(teamService.getTeamById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.getTeamById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
        });
    });

    describe('updateTeam', () => {
        it('should return updated team on success', async () => {
            const mockTeam = createTeamFixture({ id: 1, name: 'Updated Team' });
            vi.mocked(teamService.updateTeam).mockResolvedValue(mockTeam);

            const req = createMockRequest({
                params: { id: '1' },
                body: { name: 'Updated Team' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.updateTeam(req, res, next);

            expect(teamService.updateTeam).toHaveBeenCalledWith(1, { name: 'Updated Team' });
            expect(res.json).toHaveBeenCalledWith(mockTeam);
        });

        it('should return 404 when team not found', async () => {
            vi.mocked(teamService.updateTeam).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                params: { id: '999' },
                body: { name: 'Updated Team' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.updateTeam(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
        });
    });

    describe('deleteTeam', () => {
        it('should return success message on delete', async () => {
            const mockTeam = createTeamFixture({ id: 1 });
            vi.mocked(teamService.deleteTeam).mockResolvedValue(mockTeam);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.deleteTeam(req, res, next);

            expect(teamService.deleteTeam).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team deleted successfully' });
        });

        it('should return 404 when team not found', async () => {
            vi.mocked(teamService.deleteTeam).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.deleteTeam(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
        });
    });

    describe('getTeamMembers', () => {
        it('should return team members when team found', async () => {
            const mockTeam = createTeamFixture({ id: 1 });
            const mockMembers = [{ userId: 1, role: 'lead' }];
            vi.mocked(teamService.getTeamById).mockResolvedValue(mockTeam);
            vi.mocked(teamService.getTeamMembers).mockResolvedValue(mockMembers);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.getTeamMembers(req, res, next);

            expect(teamService.getTeamById).toHaveBeenCalledWith(1);
            expect(teamService.getTeamMembers).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockMembers);
        });

        it('should return 404 when team not found', async () => {
            vi.mocked(teamService.getTeamById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.getTeamMembers(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
        });
    });

    describe('addTeamMember', () => {
        it('should return 201 and member on success', async () => {
            const mockTeam = createTeamFixture({ id: 1 });
            const mockMember = { teamId: 1, userId: 2, role: 'member' };
            vi.mocked(teamService.getTeamById).mockResolvedValue(mockTeam);
            vi.mocked(teamService.addTeamMember).mockResolvedValue(mockMember);

            const req = createMockRequest({
                params: { id: '1' },
                body: { userId: 2, role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.addTeamMember(req, res, next);

            expect(teamService.addTeamMember).toHaveBeenCalledWith(1, 2, 'member');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockMember);
        });

        it('should return 404 when team not found', async () => {
            vi.mocked(teamService.getTeamById).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                params: { id: '999' },
                body: { userId: 2, role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.addTeamMember(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
        });

        it('should return 400 when user already a member', async () => {
            const mockTeam = createTeamFixture({ id: 1 });
            vi.mocked(teamService.getTeamById).mockResolvedValue(mockTeam);
            vi.mocked(teamService.addTeamMember).mockResolvedValue({ error: 'User is already a team member' });

            const req = createMockRequest({
                params: { id: '1' },
                body: { userId: 2, role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.addTeamMember(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User is already a team member' });
        });
    });

    describe('removeTeamMember', () => {
        it('should return success message on removal', async () => {
            vi.mocked(teamService.removeTeamMember).mockResolvedValue({ teamId: 1, userId: 2, role: 'member' });

            const req = createMockRequest({
                params: { id: '1', userId: '2' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.removeTeamMember(req, res, next);

            expect(teamService.removeTeamMember).toHaveBeenCalledWith(1, 2);
            expect(res.json).toHaveBeenCalledWith({ message: 'Member removed from team' });
        });

        it('should return 404 when member not found', async () => {
            vi.mocked(teamService.removeTeamMember).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                params: { id: '1', userId: '999' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await teamController.removeTeamMember(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Team member not found' });
        });
    });
});
