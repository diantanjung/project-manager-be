# Konvensi, Enum, dan Model

> Bagian dari [API Contract](../api_contract.md).

## 1. Authentication

Semua endpoint `/api/v1` selain register, login, refresh, dan health memerlukan:

```http
Authorization: Bearer <accessToken>
```

Refresh token disimpan sebagai cookie `HttpOnly` dan boleh diterima dari body untuk non-browser client bila backend mendukung.

```http
Set-Cookie: refreshToken=<token>; HttpOnly; SameSite=Lax; Path=/
```

Requirement:

- Access token dikirim sebagai Bearer token.
- Refresh token disimpan sebagai hash.
- Refresh token dirotasi setiap refresh.
- Login, register, dan refresh memakai rate limit.
- Response user tidak memuat password, token hash, refresh token record, atau secret.

## 2. Content Type dan Naming

- Request/response utama: `application/json`.
- Upload file: `multipart/form-data`.
- Timestamp: ISO 8601 string atau `null`.
- Date-only field: `YYYY-MM-DD`.
- Response field: `camelCase`.
- Request body menerima `camelCase`; selama migrasi Node.js boleh menerima alias `snake_case`.

## 3. Response Envelope

Single resource:

```json
{
  "data": {}
}
```

Paginated list:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

Command:

```json
{
  "data": {
    "message": "Task deleted successfully"
  }
}
```

## 4. Error Response

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

| HTTP | Arti |
| --- | --- |
| 400 | Request salah atau operasi tidak valid |
| 401 | Access/refresh token tidak ada, invalid, expired, atau revoked |
| 403 | Role tidak cukup atau user tidak punya akses resource |
| 404 | Resource tidak ditemukan |
| 409 | Konflik data, misalnya email/member/assignment duplikat |
| 422 | Validation error |
| 429 | Rate limit |
| 500 | Error yang tidak dipetakan |

## 5. Enum

```text
UserRole         = admin | productOwner | projectManager | teamMember
TeamMemberRole   = owner | admin | member
ProjectStatus    = planning | active | paused | completed | archived
TaskStatus       = backlog | todo | in_progress | review | done
TaskPriority     = low | medium | high | urgent
NotificationType = task_assigned | mention | task_due | project_update | system_alert
WebhookEvent     = task.created | task.updated | task.completed | comment.created | project.updated
WebhookStatus    = pending | delivered | failed
```

## 6. Core Model Response

```ts
type User = {
  id: number;
  name: string;
  email: string;
  avatarStorageKey: string | null;
  role: UserRole;
  timezone: string | null;
  lastLoginAt: string | null;
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

type TeamMember = {
  id: number;
  teamId: number;
  userId: number;
  role: TeamMemberRole;
  joinedAt: string | null;
  user?: User;
};

type Project = {
  id: number;
  name: string;
  description: string | null;
  teamId: number;
  ownerId: number;
  status: ProjectStatus;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  owner?: User;
  team?: Team;
};

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  projectId: number;
  creatorId: number;
  assigneeId: number | null;
  dueDate: string | null;
  position: number | null;
  estimateMinutes: number | null;
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  project?: Project;
  creator?: User;
  assignee?: Pick<User, "id" | "name" | "avatarUrl"> | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
};

type Comment = {
  id: number;
  taskId: number;
  authorId: number;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
  author?: Pick<User, "id" | "name" | "avatarUrl">;
};

type Attachment = {
  id: number;
  taskId: number;
  uploaderId: number;
  fileName: string;
  originalName: string;
  storageKey: string;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string | null;
  updatedAt?: string | null;
  downloadUrl?: string;
  size?: number | null;
  uploader?: Pick<User, "id" | "name" | "avatarUrl">;
  // Legacy compatibility only; target schema should not persist these.
  fileUrl?: string | null;
  disk?: string;
  path?: string;
};
```

`avatarStorageKey` adalah field storage internal/DB untuk private R2. `avatarUrl` adalah response runtime yang boleh berupa signed URL sementara atau backend proxy URL, dan tidak perlu disimpan sebagai kolom database target.
