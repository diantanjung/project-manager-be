# Roadmap dan Gap

> Bagian dari [PRD: Project Manager](../prd.md).

## 1. Gap dari Audit Frontend

| Area | Gap | Prioritas |
| --- | --- | --- |
| Project sidebar | Contract lama belum mencantumkan `openTaskCount`; frontend sudah memakai field ini | MVP |
| Dashboard | Frontend sudah punya halaman dashboard penuh; PRD lama menaruh reporting sebagai rekomendasi P2 | MVP |
| Home redirect | Backend harus membuat sidebar API cepat dan scoped agar redirect `/` andal | MVP |
| Task list | Frontend mengirim `project_id` dan `projectId`; backend target perlu mendukung alias selama migrasi | MVP |
| Task board DnD | Frontend update status/position melalui patch task; target perlu reorder atomik P1 | MVP/P1 |
| Attachment upload | Frontend sudah memakai multipart task attachment; Node.js legacy masih metadata URL | MVP |
| Attachment download | Frontend mengharapkan `/attachments/{id}/download` atau `downloadUrl`; legacy belum ada | MVP |
| Production deployment | PRD lama belum eksplisit untuk Render/Railway/VPS, Vercel, Supabase, dan Cloudflare R2 | MVP |
| Avatar upload | Frontend memakai `/users/{id}/avatar`; legacy Node.js route adalah `/upload` | MVP |
| Notification count | Frontend butuh unread count; target harus jelas walau legacy memakai `count` total item | MVP |
| Activity latest updates | Dashboard UI siap menampilkan activity; Node.js belum punya table/service | P1 |

## 2. P0 - Security dan API Consistency

- Resource-scoped authorization untuk project/task/comment/attachment.
- User/team read scope ditinjau ulang agar tidak selalu global untuk semua authenticated user.
- Role changes admin-only.
- Response user aman tanpa password/hash.
- Response envelope `{ data }`, pagination, validation error, dan `409 Conflict` distandardisasi.
- Rate limit auth.
- Prefix `/api/v1` aktif; `/api` hanya compatibility alias.

Acceptance criteria:

- User di luar project tidak melihat project/task dan tidak bisa membaca task detail/comment/attachment.
- Semua duplicate membership/assignment/project-team menghasilkan `409`.
- Frontend admin tables dapat search/filter/sort/paginate tanpa fallback client-side besar.

## 3. P1 - Workflow Stabil

- Activity log dan audit trail.
- Kanban reorder endpoint atomik dengan status dan position.
- Unified assignment model dengan primary marker.
- Checklist task.
- Attachment upload terpadu ke Cloudflare R2/S3-compatible object storage.
- Dashboard latest updates dari activity log.

Acceptance criteria:

- Drag-and-drop banyak user tidak saling menimpa urutan.
- Task detail mempunyai timeline perubahan penting.
- Query "My Tasks" mencakup primary dan additional assignment.

## 4. P2 - Insight dan Engagement

- Realtime notification via SSE/WebSocket.
- Notification preference, archive/delete, digest.
- Mention berbasis immutable user id dan autocomplete.
- Export CSV/report.
- Cycle time, throughput, dan workload insight lebih dalam.
- Webhook integration demo.

## 5. Milestone

| Fase | Fokus | Outcome |
| --- | --- | --- |
| 1 | Auth, user/profile, team, project sidebar, API consistency | Frontend dapat login dan navigasi stabil |
| 2 | Task board/list, task detail, comment, attachment upload/download | Workflow harian usable |
| 3 | Notification, dashboard, project summary, resource scope | Visibility dan access control cukup aman |
| 4 | Activity log, reorder atomik, unified assignment | Workflow dapat ditelusuri dan tahan concurrency |
| 5 | Checklist, export, webhook, realtime | Product polish dan integrasi |
