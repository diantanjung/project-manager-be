import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Mock the database module
vi.mock('../db/index.js', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        query: {
            users: {
                findFirst: vi.fn(),
            },
            refreshTokens: {
                findFirst: vi.fn(),
            },
        },
    },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashedpassword123'),
        compare: vi.fn(),
    },
}));

// Mock jwt
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn().mockReturnValue('mock-token'),
        verify: vi.fn(),
    },
}));

// Mock userService
vi.mock('./user.service.js', () => ({
    userService: {
        createUser: vi.fn(),
    },
}));

// Mock env
vi.mock('../config/env.js', () => ({
    env: {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
    },
}));

// Import after mocking
import { authService } from './auth.service.js';
import { db } from '../db/index.js';
import { userService } from './user.service.js';

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const userData = { email: 'test@example.com', password: 'password123', name: 'Test' };
            const createdUser = { id: 1, email: 'test@example.com', name: 'Test' };

            vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined);
            vi.mocked(userService.createUser).mockResolvedValue(createdUser as never);

            const result = await authService.register(userData);

            expect(db.query.users.findFirst).toHaveBeenCalled();
            expect(userService.createUser).toHaveBeenCalledWith(userData);
            expect(result).toEqual(createdUser);
        });

        it('should throw error when user already exists', async () => {
            const userData = { email: 'test@example.com', password: 'password123', name: 'Test' };
            const existingUser = { id: 1, email: 'test@example.com', name: 'Test', password: 'hashed', avatarUrl: null, role: 'teamMember' as const, createdAt: new Date(), updatedAt: new Date() };

            vi.mocked(db.query.users.findFirst).mockResolvedValue(existingUser);

            await expect(authService.register(userData)).rejects.toThrow('User already exists');
        });
    });

    describe('login', () => {
        it('should login successfully with correct credentials', async () => {
            const loginData = { email: 'test@example.com', password: 'password123' };
            const user = { id: 1, email: 'test@example.com', name: 'Test', password: 'hashedpassword', avatarUrl: null, role: 'teamMember' as const, createdAt: new Date(), updatedAt: new Date() };

            vi.mocked(db.query.users.findFirst).mockResolvedValue(user);
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockResolvedValue([{}]),
            } as never);

            const result = await authService.login(loginData);

            expect(db.query.users.findFirst).toHaveBeenCalled();
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user).not.toHaveProperty('password');
        });

        it('should throw error when user not found', async () => {
            const loginData = { email: 'test@example.com', password: 'password123' };

            vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined);

            await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
        });

        it('should throw error when password is incorrect', async () => {
            const loginData = { email: 'test@example.com', password: 'wrongpassword' };
            const user = { id: 1, email: 'test@example.com', name: 'Test', password: 'hashedpassword', avatarUrl: null, role: 'teamMember' as const, createdAt: new Date(), updatedAt: new Date() };

            vi.mocked(db.query.users.findFirst).mockResolvedValue(user);
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
        });
    });

    describe('generateAccessToken', () => {
        it('should generate an access token', () => {
            const token = authService.generateAccessToken(1, 'test@example.com');

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1, email: 'test@example.com', type: 'access' },
                'test-secret',
                { expiresIn: '1h' }
            );
            expect(token).toBe('mock-token');
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a refresh token', () => {
            const token = authService.generateRefreshToken(1, 'test@example.com');

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1, email: 'test@example.com', type: 'refresh' },
                'test-refresh-secret',
                { expiresIn: '7d' }
            );
            expect(token).toBe('mock-token');
        });
    });

    describe('refreshAccessToken', () => {
        it('should refresh access token successfully', async () => {
            const refreshToken = 'valid-refresh-token';
            const payload = { id: 1, email: 'test@example.com', type: 'refresh' };
            const user = { id: 1, email: 'test@example.com', name: 'Test', password: 'hashed', avatarUrl: null, role: 'teamMember' as const, createdAt: new Date(), updatedAt: new Date() };

            vi.mocked(jwt.verify).mockReturnValue(payload as never);
            vi.mocked(db.query.refreshTokens.findFirst).mockResolvedValue({ id: 1, token: 'hashed', userId: 1, createdAt: new Date(), expiresAt: new Date(), isRevoked: false });
            vi.mocked(db.query.users.findFirst).mockResolvedValue(user);
            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([{}]),
                }),
            } as never);
            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockResolvedValue([{}]),
            } as never);

            const result = await authService.refreshAccessToken(refreshToken);

            expect(jwt.verify).toHaveBeenCalledWith(refreshToken, 'test-refresh-secret');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });

        it('should throw error when refresh token is invalid', async () => {
            vi.mocked(jwt.verify).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(authService.refreshAccessToken('invalid-token')).rejects.toThrow('Invalid refresh token');
        });
    });

    describe('revokeRefreshToken', () => {
        it('should revoke a refresh token', async () => {
            const refreshToken = 'token-to-revoke';

            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([{ id: 1 }]),
                }),
            } as never);

            await authService.revokeRefreshToken(refreshToken);

            expect(db.update).toHaveBeenCalled();
        });
    });

    describe('revokeUserRefreshToken', () => {
        it('should revoke user refresh token successfully', async () => {
            const userId = 1;
            const refreshToken = 'user-token';

            vi.mocked(db.query.refreshTokens.findFirst).mockResolvedValue({ id: 1, token: 'hashed', userId: 1, createdAt: new Date(), expiresAt: new Date(), isRevoked: false });
            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([{ id: 1 }]),
                }),
            } as never);

            await authService.revokeUserRefreshToken(userId, refreshToken);

            expect(db.query.refreshTokens.findFirst).toHaveBeenCalled();
            expect(db.update).toHaveBeenCalled();
        });

        it('should throw error when token not found or does not belong to user', async () => {
            vi.mocked(db.query.refreshTokens.findFirst).mockResolvedValue(undefined);

            await expect(authService.revokeUserRefreshToken(1, 'invalid-token')).rejects.toThrow(
                'Refresh token not found or does not belong to user'
            );
        });
    });
});
