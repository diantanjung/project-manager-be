import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCommentFixture } from '../__tests__/fixtures/comment.fixtures.js';

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
import { commentService } from './comment.service.js';
import { db } from '../db/index.js';

describe('commentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createComment', () => {
        it('should create a new comment', async () => {
            const input = { content: 'Test comment', taskId: 1, authorId: 1 };
            const createdComment = createCommentFixture({ ...input });

            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([createdComment]),
                }),
            } as never);

            const result = await commentService.createComment(input);

            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(createdComment);
        });
    });

    describe('getCommentsByTaskId', () => {
        it('should return comments with author data', async () => {
            const comments = [
                { id: 1, content: 'Comment 1', taskId: 1, authorId: 1, authorName: 'User 1', createdAt: new Date(), updatedAt: new Date() },
                { id: 2, content: 'Comment 2', taskId: 1, authorId: 2, authorName: 'User 2', createdAt: new Date(), updatedAt: new Date() },
            ];

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockResolvedValue(comments),
                        }),
                    }),
                }),
            } as never);

            const result = await commentService.getCommentsByTaskId(1);

            expect(result).toEqual(comments);
        });
    });

    describe('getCommentById', () => {
        it('should return comment when found', async () => {
            const comment = createCommentFixture({ id: 1 });

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([comment]),
                }),
            } as never);

            const result = await commentService.getCommentById(1);

            expect(result).toEqual(comment);
        });

        it('should return undefined when comment not found', async () => {
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await commentService.getCommentById(999);

            expect(result).toBeUndefined();
        });
    });

    describe('updateComment', () => {
        it('should update comment content', async () => {
            const updatedComment = createCommentFixture({ id: 1, content: 'Updated content' });

            vi.mocked(db.update).mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([updatedComment]),
                    }),
                }),
            } as never);

            const result = await commentService.updateComment(1, 'Updated content');

            expect(db.update).toHaveBeenCalled();
            expect(result).toEqual(updatedComment);
        });
    });

    describe('deleteComment', () => {
        it('should delete comment and return deleted data', async () => {
            const deletedComment = createCommentFixture({ id: 1 });

            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([deletedComment]),
                }),
            } as never);

            const result = await commentService.deleteComment(1);

            expect(db.delete).toHaveBeenCalled();
            expect(result).toEqual(deletedComment);
        });

        it('should return undefined when comment not found', async () => {
            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await commentService.deleteComment(999);

            expect(result).toBeUndefined();
        });
    });
});
