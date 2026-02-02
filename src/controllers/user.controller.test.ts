import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../__tests__/helpers/mockRequest.js';
import { createUserFixture, createUserInput, createUserResponseFixture } from '../__tests__/fixtures/user.fixtures.js';

// Mock the user service
vi.mock('../services/user.service.js', () => ({
    userService: {
        createUser: vi.fn(),
        getAllUsers: vi.fn(),
        getUserById: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        getUserTasks: vi.fn(),
    },
}));

// Import after mocking
import { userController } from './user.controller.js';
import { userService } from '../services/user.service.js';

describe('userController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createUser', () => {
        it('should return 201 and created user on success', async () => {
            const mockUser = createUserResponseFixture();
            vi.mocked(userService.createUser).mockResolvedValue(mockUser);

            const req = createMockRequest({ body: createUserInput });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.createUser(req, res, next);

            expect(userService.createUser).toHaveBeenCalledWith(createUserInput);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(userService.createUser).mockRejectedValue(error);

            const req = createMockRequest({ body: createUserInput });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getUserById', () => {
        it('should return 200 and user when found', async () => {
            const mockUser = createUserResponseFixture({ id: 1 });
            vi.mocked(userService.getUserById).mockResolvedValue(mockUser);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.getUserById(req, res, next);

            expect(userService.getUserById).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 404 when user not found', async () => {
            vi.mocked(userService.getUserById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.getUserById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('getAllUsers', () => {
        it('should return paginated users with default params', async () => {
            const mockResult = {
                data: [createUserResponseFixture()],
                pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
            };
            vi.mocked(userService.getAllUsers).mockResolvedValue(mockResult);

            const req = createMockRequest({ query: {} });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.getAllUsers(req, res, next);

            expect(userService.getAllUsers).toHaveBeenCalledWith({
                page: undefined,
                limit: undefined,
                search: undefined,
                sortBy: undefined,
                order: undefined,
            });
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should pass query parameters to service', async () => {
            const mockResult = {
                data: [],
                pagination: { page: 2, limit: 5, totalItems: 0, totalPages: 0 },
            };
            vi.mocked(userService.getAllUsers).mockResolvedValue(mockResult);

            const req = createMockRequest({
                query: { page: '2', limit: '5', search: 'test', sortBy: 'name', order: 'asc' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.getAllUsers(req, res, next);

            expect(userService.getAllUsers).toHaveBeenCalledWith({
                page: 2,
                limit: 5,
                search: 'test',
                sortBy: 'name',
                order: 'asc',
            });
        });
    });

    describe('updateUser', () => {
        it('should return updated user on success', async () => {
            const mockUser = createUserFixture({ id: 1, name: 'Updated Name' });
            vi.mocked(userService.updateUser).mockResolvedValue(mockUser);

            const req = createMockRequest({
                params: { id: '1' },
                body: { name: 'Updated Name' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.updateUser(req, res, next);

            expect(userService.updateUser).toHaveBeenCalledWith(1, { name: 'Updated Name' });
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 404 when user not found', async () => {
            vi.mocked(userService.updateUser).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                params: { id: '999' },
                body: { name: 'Updated Name' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.updateUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteUser', () => {
        it('should return success message on delete', async () => {
            const mockUser = createUserFixture({ id: 1 });
            vi.mocked(userService.deleteUser).mockResolvedValue(mockUser);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.deleteUser(req, res, next);

            expect(userService.deleteUser).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
        });

        it('should return 404 when user not found', async () => {
            vi.mocked(userService.deleteUser).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await userController.deleteUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });
});
