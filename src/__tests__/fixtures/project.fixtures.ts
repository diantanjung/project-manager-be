/**
 * Test fixtures for Project entities.
 */

export interface ProjectFixture {
    id: number;
    name: string;
    description: string | null;
    teamId: number;
    teamName: string | null;
    ownerId: number;
    ownerName: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

/**
 * Creates a project fixture with default values that can be overridden.
 */
export const createProjectFixture = (overrides: Partial<ProjectFixture> = {}): ProjectFixture => ({
    id: 1,
    name: 'Test Project',
    description: 'A test project for unit testing',
    teamId: 1,
    teamName: 'Test Team',
    ownerId: 1,
    ownerName: 'Test Owner',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
});

/**
 * Sample projects for list testing.
 */
export const sampleProjects: ProjectFixture[] = [
    createProjectFixture({ id: 1, name: 'Website Redesign', teamId: 1, teamName: 'Design Team' }),
    createProjectFixture({ id: 2, name: 'Mobile App', teamId: 2, teamName: 'Mobile Team' }),
    createProjectFixture({ id: 3, name: 'API Integration', teamId: 3, teamName: 'Backend Team' }),
];

/**
 * Input data for creating a new project.
 */
export const createProjectInput = {
    name: 'New Project',
    description: 'A new project description',
    status: 'planning' as const,
    startDate: '2026-02-01',
    endDate: '2026-06-30',
};

/**
 * Input data for updating a project.
 */
export const updateProjectInput = {
    name: 'Updated Project Name',
    status: 'active' as const,
};
