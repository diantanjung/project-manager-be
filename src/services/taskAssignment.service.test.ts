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
import { taskAssignmentService } from './taskAssignment.service.js';
import { db } from '../db/index.js';

describe('taskAssignmentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('assignUserToTask', () => {
        it('should assign user to task successfully', async () => {
            const assignment = { id: 1, taskId: 1, userId: 2, assignedAt: new Date() };

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

            const result = await taskAssignmentService.assignUserToTask(1, 2);

            expect(result).toEqual({ exists: false, data: assignment });
        });

        it('should return exists true when user already assigned', async () => {
            const existingAssignment = { id: 1, taskId: 1, userId: 2, assignedAt: new Date() };

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([existingAssignment]),
                }),
            } as never);

            const result = await taskAssignmentService.assignUserToTask(1, 2);

            expect(result).toEqual({ exists: true, data: existingAssignment });
        });
    });

    describe('getTaskAssignments', () => {
        it('should return task assignments with user data', async () => {
            const assignments = [
                { id: 1, taskId: 1, userId: 1, userName: 'User 1', userEmail: 'user1@test.com', userAvatarUrl: null, assignedAt: new Date() },
                { id: 2, taskId: 1, userId: 2, userName: 'User 2', userEmail: 'user2@test.com', userAvatarUrl: null, assignedAt: new Date() },
            ];

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue(assignments),
                    }),
                }),
            } as never);

            const result = await taskAssignmentService.getTaskAssignments(1);

            expect(result).toEqual(assignments);
        });
    });

    describe('getAssignmentById', () => {
        it('should return assignment when found', async () => {
            const assignment = { id: 1, taskId: 1, userId: 2, assignedAt: new Date() };

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([assignment]),
                }),
            } as never);

            const result = await taskAssignmentService.getAssignmentById(1);

            expect(result).toEqual(assignment);
        });

        it('should return undefined when assignment not found', async () => {
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await taskAssignmentService.getAssignmentById(999);

            expect(result).toBeUndefined();
        });
    });

    describe('removeAssignment', () => {
        it('should remove assignment and return deleted data', async () => {
            const deletedAssignment = { id: 1, taskId: 1, userId: 2, assignedAt: new Date() };

            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([deletedAssignment]),
                }),
            } as never);

            const result = await taskAssignmentService.removeAssignment(1);

            expect(db.delete).toHaveBeenCalled();
            expect(result).toEqual(deletedAssignment);
        });

        it('should return undefined when assignment not found', async () => {
            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await taskAssignmentService.removeAssignment(999);

            expect(result).toBeUndefined();
        });
    });
});
