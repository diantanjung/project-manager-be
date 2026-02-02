/**
 * Test fixtures for Comment entities.
 */

export interface CommentFixture {
    id: number;
    content: string;
    taskId: number;
    authorId: number;
    authorName: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

/**
 * Creates a comment fixture with default values that can be overridden.
 */
export const createCommentFixture = (overrides: Partial<CommentFixture> = {}): CommentFixture => ({
    id: 1,
    content: 'This is a test comment',
    taskId: 1,
    authorId: 1,
    authorName: 'Test Author',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
});

/**
 * Sample comments for list testing.
 */
export const sampleComments: CommentFixture[] = [
    createCommentFixture({ id: 1, content: 'First comment', authorId: 1 }),
    createCommentFixture({ id: 2, content: 'Second comment', authorId: 2 }),
    createCommentFixture({ id: 3, content: 'Third comment', authorId: 1 }),
];

/**
 * Input data for creating a new comment.
 */
export const createCommentInput = {
    content: 'New comment content',
};

/**
 * Input data for updating a comment.
 */
export const updateCommentInput = {
    content: 'Updated comment content',
};
