import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAttachmentFixture } from '../__tests__/fixtures/attachment.fixtures.js';

// Mock the database module
vi.mock('../db/index.js', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        delete: vi.fn(),
    },
}));

// Import after mocking
import { attachmentService } from './attachment.service.js';
import { db } from '../db/index.js';

describe('attachmentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createAttachment', () => {
        it('should create a new attachment', async () => {
            const input = { fileName: 'test.pdf', fileUrl: '/uploads/test.pdf', taskId: 1, uploadedBy: 1 };
            const createdAttachment = createAttachmentFixture({ ...input });

            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([createdAttachment]),
                }),
            } as never);

            const result = await attachmentService.createAttachment(input);

            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(createdAttachment);
        });
    });

    describe('getAttachmentsByTaskId', () => {
        it('should return attachments for a task', async () => {
            const attachments = [
                createAttachmentFixture({ id: 1, taskId: 1 }),
                createAttachmentFixture({ id: 2, taskId: 1 }),
            ];

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue(attachments),
                }),
            } as never);

            const result = await attachmentService.getAttachmentsByTaskId(1);

            expect(result).toEqual(attachments);
        });
    });

    describe('getAttachmentById', () => {
        it('should return attachment when found', async () => {
            const attachment = createAttachmentFixture({ id: 1 });

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([attachment]),
                }),
            } as never);

            const result = await attachmentService.getAttachmentById(1);

            expect(result).toEqual(attachment);
        });

        it('should return undefined when attachment not found', async () => {
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await attachmentService.getAttachmentById(999);

            expect(result).toBeUndefined();
        });
    });

    describe('deleteAttachment', () => {
        it('should delete attachment and return deleted data', async () => {
            const deletedAttachment = createAttachmentFixture({ id: 1 });

            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([deletedAttachment]),
                }),
            } as never);

            const result = await attachmentService.deleteAttachment(1);

            expect(db.delete).toHaveBeenCalled();
            expect(result).toEqual(deletedAttachment);
        });

        it('should return undefined when attachment not found', async () => {
            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
            } as never);

            const result = await attachmentService.deleteAttachment(999);

            expect(result).toBeUndefined();
        });
    });
});
