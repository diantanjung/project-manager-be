import { vi } from 'vitest';

/**
 * Creates a mock database object for unit testing.
 * Use this to isolate service tests from the real database.
 */
export const createMockDb = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
});

/**
 * Helper to setup mock db.select() chain that returns data
 */
export const mockSelectReturns = (mockDb: ReturnType<typeof createMockDb>, data: unknown[]) => {
    mockDb.select.mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(data),
            leftJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            offset: vi.fn().mockResolvedValue(data),
                        }),
                    }),
                }),
            }),
        }),
    }));
    return mockDb;
};

/**
 * Helper to setup mock db.insert() chain that returns data
 */
export const mockInsertReturns = (mockDb: ReturnType<typeof createMockDb>, data: unknown[]) => {
    mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue(data),
        }),
    }));
    return mockDb;
};

/**
 * Helper to setup mock db.update() chain that returns data
 */
export const mockUpdateReturns = (mockDb: ReturnType<typeof createMockDb>, data: unknown[]) => {
    mockDb.update.mockImplementation(() => ({
        set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue(data),
            }),
        }),
    }));
    return mockDb;
};

/**
 * Helper to setup mock db.delete() chain that returns data
 */
export const mockDeleteReturns = (mockDb: ReturnType<typeof createMockDb>, data: unknown[]) => {
    mockDb.delete.mockImplementation(() => ({
        where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue(data),
        }),
    }));
    return mockDb;
};
