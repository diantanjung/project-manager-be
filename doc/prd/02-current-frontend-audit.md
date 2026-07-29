# Current Frontend Feature Audit

> Bagian dari [PRD: Project Manager](../prd.md).  
> Audit dilakukan dari `../project-manager-fe/src` pada 29 Juli 2026.

## 1. Navigation dan Workspace

- Route publik: `/login`, `/register`.
- Route protected: `/`, `/dashboard`, `/project/:projectId`, `/profile`.
- Route admin-only: `/admin/users`, `/admin/teams`.
- `/` melakukan redirect ke project terakhir yang pernah dibuka bila masih terlihat oleh user; fallback ke project pertama; fallback terakhir ke dashboard.
- Sidebar menampilkan daftar project ringan dengan `openTaskCount`, tombol create project, collapse state, profile/settings menu, dan logout.

Backend requirement:

- `GET /api/v1/projects/sidebar` wajib scoped dan mengembalikan `id`, `name`, `openTaskCount`.
- Project list sidebar harus cukup ringan untuk dipanggil saat layout mount dan home redirect.
- Logout harus membersihkan refresh cookie dan access token client dapat dibuang tanpa race.

## 2. Auth dan Profile

- Login/register memakai email/password dan access token.
- ProtectedRoute memakai role user untuk membatasi halaman admin.
- Profile menampilkan avatar, name, email, role, user id.
- User dapat update `name` dan `email`.
- User dapat upload avatar `image/*`, lalu menyimpan `avatarUrl` ke user profile.

Backend requirement:

- Auth response harus menyediakan user aman dan access token.
- `PATCH /users/{id}` harus support self-update untuk `name`, `email`, `avatarUrl`.
- Avatar upload target yang dipakai frontend adalah `POST /users/{user}/avatar`; legacy `POST /upload` hanya kompatibilitas.
- Response user tidak boleh berisi password hash.

## 3. Admin Users

- Admin melihat tabel user dengan pagination, search debounce 500 ms, filter role, sort, page size 5/10/25/50.
- Admin dapat create, edit, delete user.
- Dialog user memerlukan role eksplisit saat create/update.

Backend requirement:

- `GET /users` menerima `page`, `limit`, `search`, `role`, `sortBy`, `order`.
- `POST /users` dan role changes admin-only.
- Delete user harus mengembalikan success shape konsisten dan gagal dengan 409/422 bila masih direferensikan tanpa cascade.

## 4. Admin Teams

- Admin melihat tabel team dengan pagination, search debounce 500 ms, sort, page size 5/10/25/50.
- Admin dapat create, edit, delete team.
- Admin dapat membuka dialog member team, melihat member, add member default role `member`, remove member.

Backend requirement:

- `GET /teams` menerima `page`, `limit`, `search`, `sortBy`, `order`.
- `GET /teams/{team}/members` harus mengembalikan user plus membership role/joinedAt.
- `POST /teams/{team}/members` menerima `user_id` atau `userId` dan `role`.
- Duplicate membership menghasilkan `409 Conflict`.

## 5. Project Board dan Task List

- Board memiliki kolom `backlog`, `todo`, `in_progress`, `review`, `done`.
- User dapat drag task antar kolom; frontend melakukan optimistic update melalui update status/position.
- User dapat create task dari tombol kolom dengan default status.
- User dapat pindah ke list view.
- List view memiliki search debounce, filter status, filter priority, pagination, dan page size 10/25/50.
- Membuka project menyimpan last-opened project di localStorage.

Backend requirement:

- `GET /tasks` menerima `projectId` dan alias `project_id`, serta filter list view.
- Board fetch tanpa pagination harus tetap scoped by project dan user.
- `PATCH /tasks/{task}` harus dapat update `status` dan `position` untuk drag-and-drop saat endpoint reorder belum ada.
- Target P1 tetap `POST /tasks/reorder` atomik untuk mencegah konflik drag-and-drop.

## 6. Task Detail, Comments, dan Attachments

- Task detail dialog menampilkan priority, id, title, assignee, due date, description, attachment, dan comment.
- User dapat edit task dari detail dialog.
- User dapat membuat komentar.
- User dapat delete komentar miliknya sendiri.
- User dapat upload attachment dari detail dialog.
- Attachment list menampilkan file name, size, created date, download, dan delete hanya untuk uploader.
- Frontend mengharapkan upload multipart ke `POST /tasks/{task}/attachments` dan download via `GET /attachments/{attachment}/download`.

Backend requirement:

- Comment endpoint harus task-scoped: `GET/POST /tasks/{task}/comments`.
- Attachment upload harus multipart dengan field `file`.
- Attachment response perlu normalisasi `originalName`/`fileName`, `mimeType`, `size`/`fileSize`, `downloadUrl`, `uploaderId`.
- Download attachment harus resource-scoped dan dapat memakai signed URL atau proxy endpoint.

## 7. Notifications

- Notification bell fetch sekali saat mount.
- Badge memakai unread count, maksimum display `9+`.
- Popover menampilkan actor avatar/name, message berdasarkan type, createdAt, read state.
- User dapat mark one as read dengan klik item dan mark all as read.

Backend requirement:

- `GET /notifications` perlu mengembalikan list milik user dan unread count.
- Response legacy `{ success, count, data }` masih dipakai sebagian frontend, tetapi target contract harus konsisten.
- Notification harus punya actor info, taskId, type, read state, dan createdAt.

## 8. Dashboard

- Dashboard menampilkan 4 stat utama: active progress, in review, due soon, overdue.
- Dashboard memiliki tabs: recent tasks, upcoming deadlines, high priority.
- Task preview card dapat membuka task detail dialog.
- Latest updates menampilkan activity log dengan actor, action, entity label, timestamp.
- Store dashboard mendukung cache dan background refresh state.

Backend requirement:

- `GET /dashboard` adalah MVP, bukan nice-to-have.
- Response harus scoped sesuai visibility user.
- Payload harus menyertakan `totalActiveProjects`, `taskCountPerStatus`, `activeProgress`, `inReview`, `dueSoon`, `overdue`, `overdueTaskCount`, `workloadPerMember`, `recentlyUpdatedTasks`, `recentTasks`, `upcomingDeadlines`, `highPriorityTasks`, `latestUpdates`.
