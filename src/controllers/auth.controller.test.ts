import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../__tests__/helpers/mockRequest.js';
import { createUserResponseFixture } from '../__tests__/fixtures/user.fixtures.js';
import type { Request } from 'express';

// Mock the auth service
vi.mock('../services/auth.service.js', () => ({
    authService: {
        register: vi.fn(),
        login: vi.fn(),
        refreshAccessToken: vi.fn(),
        revokeUserRefreshToken: vi.fn(),
    },
}));

// Import after mocking
import { authController } from './auth.controller.js';
import { authService } from '../services/auth.service.js';

describe('authController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('register', () => {
        const registerInput = {
            name: 'New User',
            email: 'newuser@example.com',
            password: 'password123',
        };

        it('should return 201 and created user on success', async () => {
            const mockUser = createUserResponseFixture();
            vi.mocked(authService.register).mockResolvedValue(mockUser);

            const req = createMockRequest({ body: registerInput }) as unknown as Request;
            const res = createMockResponse();
            const next = createMockNext();

            await authController.register(req, res, next);

            expect(authService.register).toHaveBeenCalledWith(registerInput);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 409 when user already exists', async () => {
            vi.mocked(authService.register).mockRejectedValue(new Error('User already exists'));

            const req = createMockRequest({ body: registerInput }) as unknown as Request;
            const res = createMockResponse();
            const next = createMockNext();

            await authController.register(req, res, next);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
        });

        it('should call next with error on other failures', async () => {
            const error = new Error('Database error');
            vi.mocked(authService.register).mockRejectedValue(error);

            const req = createMockRequest({ body: registerInput }) as unknown as Request;
            const res = createMockResponse();
            const next = createMockNext();

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('login', () => {
        const loginInput = {
            email: 'user@example.com',
            password: 'password123',
        };

        it('should return user and accessToken, set cookie on success', async () => {
            const mockResult = {
                user: createUserResponseFixture(),
                accessToken: 'access-token-123',
                refreshToken: 'refresh-token-456',
            };
            vi.mocked(authService.login).mockResolvedValue(mockResult);

            const req = createMockRequest({ body: loginInput }) as unknown as Request;
            const res = createMockResponse();
            const next = createMockNext();

            await authController.login(req, res, next);

            expect(authService.login).toHaveBeenCalledWith(loginInput);
            expect(res.cookie).toHaveBeenCalledWith(
                'refreshToken',
                'refresh-token-456',
                expect.objectContaining({ httpOnly: true })
            );
            expect(res.json).toHaveBeenCalledWith({
                user: mockResult.user,
                accessToken: 'access-token-123',
            });
        });

        it('should return 401 on invalid credentials', async () => {
            vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

            const req = createMockRequest({ body: loginInput }) as unknown as Request;
            const res = createMockResponse();
            const next = createMockNext();

            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });

        it('should call next with error on other failures', async () => {
            const error = new Error('Database error');
            vi.mocked(authService.login).mockRejectedValue(error);

            const req = createMockRequest({ body: loginInput }) as unknown as Request;
            const res = createMockResponse();
            const next = createMockNext();

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('refreshToken', () => {
        it('should return new accessToken and set new cookie on success', async () => {
            const mockResult = {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            };
            vi.mocked(authService.refreshAccessToken).mockResolvedValue(mockResult);

            const req = createMockRequest({ cookies: { refreshToken: 'old-refresh-token' } }) as unknown as Request;
            const res = createMockResponse();
            const next = createMockNext();

            await authController.refreshToken(req, res, next);

            expect(authService.refreshAccessToken).toHaveBeenCalledWith('old-refresh-token');
            expect(res.cookie).toHaveBeenCalledWith(
                'refreshToken',
                'new-refresh-token',
                expect.objectContaining({ httpOnly: true })
            );
            expect(res.json).toHaveBeenCalledWith({ accessToken: 'new-access-token' });
        });

        it('should return 401 when refresh token not found in cookies', async () => {
            const req = createMockRequest({ cookies: {} }) as unknown as Request;
            const res = createMockResponse();
            const next = createMockNext();

            await authController.refreshToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token not found' });
        });

        it('should return 401 and clear cookie on invalid refresh token', async () => {
            vi.mocked(authService.refreshAccessToken).mockRejectedValue(
                new Error('Invalid or expired refresh token')
            );

            const req = createMockRequest({ cookies: { refreshToken: 'invalid-token' } }) as unknown as Request;
            const res = createMockResponse();
            const next = createMockNext();

            await authController.refreshToken(req, res, next);

            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired refresh token' });
        });
    });

    describe('logout', () => {
        it('should revoke token, clear cookie, and return 204', async () => {
            vi.mocked(authService.revokeUserRefreshToken).mockResolvedValue(undefined);

            const req = createMockRequest({
                user: { id: 1, email: 'test@example.com', role: 'member' },
                cookies: { refreshToken: 'refresh-token-to-revoke' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await authController.logout(req, res, next);

            expect(authService.revokeUserRefreshToken).toHaveBeenCalledWith(1, 'refresh-token-to-revoke');
            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should still clear cookie and return 204 when no refresh token in cookies', async () => {
            const req = createMockRequest({
                user: { id: 1, email: 'test@example.com', role: 'member' },
                cookies: {},
            });
            const res = createMockResponse();
            const next = createMockNext();

            await authController.logout(req, res, next);

            expect(authService.revokeUserRefreshToken).not.toHaveBeenCalled();
            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('should return 403 when token does not belong to user', async () => {
            vi.mocked(authService.revokeUserRefreshToken).mockRejectedValue(
                new Error('Refresh token not found or does not belong to user')
            );

            const req = createMockRequest({
                user: { id: 1, email: 'test@example.com', role: 'member' },
                cookies: { refreshToken: 'someone-elses-token' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await authController.logout(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token not found or does not belong to user' });
        });
    });
});
