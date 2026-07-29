# Domain, Rules, dan Non-Functional Requirements

> Bagian dari [PRD: Project Manager](../prd.md).

## 1. Role dan Permission

Hierarki role global:

```text
teamMember < projectManager < productOwner < admin
```

Team membership memiliki role lokal:

```text
owner | admin | member
```

Role lokal wajib dipakai untuk operasi scoped pada team/project, tidak hanya saat create project.

## 2. Model Domain

| Entitas | Relasi penting |
| --- | --- |
| User | refresh token, team membership, comment, created task, assigned task, notification, avatar |
| Team | member, primary project, additional project |
| Project | owner, primary team, additional teams, tasks, activity summary |
| Task | project, creator, assignee, additional assignees, comments, attachments, activity |
| Comment | task, author, mention side effects |
| Attachment | task, uploader, storage object atau metadata legacy |
| Notification | recipient, actor, optional task |
| ActivityLog | actor, entity, before/after |

## 3. Enum Target

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

Catatan Node.js saat ini belum memiliki `ProjectStatus`, `ActivityLog`, webhook, checklist, dan beberapa kolom target seperti `estimateMinutes`/`completedAt`.

## 4. Aturan Bisnis

- Email user unik.
- Password minimal 6 karakter dan disimpan sebagai hash.
- Nama user, team, project, dan title task minimal 2 karakter.
- Project selalu memiliki primary team dan owner.
- Task selalu memiliki project, creator, dan primary assignee pada legacy Node.js; target contract memperbolehkan `assigneeId=null` hanya jika product memutuskan support unassigned task.
- User tidak dapat ditambahkan dua kali ke team yang sama.
- Team tidak dapat ditambahkan dua kali sebagai additional team project.
- User tidak dapat ditambahkan dua kali sebagai additional assignee task.
- Comment hanya dapat diubah/dihapus oleh author.
- Attachment hanya dapat dihapus oleh uploader atau project manager scoped.
- Pagination default `page=1`, `limit=10`; limit maksimum 100.
- Due date memakai date-only `YYYY-MM-DD` di contract; frontend dapat mengirim ISO timestamp dan backend wajib menormalisasi.

## 5. Non-Functional Requirements

- API utama memakai prefix `/api/v1`; prefix `/api` boleh tetap aktif sebagai compatibility alias selama migrasi.
- Endpoint protected memakai `Authorization: Bearer <accessToken>`.
- Refresh token memakai cookie `HttpOnly`; browser client membutuhkan CORS credentials.
- Response memakai JSON dan field `camelCase`.
- Database field boleh `snake_case`; API wajib normalisasi response.
- Response list berhalaman wajib konsisten.
- Error validation dan conflict tidak boleh jatuh sebagai HTTP 500.
- Swagger/OpenAPI tersedia hanya saat `NODE_ENV !== production`.
- Health check tersedia di `/health` dan/atau `/api/v1/health`.
- Upload avatar dan attachment wajib validasi MIME/size.
- Unit/feature test harus mencakup service, controller, authorization, dashboard payload, attachment upload/download, dan notification read flow.
