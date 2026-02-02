import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('../db/index.js', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        delete: vi.fn(),
    },
}));

// Import after mocking
import { projectTeamService } from './projectTeam.service.js';
import { db } from '../db/index.js';

describe('projectTeamService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('assignTeamToProject', () => {
        it('should assign team to project successfully', async () => {
            const assignment = { id: 1, projectId: 1, teamId: 2, assignedAt: new Date() };

            // Mock check for existing assignment
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([assignment]),
                }),
            } as never);

            const result = await projectTeamService.assignTeamToProject(1, 2);

            expect(result).toEqual({ exists: false, data: assignment });
        });

        it('should return exists true when team already assigned', async () => {
            const existingAssignment = { id: 1, projectId: 1, teamId: 2, assignedAt: new Date() };

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([existingAssignment]),
                }),
            } as never);

            const result = await projectTeamService.assignTeamToProject(1, 2);

            expect(result).toEqual({ exists: true, data: existingAssignment });
        });
    });

    describe('getProjectTeams', () => {
        it('should return project teams with team data', async () => {
            const teams = [
                { id: 1, projectId: 1, teamId: 1, teamName: 'Team 1', teamDescription: 'Desc 1', assignedAt: new Date() },
                { id: 2, projectId: 1, teamId: 2, teamName: 'Team 2', teamDescription: 'Desc 2', assignedAt: new Date() },
            ];

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue(teams),
                    }),
                }),
            } as never);

            const result = await projectTeamService.getProjectTeams(1);

            expect(result).toEqual(teams);
        });
    });

    describe('getAssignmentById', () => {
        it('should return assignment when found', async () => {
            const assignment = { id: 1, projectId: 1, teamId: 2, assignedAt: new Date() };

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([assignment]),
                }),
            } as never);

            const result = await projectTeamService.getAssignmentById(1);

            expect(result).toEqual(assignment);
        });

        it('should return undefined when assignment not found', async () => {
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await projectTeamService.getAssignmentById(999);

            expect(result).toBeUndefined();
        });
    });

    describe('removeTeamFromProject', () => {
        it('should remove team from project and return deleted data', async () => {
            const deletedAssignment = { id: 1, projectId: 1, teamId: 2, assignedAt: new Date() };

            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([deletedAssignment]),
                }),
            } as never);

            const result = await projectTeamService.removeTeamFromProject(1);

            expect(db.delete).toHaveBeenCalled();
            expect(result).toEqual(deletedAssignment);
        });

        it('should return undefined when assignment not found', async () => {
            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await projectTeamService.removeTeamFromProject(999);

            expect(result).toBeUndefined();
        });
    });
});
