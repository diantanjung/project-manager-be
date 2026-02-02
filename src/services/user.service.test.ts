import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { createUserFixture, createUserInput } from '../__tests__/fixtures/user.fixtures.js';

// Mock the database module
vi.mock('../db/index.js', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashedpassword123'),
        compare: vi.fn(),
    },
}));

// Import after mocking
import { userService } from './user.service.js';
import { db } from '../db/index.js';

describe('userService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createUser', () => {
        it('should hash password and create a new user', async () => {
            const input = createUserInput;
            const createdUser = createUserFixture({ ...input, password: 'hashedpassword123' });

            // Setup mock chain
            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([createdUser]),
                }),
            } as never);

            const result = await userService.createUser(input);

            // Assert password was hashed
            expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 10);

            // Assert db.insert was called
            expect(db.insert).toHaveBeenCalled();

            // Assert password is not returned
            expect(result).not.toHaveProperty('password');
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name', input.name);
            expect(result).toHaveProperty('email', input.email);
        });
    });

    describe('getUserById', () => {
        it('should return user when found', async () => {
            const user = createUserFixture({ id: 1 });
            const { password: _, ...userWithoutPassword } = user;

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([userWithoutPassword]),
                }),
            } as never);

            const result = await userService.getUserById(1);

            expect(result).toEqual(userWithoutPassword);
        });

        it('should return undefined when user not found', async () => {
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await userService.getUserById(999);

            expect(result).toBeUndefined();
        });
    });

    describe('updateUser', () => {
        it('should update user without rehashing if password not provided', async () => {
            const updatedUser = createUserFixture({ id: 1, name: 'Updated Name' });

            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([updatedUser]),
                    }),
                }),
            } as never);

            const result = await userService.updateUser(1, { name: 'Updated Name' });

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(result).toEqual(updatedUser);
        });

        it('should hash password when password is provided', async () => {
            const updatedUser = createUserFixture({ id: 1 });

            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([updatedUser]),
                    }),
                }),
            } as never);

            await userService.updateUser(1, { password: 'newpassword' });

            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
        });
    });

    describe('deleteUser', () => {
        it('should delete user and return deleted user', async () => {
            const deletedUser = createUserFixture({ id: 1 });

            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([deletedUser]),
                }),
            } as never);

            const result = await userService.deleteUser(1);

            expect(db.delete).toHaveBeenCalled();
            expect(result).toEqual(deletedUser);
        });

        it('should return undefined when user not found', async () => {
            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await userService.deleteUser(999);

            expect(result).toBeUndefined();
        });
    });
});
