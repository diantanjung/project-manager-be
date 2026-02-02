import { vi } from 'vitest';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middlewares/auth.js';

/**
 * Creates a mock Express Request object for unit testing controllers.
 */
export const createMockRequest = (overrides: Partial<AuthRequest> = {}): AuthRequest => ({
    body: {},
    params: {},
    query: {},
    user: { id: 1, email: 'test@example.com', role: 'member' },
    cookies: {},
    headers: {},
    ...overrides,
} as AuthRequest);

/**
 * Creates a mock Express Response object with spies for testing.
 */
export const createMockResponse = (): Response & {
    _getStatusCode: () => number;
    _getData: () => unknown;
} => {
    let statusCode = 200;
    let data: unknown = null;

    const res = {
        status: vi.fn().mockImplementation((code: number) => {
            statusCode = code;
            return res;
        }),
        json: vi.fn().mockImplementation((jsonData: unknown) => {
            data = jsonData;
            return res;
        }),
        send: vi.fn().mockImplementation((sendData: unknown) => {
            data = sendData;
            return res;
        }),
        cookie: vi.fn().mockReturnThis(),
        clearCookie: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
        _getStatusCode: () => statusCode,
        _getData: () => data,
    };

    return res as unknown as Response & {
        _getStatusCode: () => number;
        _getData: () => unknown;
    };
};

/**
 * Creates a mock Express NextFunction for testing error handling.
 */
export const createMockNext = (): NextFunction & { mock: { calls: unknown[][] } } => {
    const next = vi.fn();
    return next as unknown as NextFunction & { mock: { calls: unknown[][] } };
};
