import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTeamFixture, createTeamInput, updateTeamInput } from '../__tests__/fixtures/team.fixtures.js';

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
import { teamService } from './team.service.js';
import { db } from '../db/index.js';

describe('teamService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createTeam', () => {
        it('should create a new team', async () => {
            const input = createTeamInput;
            const createdTeam = createTeamFixture({ ...input });

            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([createdTeam]),
                }),
            } as never);

            const result = await teamService.createTeam(input);

            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(createdTeam);
        });
    });

    describe('getAllTeams', () => {
        it('should return paginated teams', async () => {
            const teams = [createTeamFixture({ id: 1 }), createTeamFixture({ id: 2 })];

            // Mock count query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockResolvedValue([{ total: 2 }]),
            } as never);

            // Mock data query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                        offset: vi.fn().mockResolvedValue(teams),
                    }),
                }),
            } as never);

            const result = await teamService.getAllTeams({ page: 1, limit: 10 });

            expect(result.data).toEqual(teams);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                totalItems: 2,
                totalPages: 1,
            });
        });

        it('should use default pagination options', async () => {
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockResolvedValue([{ total: 0 }]),
            } as never);

            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                        offset: vi.fn().mockResolvedValue([]),
                    }),
                }),
            } as never);

            const result = await teamService.getAllTeams();

            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });
    });

    describe('getTeamById', () => {
        it('should return team when found', async () => {
            const team = createTeamFixture({ id: 1 });

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([team]),
                }),
            } as never);

            const result = await teamService.getTeamById(1);

            expect(result).toEqual(team);
        });

        it('should return undefined when team not found', async () => {
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await teamService.getTeamById(999);

            expect(result).toBeUndefined();
        });
    });

    describe('updateTeam', () => {
        it('should update team and return updated data', async () => {
            const updatedTeam = createTeamFixture({ id: 1, ...updateTeamInput });

            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([updatedTeam]),
                    }),
                }),
            } as never);

            const result = await teamService.updateTeam(1, updateTeamInput);

            expect(db.update).toHaveBeenCalled();
            expect(result).toEqual(updatedTeam);
        });
    });

    describe('deleteTeam', () => {
        it('should delete team and return deleted data', async () => {
            const deletedTeam = createTeamFixture({ id: 1 });

            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([deletedTeam]),
                }),
            } as never);

            const result = await teamService.deleteTeam(1);

            expect(db.delete).toHaveBeenCalled();
            expect(result).toEqual(deletedTeam);
        });

        it('should return undefined when team not found', async () => {
            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await teamService.deleteTeam(999);

            expect(result).toBeUndefined();
        });
    });

    describe('getTeamMembers', () => {
        it('should return team members with user data', async () => {
            const members = [
                { id: 1, userId: 1, userName: 'User 1', userEmail: 'user1@test.com', role: 'admin', joinedAt: new Date() },
                { id: 2, userId: 2, userName: 'User 2', userEmail: 'user2@test.com', role: 'member', joinedAt: new Date() },
            ];

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue(members),
                    }),
                }),
            } as never);

            const result = await teamService.getTeamMembers(1);

            expect(result).toEqual(members);
        });
    });

    describe('addTeamMember', () => {
        it('should add new team member', async () => {
            const newMember = { id: 1, teamId: 1, userId: 1, role: 'member', joinedAt: new Date() };

            // Mock check for existing member
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([newMember]),
                }),
            } as never);

            const result = await teamService.addTeamMember(1, 1);

            expect(result).toEqual(newMember);
        });

        it('should return error when user is already a member', async () => {
            const existingMember = { id: 1, teamId: 1, userId: 1, role: 'member' };

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([existingMember]),
                }),
            } as never);

            const result = await teamService.addTeamMember(1, 1);

            expect(result).toEqual({ error: 'User is already a member of this team' });
        });
    });

    describe('removeTeamMember', () => {
        it('should remove team member', async () => {
            const deletedMember = { id: 1, teamId: 1, userId: 1, role: 'member' };

            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([deletedMember]),
                }),
            } as never);

            const result = await teamService.removeTeamMember(1, 1);

            expect(db.delete).toHaveBeenCalled();
            expect(result).toEqual(deletedMember);
        });
    });
});
