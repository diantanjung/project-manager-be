# API Contract — Project Manager Backend

> Contract ini mendokumentasikan perilaku implementasi pada 9 Juli 2026, bukan rancangan ideal.  
> Base URL lokal: `http://localhost:<PORT>`  
> API prefix: `/api`

## 1. Konvensi Umum

### Authentication

Semua endpoint `/api` selain register, login, dan refresh memerlukan:

```http
Authorization: Bearer <accessToken>
```

Refresh token tidak dikirim dalam JSON. Server menyimpannya sebagai cookie:

```http
Set-Cookie: refreshToken=<token>; HttpOnly; SameSite=Strict; Path=/
```

Client browser harus mengaktifkan credentials. Cookie memakai `Secure` pada production.

### Content type

- Request/response utama: `application/json`
- Upload avatar: `multipart/form-data`
- Timestamp: string ISO 8601 atau `null`
- `dueDate`: string tanggal PostgreSQL, lazimnya `YYYY-MM-DD`
- ID pada path berupa integer positif secara semantik, tetapi implementasi umumnya hanya memvalidasi sebagai string lalu menjalankan `Number(...)`.

### Enum

```text
UserRole         = admin | productOwner | projectManager | teamMember
TeamMemberRole   = owner | admin | member
TaskStatus       = backlog | todo | in_progress | review | done
TaskPriority     = low | medium | high | urgent
NotificationType = task_assigned | mention | system_alert
```

### Pagination

Response list berhalaman:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

Default `page=1`, `limit=10`. Bila tersedia, `limit` harus 1–100.

### Error

Error umum:

```json
{ "message": "Error message" }
```

Validation error:

```json
{
  "message": "Combined validation messages",
  "errors": [
    { "code": "too_small", "path": ["body", "name"], "message": "..." }
  ]
}
```

| HTTP | Arti |
|---|---|
| 400 | Request/validation salah atau assignment duplikat |
| 401 | Access/refresh token tidak ada atau tidak valid |
| 403 | Role tidak cukup atau bukan pemilik resource |
| 404 | Resource tidak ditemukan |
| 409 | Email/user sudah ada |
| 500 | Error yang tidak dipetakan |

## 2. Model Response

Field timestamp dapat bernilai `null` karena default database tidak dideklarasikan `notNull`.

```ts
type User = {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null; // tidak muncul pada seluruh endpoint user
  role: UserRole;
  createdAt: string | null;
  updatedAt: string | null;
};

type Team = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type Project = {
  id: number;
  name: string;
  description: string | null;
  teamId: number;
  ownerId: number;
  createdAt: string | null;
  updatedAt: string | null;
};

type ProjectView = Project & {
  teamName: string | null;
  ownerName: string | null;
};

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  projectId: number;
  creatorId: number;
  assigneeId: number;
  dueDate: string | null;
  position: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type TaskView = Task & {
  projectName: string | null;
  assigneeName: string | null;
  assigneeAvatarUrl: string | null;
};

type Comment = {
  id: number;
  content: string;
  taskId: number;
  authorId: number;
  createdAt: string | null;
  updatedAt: string | null;
};

type Attachment = {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  taskId: number;
  uploaderId: number;
  createdAt: string | null;
};
```

Catatan: response create/update biasanya merupakan row database langsung; response get/list tertentu mempunyai field join tambahan.

## 3. Matriks RBAC

`TM` = teamMember, `PM` = projectManager, `PO` = productOwner, `A` = admin.

| Operasi | TM | PM | PO | A |
|---|:---:|:---:|:---:|:---:|
| Read user/team/project/task | ✓ | ✓ | ✓ | ✓ |
| Update profil sendiri | ✓ | ✓ | ✓ | ✓ |
| Update user lain |  | ✓ | ✓ | ✓ |
| Create/delete user |  |  |  | ✓ |
| Create/update team |  |  | ✓ | ✓ |
| Delete team |  |  |  | ✓ |
| Manage team member |  | ✓ | ✓ | ✓ |
| Create/update project |  | ✓ | ✓ | ✓ |
| Delete project |  |  | ✓ | ✓ |
| Create/delete task |  | ✓ | ✓ | ✓ |
| Update task/status | ✓ | ✓ | ✓ | ✓ |
| Manage additional task assignee |  | ✓ | ✓ | ✓ |
| Create/read comment & attachment | ✓ | ✓ | ✓ | ✓ |
| Update/delete own comment; delete own attachment | ✓ | ✓ | ✓ | ✓ |

## 4. Auth

### `POST /api/auth/register`

Public. Membuat user `teamMember`.

```json
{
  "name": "Dian Tanjung",
  "email": "dian@example.com",
  "password": "secret123"
}
```

- `name`: min 2
- `email`: valid email
- `password`: min 6
- Response `201`: `User`
- Error `409`: `{ "message": "User already exists" }`

### `POST /api/auth/login`

Public.

```json
{ "email": "dian@example.com", "password": "secret123" }
```

Response `200` dan refresh cookie:

```json
{
  "user": {
    "id": 1,
    "name": "Dian Tanjung",
    "email": "dian@example.com",
    "avatarUrl": null,
    "role": "teamMember",
    "createdAt": "2026-07-09T00:00:00.000Z",
    "updatedAt": "2026-07-09T00:00:00.000Z"
  },
  "accessToken": "<jwt>"
}
```

Error `401`: `{ "message": "Invalid credentials" }`.

### `POST /api/auth/refresh`

Public, tetapi wajib membawa cookie `refreshToken`. Melakukan token rotation.

Response `200`:

```json
{ "accessToken": "<new-jwt>" }
```

Error `401` bila cookie/token tidak ada, invalid, expired, revoked, atau user sudah tidak ada.

### `POST /api/auth/logout`

Authenticated. Cookie refresh token opsional; bila ada, token dicabut. Response `204` tanpa body. Dapat menghasilkan `403` bila cookie ada tetapi bukan milik user.

## 5. Users

### `GET /api/users`

Authenticated.

Query:

| Field | Type | Default | Catatan |
|---|---|---:|---|
| `page` | integer | 1 | min 1 |
| `limit` | integer | 10 | 1–100 |
| `search` | string | — | mencari name/email, case-insensitive |
| `sortBy` | enum | `createdAt` | `name`, `email`, `role`, `createdAt`, `updatedAt` |
| `order` | enum | `desc` | `asc`, `desc` |

Response `200`: paginated user tanpa password dan tanpa `avatarUrl`.

> Controller membaca query `role`, tetapi schema saat ini tidak meneruskannya. Karena itu `role` bukan bagian contract efektif.

### `POST /api/users`

Admin.

```json
{ "name": "User Name", "email": "user@example.com", "password": "secret123" }
```

Response `201`: `User`. Role selalu default `teamMember`. Error `409` bila email dipakai.

### `GET /api/users/:id`

Authenticated. Response `200`: user tanpa password/avatar; `404` bila tidak ada.

### `PATCH /api/users/:id`

Self atau minimal project manager.

```json
{
  "name": "New Name",
  "email": "new@example.com",
  "password": "newsecret",
  "avatarUrl": "/uploads/avatar-123.png"
}
```

Semua field opsional. Password kosong diabaikan; non-kosong min 6. Response `200` merupakan row hasil update.

> Temuan keamanan: implementasi saat ini berpotensi menyertakan field `password` berupa hash pada response update.

### `DELETE /api/users/:id`

Admin. Response `200`:

```json
{ "message": "User deleted successfully" }
```

### `GET /api/users/:id/tasks`

Authenticated. Query `page`, `limit`. Mengembalikan task ketika user adalah creator **atau primary assignee**; additional assignment tidak disertakan. Response paginated task.

## 6. Teams

### `GET /api/teams`

Authenticated. Query `page`, `limit`. Response `200`: paginated `Team`.

### `POST /api/teams`

Minimal product owner.

```json
{ "name": "Backend", "description": "Backend engineering team" }
```

`name` min 2. Response `201`: `Team`.

### `GET /api/teams/:id`

Authenticated. Response `200`: `Team`; `404` bila tidak ada.

### `PATCH /api/teams/:id`

Minimal product owner. Body opsional: `name` (min 2), `description`. Response `200`: `Team`.

### `DELETE /api/teams/:id`

Admin. Response `200`:

```json
{ "message": "Team deleted successfully" }
```

### `GET /api/teams/:id/members`

Authenticated. Response `200`:

```json
[
  {
    "id": 1,
    "userId": 2,
    "userName": "Member",
    "userEmail": "member@example.com",
    "role": "member",
    "joinedAt": "2026-07-09T00:00:00.000Z"
  }
]
```

### `POST /api/teams/:id/members`

Minimal project manager.

```json
{ "userId": 2, "role": "member" }
```

`role` opsional, default `member`. Response `201`: row membership `{ id, teamId, userId, role, joinedAt }`. Duplikat menghasilkan `400`.

### `DELETE /api/teams/:id/members/:userId`

Minimal project manager. Response `200`:

```json
{ "message": "Member removed from team" }
```

## 7. Projects

### `GET /api/projects`

Authenticated.

| Query | Type/enum |
|---|---|
| `page`, `limit` | integer; limit 1–100 |
| `search` | string; name/description |
| `teamId` | integer |
| `sortBy` | `name`, `createdAt`, `updatedAt` |
| `order` | `asc`, `desc` |

Response `200`: paginated `ProjectView`.

### `POST /api/projects`

Minimal project manager. Authenticated user menjadi `ownerId`.

```json
{ "name": "Project Alpha", "description": "Description", "teamId": 1 }
```

Response `201`: `Project`.

### `GET /api/projects/:id`

Authenticated. Response `200`: `ProjectView`.

### `PATCH /api/projects/:id`

Minimal project manager. Body opsional:

```json
{ "name": "New name", "description": "New description", "teamId": 2 }
```

Response `200`: `Project` (tanpa field join).

### `DELETE /api/projects/:id`

Minimal product owner. Response `200`:

```json
{ "message": "Project deleted successfully" }
```

### `GET /api/projects/:id/tasks`

Authenticated. Query `page`, `limit`. Response `200`: paginated task database tanpa join. `404` bila proyek tidak ada.

### `GET /api/projects/:id/teams`

Authenticated. Additional teams saja; primary team berada pada `Project.teamId`.

```json
[
  {
    "id": 1,
    "projectId": 1,
    "teamId": 2,
    "teamName": "QA",
    "teamDescription": "Quality assurance",
    "assignedAt": "2026-07-09T00:00:00.000Z"
  }
]
```

## 8. Project-Team Assignments

Terdapat endpoint read yang tumpang tindih dengan project route:

- `GET /api/projects/:id/teams`
- `GET /api/project-teams/projects/:projectId/teams`

Keduanya authenticated dan mengembalikan bentuk data yang sama.

### `GET /api/project-teams/projects/:projectId/teams`

Authenticated. Mengembalikan additional teams proyek dalam bentuk yang dijelaskan pada `GET /api/projects/:id/teams`. Response `404` bila proyek tidak ada.

### `POST /api/project-teams`

Minimal project manager.

```json
{ "projectId": 1, "teamId": 2 }
```

Response `201`: `{ id, projectId, teamId, assignedAt }`. Error `400` bila sudah assigned; `404` bila project/team tidak ada.

### `DELETE /api/project-teams/:id`

Minimal product owner. Parameter `id` adalah ID assignment, bukan team ID. Response `200`:

```json
{ "message": "Team removed from project successfully" }
```

## 9. Tasks

### `GET /api/tasks`

Authenticated.

| Query | Type/enum |
|---|---|
| `page`, `limit` | integer; limit 1–100 |
| `search` | string; title/description |
| `projectId` | integer |
| `status` | `TaskStatus` |
| `priority` | `TaskPriority` |
| `assigneeId` | integer; primary assignee saja |
| `sortBy` | `title`, `createdAt`, `updatedAt`, `dueDate`, `priority` |
| `order` | `asc`, `desc` |

Response `200`: paginated `TaskView`.

### `POST /api/tasks`

Minimal project manager.

```json
{
  "title": "Implement login",
  "description": "JWT access and refresh flow",
  "status": "backlog",
  "priority": "high",
  "projectId": 1,
  "assigneeId": 2,
  "dueDate": "2026-07-31",
  "position": 0
}
```

`title` min 2. `status` default `backlog`; `priority` default `medium`. Response `201`: `Task`; creator diambil dari token.

### `GET /api/tasks/:id`

Authenticated. Response `200`: `TaskView` dengan:

```ts
{
  comments: Array<{
    id: number;
    content: string;
    authorId: number;
    authorName: string | null;
    authorAvatarUrl: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  }>;
  attachments: Attachment[];
}
```

### `PATCH /api/tasks/:id`

Authenticated tanpa pembatasan ownership pada implementasi saat ini. Semua field berikut opsional: `title`, `description`, `status`, `priority`, `projectId`, `assigneeId`, `dueDate`, `position`.

Response `200`: `Task`.

### `PATCH /api/tasks/:id/status`

Authenticated.

```json
{ "status": "in_progress" }
```

Response `200`: `Task`.

### `DELETE /api/tasks/:id`

Minimal project manager. Response `200`:

```json
{ "message": "Task deleted successfully" }
```

## 10. Additional Task Assignments

### `GET /api/task-assignments/tasks/:taskId/assignments`

Authenticated.

```json
[
  {
    "id": 1,
    "taskId": 10,
    "userId": 2,
    "userName": "Member",
    "userEmail": "member@example.com",
    "userAvatarUrl": null,
    "assignedAt": "2026-07-09T00:00:00.000Z"
  }
]
```

### `POST /api/task-assignments`

Minimal project manager.

```json
{ "taskId": 10, "userId": 2 }
```

Response `201`: `{ id, taskId, userId, assignedAt }`. Membuat notifikasi `task_assigned`. Error `400` bila duplikat; `404` bila task/user tidak ada.

### `DELETE /api/task-assignments/:id`

Minimal project manager. Parameter adalah assignment ID. Response `200`:

```json
{ "message": "Assignment removed successfully" }
```

## 11. Comments

### `GET /api/tasks/:taskId/comments`

Authenticated. Response `200`: komentar terbaru lebih dulu:

```json
[
  {
    "id": 1,
    "content": "Please review @Dian",
    "taskId": 10,
    "authorId": 2,
    "authorName": "Member",
    "createdAt": "2026-07-09T00:00:00.000Z",
    "updatedAt": "2026-07-09T00:00:00.000Z"
  }
]
```

### `POST /api/tasks/:taskId/comments`

Authenticated.

```json
{ "content": "Please review @Dian" }
```

Content min 1. Response `201`: `Comment`. Mention `@name` dapat membuat notifikasi.

### `PATCH /api/comments/:id`

Authenticated dan harus author.

```json
{ "content": "Updated comment" }
```

Response `200`: `Comment`; `403` jika bukan author.

### `DELETE /api/comments/:id`

Authenticated dan harus author. Response `200`:

```json
{ "message": "Comment deleted successfully" }
```

## 12. Attachments

Attachment endpoint ini menerima metadata JSON, bukan file multipart.

### `GET /api/tasks/:taskId/attachments`

Authenticated. Response `200`: `Attachment[]`.

### `POST /api/tasks/:taskId/attachments`

Authenticated.

```json
{
  "fileName": "spec.pdf",
  "fileUrl": "https://storage.example.com/spec.pdf",
  "fileSize": 204800,
  "mimeType": "application/pdf"
}
```

`fileName` dan URL valid wajib. Response `201`: `Attachment`; uploader diambil dari token.

### `GET /api/attachments/:id`

Authenticated. Response `200`: `Attachment`.

### `DELETE /api/attachments/:id`

Authenticated dan harus uploader. Response `200`:

```json
{ "message": "Attachment deleted successfully" }
```

## 13. Upload Avatar

### `POST /api/upload`

Authenticated. `multipart/form-data` dengan field file `avatar`.

```text
avatar: <image/*, max 5 MB>
```

Response `200`:

```json
{ "url": "/uploads/<generated-file-name>" }
```

File dapat diakses melalui `GET /uploads/<generated-file-name>`. Response `400` bila file tidak ada; file type/size invalid diteruskan sebagai error middleware.

## 14. Notifications

### `GET /api/notifications`

Authenticated; hanya notifikasi user dari token. Response `200`:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "actorId": 3,
      "actorName": "Project Manager",
      "actorAvatarUrl": null,
      "type": "mention",
      "taskId": 10,
      "isRead": false,
      "createdAt": "2026-07-09T00:00:00.000Z"
    }
  ]
}
```

Endpoint belum memiliki pagination.

### `PATCH /api/notifications/:id/read`

Authenticated. Hanya mengubah notifikasi milik user.

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": 1,
    "userId": 2,
    "isRead": true
  }
}
```

Jika ID tidak ada/bukan milik user, implementasi tetap merespons `200` dengan `data` yang tidak terdefinisi/terhapus saat serialisasi.

### `PATCH /api/notifications/read-all`

Authenticated.

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": []
}
```

`data` berisi seluruh row notifikasi user yang diperbarui.

## 15. Utility Routes

### `GET /health`

```json
{
  "status": "ok",
  "timestamp": "2026-07-09T00:00:00.000Z",
  "env": "development"
}
```

### `GET /`

```json
{ "message": "Welcome to Project Manager API" }
```

### API documentation

Hanya non-production:

- `GET /api-docs` — Swagger UI
- `GET /api-docs.json` — OpenAPI JSON

## 16. Known Contract Gaps

- Tidak ada API versioning.
- Bentuk response belum konsisten antara resource biasa dan notifikasi.
- Beberapa create/update response berbeda bentuk dari get/list response.
- Tidak semua foreign key/duplicate error dipetakan ke 4xx.
- `PATCH /users/:id` berpotensi membocorkan password hash.
- Filter `role` user belum masuk schema request.
- Tidak ada validasi tanggal ketat untuk `dueDate`.
- Tidak ada authorization berbasis membership/ownership untuk read resource dan full update task.
- Endpoint attachment tidak meng-upload file; endpoint upload hanya untuk avatar.
- Swagger dapat berbeda dari runtime contract; dokumen ini mengutamakan route, schema, controller, dan service aktual.
