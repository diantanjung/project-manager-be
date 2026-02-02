/**
 * Test fixtures for Task entities.
 */

export interface TaskFixture {
    id: number;
    title: string;
    description: string | null;
    status: 'todo' | 'in_progress' | 'in_review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: Date | null;
    projectId: number;
    creatorId: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

/**
 * Creates a task fixture with default values that can be overridden.
 */
export const createTaskFixture = (overrides: Partial<TaskFixture> = {}): TaskFixture => ({
    id: 1,
    title: 'Test Task',
    description: 'A test task for unit testing',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date('2026-02-15T00:00:00Z'),
    projectId: 1,
    creatorId: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
});

/**
 * Sample tasks for list testing.
 */
export const sampleTasks: TaskFixture[] = [
    createTaskFixture({ id: 1, title: 'Implement login', status: 'done', priority: 'high' }),
    createTaskFixture({ id: 2, title: 'Design homepage', status: 'in_progress', priority: 'medium' }),
    createTaskFixture({ id: 3, title: 'Write tests', status: 'todo', priority: 'low' }),
];

/**
 * Input data for creating a new task.
 */
export const createTaskInput = {
    title: 'New Task',
    description: 'A new task description',
    status: 'todo' as const,
    priority: 'medium' as const,
    dueDate: '2026-02-28',
    projectId: 1,
};

/**
 * Input data for updating a task.
 */
export const updateTaskInput = {
    title: 'Updated Task Title',
    status: 'in_progress' as const,
    priority: 'high' as const,
};
