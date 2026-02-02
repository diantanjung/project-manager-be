/**
 * Test fixtures for Attachment entities.
 */

export interface AttachmentFixture {
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    taskId: number;
    uploaderId: number;
    createdAt: Date | null;
}

/**
 * Creates an attachment fixture with default values that can be overridden.
 */
export const createAttachmentFixture = (overrides: Partial<AttachmentFixture> = {}): AttachmentFixture => ({
    id: 1,
    fileName: 'test-file.pdf',
    fileUrl: 'https://storage.example.com/attachments/test-file.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    taskId: 1,
    uploaderId: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
});

/**
 * Sample attachments for list testing.
 */
export const sampleAttachments: AttachmentFixture[] = [
    createAttachmentFixture({ id: 1, fileName: 'document.pdf', mimeType: 'application/pdf' }),
    createAttachmentFixture({ id: 2, fileName: 'image.png', mimeType: 'image/png', fileSize: 512000 }),
    createAttachmentFixture({ id: 3, fileName: 'spreadsheet.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
];

/**
 * Input data for creating a new attachment.
 */
export const createAttachmentInput = {
    fileName: 'new-file.pdf',
    fileUrl: 'https://storage.example.com/attachments/new-file.pdf',
    fileSize: 2048000,
    mimeType: 'application/pdf',
};
