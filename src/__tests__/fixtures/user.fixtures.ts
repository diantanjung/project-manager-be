/**
 * Test fixtures for User entities.
 * Use these to create consistent test data across unit tests.
 */

export interface UserFixture {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'productOwner' | 'projectManager' | 'teamMember';
    avatarUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

/**
 * Creates a user fixture with default values that can be overridden.
 */
export const createUserFixture = (overrides: Partial<UserFixture> = {}): UserFixture => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword123',
    role: 'teamMember',
    avatarUrl: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
});

/**
 * Creates a user fixture without password (for API response testing).
 */
export const createUserResponseFixture = (overrides: Partial<Omit<UserFixture, 'password'>> = {}) => {
    const { password: _, ...user } = createUserFixture(overrides);
    return user;
};

/**
 * Sample users for list testing.
 */
export const sampleUsers: UserFixture[] = [
    createUserFixture({ id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' }),
    createUserFixture({ id: 2, name: 'Bob', email: 'bob@example.com', role: 'projectManager' }),
    createUserFixture({ id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'teamMember' }),
];

/**
 * Input data for creating a new user.
 */
export const createUserInput = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'password123',
    role: 'teamMember' as const,
};

/**
 * Input data for updating a user.
 */
export const updateUserInput = {
    name: 'Updated Name',
    email: 'updated@example.com',
};
