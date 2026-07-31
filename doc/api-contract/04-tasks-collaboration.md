# Tasks, Comments, dan Attachments

> Bagian dari [API Contract](../api_contract.md).

## Tasks

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/tasks` | Scoped | MVP |
| `POST /api/v1/tasks` | ProjectManager+ scoped | MVP |
| `GET /api/v1/tasks/{task}` | Scoped | MVP |
| `PATCH /api/v1/tasks/{task}` | Scoped by field | MVP |
| `DELETE /api/v1/tasks/{task}` | ProjectManager+ scoped | MVP |
| `PATCH /api/v1/tasks/{task}/status` | Scoped assignee/member | MVP |
| `POST /api/v1/tasks/reorder` | ProjectManager+ scoped | P1 |
| `GET /api/v1/tasks/{task}/activity` | Scoped | P1 |
| `POST /api/v1/tasks/{task}/assignments` | ProjectManager+ scoped | MVP |
| `DELETE /api/v1/tasks/{task}/assignments/{user}` | ProjectManager+ scoped | MVP |

### `GET /api/v1/tasks`

Query:

| Field | Type | Notes |
| --- | --- | --- |
| `page` | integer | optional in board mode |
| `limit` | integer | max `100`; board mode may use larger internal cap if supported |
| `search` | string | title/description |
| `projectId` | integer | target |
| `project_id` | integer | legacy frontend alias |
| `status` | TaskStatus | list filter |
| `priority` | TaskPriority | list filter |
| `assigneeId` | integer | primary/target unified assignment |
| `dueBefore` | date | optional |
| `dueAfter` | date | optional |
| `sortBy` | string | `title`, `createdAt`, `updatedAt`, `dueDate`, `priority`, `position` |
| `order` | string | `asc`, `desc` |

Response: paginated `Task[]` for list mode, or `{ "data": Task[] }` for board mode if pagination omitted.

### `POST /api/v1/tasks`

```json
{
  "title": "Implement login",
  "description": "Access and refresh token flow",
  "status": "todo",
  "priority": "high",
  "projectId": 1,
  "assigneeId": 2,
  "dueDate": "2026-08-15",
  "position": 1,
  "estimateMinutes": 240
}
```

During migration Node.js may also accept `project_id`, `creator_id`, `assignee_id`, and `due_date`.

### `PATCH /api/v1/tasks/{task}`

Allowed body fields:

```json
{
  "title": "Updated title",
  "description": "Updated details",
  "status": "in_progress",
  "priority": "urgent",
  "assigneeId": 3,
  "dueDate": "2026-08-20",
  "position": 2
}
```

Authorization target:

- Assignee/member scoped can update status.
- Project manager scoped can update metadata and assignee.
- Product owner/admin can manage within allowed scope.

### `POST /api/v1/tasks/reorder`

P1 atomik reorder endpoint.

```json
{
  "projectId": 1,
  "moves": [
    {
      "taskId": 10,
      "status": "in_progress",
      "position": 0
    }
  ],
  "version": "optional-board-version"
}
```

Response `200`: `{ "data": { "tasks": [] } }`.

## Task Assignments

Target routes:

- `POST /api/v1/tasks/{task}/assignments`
- `DELETE /api/v1/tasks/{task}/assignments/{user}`

Legacy compatibility:

- `GET /api/v1/task-assignments/tasks/{taskId}/assignments`
- `POST /api/v1/task-assignments`
- `DELETE /api/v1/task-assignments/{assignmentId}`

Duplicate assignment: `409 Conflict`.

## Comments

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/tasks/{task}/comments` | Scoped | MVP |
| `POST /api/v1/tasks/{task}/comments` | Scoped | MVP |
| `PATCH /api/v1/comments/{comment}` | Author | MVP |
| `DELETE /api/v1/comments/{comment}` | Author | MVP |

### `POST /api/v1/tasks/{task}/comments`

```json
{
  "content": "Please review @Dian"
}
```

Mention format `@name` can create notification `mention`. Target P1 mention uses immutable user id.

## Attachments

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/tasks/{task}/attachments` | Scoped | MVP |
| `POST /api/v1/tasks/{task}/attachments` | Scoped | MVP |
| `GET /api/v1/attachments/{attachment}` | Scoped | MVP |
| `GET /api/v1/attachments/{attachment}/download` | Scoped | MVP |
| `DELETE /api/v1/attachments/{attachment}` | Uploader/ProjectManager+ scoped | MVP |

### `POST /api/v1/tasks/{task}/attachments`

Target upload request:

```text
file: <image/pdf/text/zip, size configurable>
```

Response `201`:

```json
{
  "data": {
    "id": 10,
    "taskId": 12,
    "uploaderId": 3,
    "fileName": "notes.txt",
    "originalName": "notes.txt",
    "mimeType": "text/plain",
    "fileSize": 14,
    "size": 14,
    "storageKey": "attachments/tasks/12/10-notes.txt",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

Legacy Node.js currently accepts metadata JSON:

```json
{
  "fileName": "spec.pdf",
  "fileUrl": "https://storage.example.com/spec.pdf",
  "fileSize": 204800,
  "mimeType": "application/pdf"
}
```

Target implementation should prefer multipart upload and Cloudflare R2/S3-compatible object storage. For MVP, database only needs to persist `storageKey`; storage provider, bucket, endpoint, and signed URL TTL are resolved from runtime environment variables. `downloadUrl` is generated at request time as a short-lived signed URL or backend proxy URL and should not be stored in the `attachments` table. API responses must not expose R2 access keys, secret keys, private bucket policy, or raw credentials.
