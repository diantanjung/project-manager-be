/**
 * Test fixtures for Team entities.
 */

export interface TeamFixture {
    id: number;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

/**
 * Creates a team fixture with default values that can be overridden.
 */
export const createTeamFixture = (overrides: Partial<TeamFixture> = {}): TeamFixture => ({
    id: 1,
    name: 'Test Team',
    description: 'A test team for unit testing',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
});

/**
 * Sample teams for list testing.
 */
export const sampleTeams: TeamFixture[] = [
    createTeamFixture({ id: 1, name: 'Engineering' }),
    createTeamFixture({ id: 2, name: 'Design' }),
    createTeamFixture({ id: 3, name: 'Product' }),
];

/**
 * Input data for creating a new team.
 */
export const createTeamInput = {
    name: 'New Team',
    description: 'A new team description',
};

/**
 * Input data for updating a team.
 */
export const updateTeamInput = {
    name: 'Updated Team Name',
    description: 'Updated description',
};
