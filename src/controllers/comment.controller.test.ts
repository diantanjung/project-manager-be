import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../__tests__/helpers/mockRequest.js';
import { createCommentFixture, createCommentInput } from '../__tests__/fixtures/comment.fixtures.js';

// Mock the comment service
vi.mock('../services/comment.service.js', () => ({
    commentService: {
        createComment: vi.fn(),
        getCommentsByTaskId: vi.fn(),
        getCommentById: vi.fn(),
        updateComment: vi.fn(),
        deleteComment: vi.fn(),
    },
}));

// Import after mocking
import { commentController } from './comment.controller.js';
import { commentService } from '../services/comment.service.js';

describe('commentController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createComment', () => {
        it('should return 201 and created comment with authorId from user', async () => {
            const mockComment = createCommentFixture();
            vi.mocked(commentService.createComment).mockResolvedValue(mockComment);

            const req = createMockRequest({
                params: { taskId: '1' },
                body: createCommentInput,
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.createComment(req, res, next);

            expect(commentService.createComment).toHaveBeenCalledWith({
                content: createCommentInput.content,
                taskId: 1,
                authorId: 1,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockComment);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(commentService.createComment).mockRejectedValue(error);

            const req = createMockRequest({
                params: { taskId: '1' },
                body: createCommentInput,
            });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.createComment(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getCommentsByTaskId', () => {
        it('should return comments for a task', async () => {
            const mockComments = [createCommentFixture(), createCommentFixture({ id: 2 })];
            vi.mocked(commentService.getCommentsByTaskId).mockResolvedValue(mockComments);

            const req = createMockRequest({ params: { taskId: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.getCommentsByTaskId(req, res, next);

            expect(commentService.getCommentsByTaskId).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockComments);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(commentService.getCommentsByTaskId).mockRejectedValue(error);

            const req = createMockRequest({ params: { taskId: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.getCommentsByTaskId(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateComment', () => {
        it('should return updated comment when user is author', async () => {
            const mockComment = createCommentFixture({ id: 1, authorId: 1 });
            const updatedComment = createCommentFixture({ id: 1, content: 'Updated content' });
            vi.mocked(commentService.getCommentById).mockResolvedValue(mockComment);
            vi.mocked(commentService.updateComment).mockResolvedValue(updatedComment);

            const req = createMockRequest({
                params: { id: '1' },
                body: { content: 'Updated content' },
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.updateComment(req, res, next);

            expect(commentService.updateComment).toHaveBeenCalledWith(1, 'Updated content');
            expect(res.json).toHaveBeenCalledWith(updatedComment);
        });

        it('should return 404 when comment not found', async () => {
            vi.mocked(commentService.getCommentById).mockResolvedValue(undefined as never);

            const req = createMockRequest({
                params: { id: '999' },
                body: { content: 'Updated content' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.updateComment(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' });
        });

        it('should return 403 when user is not author', async () => {
            const mockComment = createCommentFixture({ id: 1, authorId: 2 });
            vi.mocked(commentService.getCommentById).mockResolvedValue(mockComment);

            const req = createMockRequest({
                params: { id: '1' },
                body: { content: 'Updated content' },
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.updateComment(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to update this comment' });
        });
    });

    describe('deleteComment', () => {
        it('should return success message when user is author', async () => {
            const mockComment = createCommentFixture({ id: 1, authorId: 1 });
            vi.mocked(commentService.getCommentById).mockResolvedValue(mockComment);
            vi.mocked(commentService.deleteComment).mockResolvedValue(mockComment);

            const req = createMockRequest({
                params: { id: '1' },
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.deleteComment(req, res, next);

            expect(commentService.deleteComment).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'Comment deleted successfully' });
        });

        it('should return 404 when comment not found', async () => {
            vi.mocked(commentService.getCommentById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.deleteComment(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' });
        });

        it('should return 403 when user is not author', async () => {
            const mockComment = createCommentFixture({ id: 1, authorId: 2 });
            vi.mocked(commentService.getCommentById).mockResolvedValue(mockComment);

            const req = createMockRequest({
                params: { id: '1' },
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await commentController.deleteComment(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to delete this comment' });
        });
    });
});
