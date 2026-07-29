# Teams dan Projects

> Bagian dari [API Contract](../api_contract.md).

## Teams

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/teams` | Bearer/scoped | MVP |
| `POST /api/v1/teams` | ProductOwner/Admin | MVP |
| `GET /api/v1/teams/{team}` | Scoped | MVP |
| `PATCH /api/v1/teams/{team}` | ProductOwner/Admin | MVP |
| `DELETE /api/v1/teams/{team}` | Admin | MVP |
| `GET /api/v1/teams/{team}/members` | Scoped | MVP |
| `POST /api/v1/teams/{team}/members` | ProjectManager+ scoped | MVP |
| `DELETE /api/v1/teams/{team}/members/{user}` | ProjectManager+ scoped | MVP |

### `GET /api/v1/teams`

Query: `page`, `limit`, `search`, `sortBy`, `order`.

Response: paginated `Team[]`.

### `POST /api/v1/teams/{team}/members`

Request accepts both target and legacy aliases:

```json
{
  "userId": 25,
  "user_id": 25,
  "role": "member"
}
```

Response `201`: `{ "data": TeamMember }`.

Duplicate membership: `409 Conflict`.

### `GET /api/v1/teams/{team}/members`

Response `200`:

```json
{
  "data": [
    {
      "id": 25,
      "userId": 25,
      "userName": "Jane Member",
      "userEmail": "jane@example.com",
      "role": "admin",
      "joinedAt": "2026-07-24T10:00:00.000Z"
    }
  ]
}
```

## Projects

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/projects` | Scoped | MVP |
| `GET /api/v1/projects/sidebar` | Scoped | MVP |
| `POST /api/v1/projects` | ProjectManager+ scoped | MVP |
| `GET /api/v1/projects/{project}` | Scoped | MVP |
| `PATCH /api/v1/projects/{project}` | ProjectManager+ scoped | MVP |
| `DELETE /api/v1/projects/{project}` | ProductOwner/Admin | MVP |
| `GET /api/v1/projects/{project}/tasks` | Scoped | MVP |
| `GET /api/v1/projects/{project}/teams` | Scoped | MVP |
| `GET /api/v1/projects/{project}/summary` | Scoped | MVP |
| `GET /api/v1/projects/{project}/activity` | ProjectManager+ scoped | P1 |
| `POST /api/v1/projects/{project}/teams` | ProjectManager+ scoped | MVP |
| `DELETE /api/v1/projects/{project}/teams/{team}` | ProjectManager+ scoped | MVP |

### `GET /api/v1/projects`

Query: `page`, `limit`, `search`, `status`, `teamId`, `ownerId`, `sortBy`, `order`.

Response: paginated `Project[]`.

### `POST /api/v1/projects`

```json
{
  "name": "Project Alpha",
  "description": "Internal delivery tracker",
  "teamId": 1,
  "ownerId": 2,
  "status": "planning",
  "startDate": "2026-08-01",
  "dueDate": "2026-09-30"
}
```

Legacy Node.js currently ignores supplied `ownerId` and uses authenticated user.

### `GET /api/v1/projects/sidebar`

Mengembalikan daftar project ringan untuk sidebar dan home redirect.

Response `200`:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Website redesign",
      "openTaskCount": 7
    }
  ]
}
```

Notes:

- Project di luar visibility scope user tidak boleh muncul.
- `openTaskCount` menghitung task visible dengan status selain `done`.
- Response diurutkan stabil, target default `name asc` atau `updatedAt desc` bila product ingin recent-first.

### `GET /api/v1/projects/{project}/summary`

Response `200`:

```json
{
  "data": {
    "projectId": 1,
    "taskCountPerStatus": {
      "backlog": 2,
      "todo": 4,
      "in_progress": 1,
      "review": 0,
      "done": 5
    },
    "totalTasks": 12,
    "teamCount": 2
  }
}
```

### Project-Team Assignment

Target routes:

- `POST /api/v1/projects/{project}/teams`
- `DELETE /api/v1/projects/{project}/teams/{team}`

Legacy compatibility:

- `POST /api/v1/project-teams`
- `DELETE /api/v1/project-teams/{assignmentId}`
- `GET /api/v1/project-teams/projects/{projectId}/teams`

Duplicate project-team assignment: `409 Conflict`.
