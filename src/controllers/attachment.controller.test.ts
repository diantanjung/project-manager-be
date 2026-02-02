import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../__tests__/helpers/mockRequest.js';
import { createAttachmentFixture, createAttachmentInput } from '../__tests__/fixtures/attachment.fixtures.js';

// Mock the attachment service
vi.mock('../services/attachment.service.js', () => ({
    attachmentService: {
        createAttachment: vi.fn(),
        getAttachmentsByTaskId: vi.fn(),
        getAttachmentById: vi.fn(),
        deleteAttachment: vi.fn(),
    },
}));

// Import after mocking
import { attachmentController } from './attachment.controller.js';
import { attachmentService } from '../services/attachment.service.js';

describe('attachmentController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createAttachment', () => {
        it('should return 201 and created attachment with uploaderId from user', async () => {
            const mockAttachment = createAttachmentFixture();
            vi.mocked(attachmentService.createAttachment).mockResolvedValue(mockAttachment);

            const req = createMockRequest({
                params: { taskId: '1' },
                body: createAttachmentInput,
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await attachmentController.createAttachment(req, res, next);

            expect(attachmentService.createAttachment).toHaveBeenCalledWith({
                ...createAttachmentInput,
                taskId: 1,
                uploaderId: 1,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockAttachment);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(attachmentService.createAttachment).mockRejectedValue(error);

            const req = createMockRequest({
                params: { taskId: '1' },
                body: createAttachmentInput,
            });
            const res = createMockResponse();
            const next = createMockNext();

            await attachmentController.createAttachment(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAttachmentsByTaskId', () => {
        it('should return attachments for a task', async () => {
            const mockAttachments = [createAttachmentFixture(), createAttachmentFixture({ id: 2 })];
            vi.mocked(attachmentService.getAttachmentsByTaskId).mockResolvedValue(mockAttachments);

            const req = createMockRequest({ params: { taskId: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await attachmentController.getAttachmentsByTaskId(req, res, next);

            expect(attachmentService.getAttachmentsByTaskId).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockAttachments);
        });

        it('should call next with error on failure', async () => {
            const error = new Error('Database error');
            vi.mocked(attachmentService.getAttachmentsByTaskId).mockRejectedValue(error);

            const req = createMockRequest({ params: { taskId: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await attachmentController.getAttachmentsByTaskId(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAttachmentById', () => {
        it('should return attachment when found', async () => {
            const mockAttachment = createAttachmentFixture({ id: 1 });
            vi.mocked(attachmentService.getAttachmentById).mockResolvedValue(mockAttachment);

            const req = createMockRequest({ params: { id: '1' } });
            const res = createMockResponse();
            const next = createMockNext();

            await attachmentController.getAttachmentById(req, res, next);

            expect(attachmentService.getAttachmentById).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockAttachment);
        });

        it('should return 404 when attachment not found', async () => {
            vi.mocked(attachmentService.getAttachmentById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await attachmentController.getAttachmentById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Attachment not found' });
        });
    });

    describe('deleteAttachment', () => {
        it('should return success message when user is uploader', async () => {
            const mockAttachment = createAttachmentFixture({ id: 1, uploaderId: 1 });
            vi.mocked(attachmentService.getAttachmentById).mockResolvedValue(mockAttachment);
            vi.mocked(attachmentService.deleteAttachment).mockResolvedValue(mockAttachment);

            const req = createMockRequest({
                params: { id: '1' },
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await attachmentController.deleteAttachment(req, res, next);

            expect(attachmentService.deleteAttachment).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'Attachment deleted successfully' });
        });

        it('should return 404 when attachment not found', async () => {
            vi.mocked(attachmentService.getAttachmentById).mockResolvedValue(undefined as never);

            const req = createMockRequest({ params: { id: '999' } });
            const res = createMockResponse();
            const next = createMockNext();

            await attachmentController.deleteAttachment(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Attachment not found' });
        });

        it('should return 403 when user is not uploader', async () => {
            const mockAttachment = createAttachmentFixture({ id: 1, uploaderId: 2 });
            vi.mocked(attachmentService.getAttachmentById).mockResolvedValue(mockAttachment);

            const req = createMockRequest({
                params: { id: '1' },
                user: { id: 1, email: 'test@example.com', role: 'member' },
            });
            const res = createMockResponse();
            const next = createMockNext();

            await attachmentController.deleteAttachment(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to delete this attachment' });
        });
    });
});
