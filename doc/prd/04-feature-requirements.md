# Feature Requirements

> Bagian dari [PRD: Project Manager](../prd.md).

## 1. Authentication dan Session

- Register public membuat user role default `teamMember`.
- Login menghasilkan access token dan refresh token cookie.
- Refresh token disimpan sebagai hash, dirotasi saat refresh, dan dapat dicabut saat logout.
- `GET /auth/me` wajib tersedia untuk rehydrate session frontend.
- Login/register/refresh wajib rate limited.
- Logout all devices dan password reset masuk P1 security hardening.

## 2. User dan Profile

- Admin dapat list/create/update/delete user.
- User dapat update profile sendiri: `name` dan `email`.
- Admin dapat update role user; non-admin tidak boleh mengubah role.
- Avatar upload menggunakan `POST /users/{user}/avatar` dengan field `avatar`; backend menyimpan `avatarStorageKey` sebagai target DB/internal field. `avatarUrl` hanya response runtime signed/proxy URL.
- User list mendukung search, role filter, sort, pagination, dan page size kecil untuk tabel admin.

## 3. Team Management

- Product owner/admin dapat create/update team; admin dapat delete team.
- Project manager dapat manage member pada team yang ia kelola.
- Team member list mengembalikan user data plus membership role/joinedAt.
- Add/remove member harus scoped, idempotency dipertimbangkan, dan duplicate membership menghasilkan `409`.

## 4. Project Management dan Navigation

- Project memiliki owner dan primary team.
- Project dapat memiliki additional teams.
- Project list mendukung search, status/team/owner filter, sort, pagination.
- Sidebar project API mengembalikan project visible secara ringan: `id`, `name`, `openTaskCount`.
- Home redirect frontend bergantung pada sidebar API untuk memilih last-opened project.
- Project summary mengembalikan task count per status, total task, dan jumlah team.

## 5. Task Management

- Task status: `backlog`, `todo`, `in_progress`, `review`, `done`.
- Task priority: `low`, `medium`, `high`, `urgent`.
- Task memiliki title, description, project, creator, assignee, due date, position, dan timestamps.
- Task list mendukung project filter, search, status, priority, assignee, due date range, sort, pagination.
- Board mode dapat fetch semua task project yang visible tanpa pagination atau dengan limit besar yang aman.
- Create task dapat menerima attachment awal.
- Edit task dapat mengubah title, description, status, priority, assignee, due date.
- Drag-and-drop board membutuhkan update status/position; P1 menambahkan endpoint reorder atomik.

## 6. Collaboration

- Task detail menampilkan comment dan attachment.
- User dengan akses task dapat membuat komentar.
- Author dapat update/delete comment.
- Mention MVP menggunakan `@name`; target lebih kuat memakai user id/autocomplete.
- Mention menghasilkan notification `mention`.
- Comment create/update/delete masuk activity log target.

## 7. Attachment

- MVP target memakai multipart upload ke `POST /tasks/{task}/attachments`.
- Field upload: `file`.
- Metadata tersimpan: original name, mime type, size, uploader, task, `storageKey`, dan createdAt. Provider, bucket, endpoint, dan signed URL TTL dibaca dari environment runtime.
- Download memakai `GET /attachments/{attachment}/download` dengan authorization scoped.
- Response boleh menyertakan `downloadUrl` signed sementara yang dibuat saat request dan tidak disimpan di table attachment.
- Delete attachment menghapus metadata dan file fisik/storage object.
- Production target memakai Cloudflare R2; local storage hanya development fallback.
- Legacy metadata JSON `fileUrl` masih dicatat sebagai perbedaan Node.js lama.

## 8. Notification

- Notification dibuat untuk assignment dan mention pada MVP.
- Target P1 menambahkan due reminder, project update, preference, digest, dan realtime/SSE.
- User dapat melihat notification miliknya, unread count, mark one as read, dan mark all as read.
- Notification item harus cukup untuk notification bell: actor name/avatar, type, taskId, read state, createdAt.

## 9. Dashboard dan Activity

- Dashboard adalah MVP karena frontend sudah bergantung pada `GET /dashboard`.
- Dashboard menghitung active progress, in review, due soon 7 hari, overdue, workload per member, recent tasks, upcoming deadlines, high priority tasks, dan latest updates.
- Latest updates memakai activity log target; bila belum ada, backend boleh mengembalikan array kosong.
- Activity log target mencatat project/task/comment/attachment/member/role changes dengan actor, before, after, IP, user agent, timestamp.

## 10. Reporting dan Integration

- Export CSV project report/task list masuk P1.
- Webhook outbound admin-only masuk P1/P2 untuk integration demo.
- Webhook delivery harus signed HMAC, retryable, dan punya delivery log.
