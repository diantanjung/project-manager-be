# Todo: Align Backend Node.js dengan Shared Project Manager API Contract

Dokumen ini mencatat perubahan yang diperlukan agar backend Node.js mengikuti shared API contract di `doc/api_contract.md`. Contract tersebut diselaraskan dengan arah PRD Laravel di `../project-manager-laravel/doc/prd-laravel.md`, tetapi berlaku untuk semua backend: Node.js, Laravel, dan Golang.

Status:

- [x] `doc/api_contract.md` sudah diubah menjadi shared target contract `/api/v1`.
- [x] `postman/project-manager-api.postman_collection.json` sudah disesuaikan dengan endpoint target contract.

## 1. API Versioning

- [ ] Ubah prefix API utama dari `/api` menjadi `/api/v1`.
- [ ] Pertahankan kompatibilitas `/api` sementara bila frontend lama masih memakai prefix tersebut.
- [ ] Update route registration agar mount endpoint di `/api/v1`.
- [ ] Update Swagger/OpenAPI path agar memakai `/api/v1`.
- [x] Update Postman collection agar memakai `/api/v1`.
- [ ] Update script test manual agar memakai `/api/v1`.
- [x] Update dokumentasi contract agar memakai `/api/v1`.
- [ ] Pastikan health check tetap tersedia dan disepakati path finalnya.

## 2. Response Shape

- [ ] Standarkan response single resource menjadi `{ "data": { ... } }`.
- [ ] Standarkan response list menjadi `{ "data": [], "pagination": { ... } }`.
- [ ] Hilangkan bentuk campuran seperti array langsung, object langsung, atau `{ success, count, data }`.
- [ ] Update notification response agar mengikuti envelope standar.
- [ ] Update error response agar konsisten untuk validation, unauthorized, forbidden, not found, conflict, dan server error.
- [ ] Update controller tests dan integration tests sesuai response shape baru.

## 3. Auth dan Token

- [ ] Pastikan login/register/refresh memakai access token dan refresh token cookie sesuai contract final.
- [ ] Simpan refresh token dalam bentuk hash di database.
- [ ] Terapkan refresh token rotation saat refresh.
- [ ] Tambahkan rate limit untuk login, register, dan refresh.
- [ ] Pastikan response user tidak pernah memuat password, refresh token, token hash, atau secret.
- [x] Putuskan response auth final di contract: token berada di dalam `data`, refresh token tetap memakai cookie dan boleh diterima dari body untuk non-browser client bila backend mendukung.
- [x] Update API contract untuk response auth final.

## 4. RBAC dan Resource Access

- [ ] Terapkan akses baca resource berdasarkan membership, ownership, dan role.
- [ ] Batasi update task agar hanya user yang berwenang dapat mengubah field tertentu.
- [ ] Batasi project/team management sesuai role: teamMember, projectManager, productOwner, admin.
- [ ] Tambahkan test untuk user di luar scope project/team.
- [ ] Tambahkan test untuk update/delete resource milik user lain.
- [ ] Audit semua endpoint yang saat ini hanya authenticated tanpa scope authorization.

## 5. Domain Model

- [ ] Tambahkan `ProjectStatus`: `planning`, `active`, `paused`, `completed`, `archived`.
- [ ] Tambahkan field project: `status`, `start_date`, `due_date`.
- [ ] Tambahkan field task: `estimate_minutes`, `completed_at`.
- [ ] Tambahkan field user: `timezone`, `last_login_at`.
- [ ] Tambahkan model/table `ActivityLog`.
- [ ] Tambahkan model/table `WebhookEndpoint`.
- [ ] Tambahkan model/table `WebhookDelivery`.
- [ ] Review ulang enum `NotificationType` agar mencakup `task_due`, `project_update`, dan `system_alert`.

## 6. Project Management API

- [ ] Update project CRUD agar mendukung `team_id`, `owner_id`, `status`, `start_date`, dan `due_date`.
- [ ] Tambahkan filter project: search, status, team, owner, sort, pagination.
- [ ] Tambahkan endpoint `GET /api/v1/projects/{project}/tasks`.
- [ ] Tambahkan endpoint `GET /api/v1/projects/{project}/activity`.
- [ ] Tambahkan endpoint `GET /api/v1/projects/{project}/summary`.
- [ ] Tambahkan endpoint `POST /api/v1/projects/{project}/teams`.
- [ ] Tambahkan endpoint `DELETE /api/v1/projects/{project}/teams/{team}`.
- [ ] Pastikan additional teams dan primary team punya aturan yang jelas.

## 7. Task Management API

- [ ] Tambahkan filter task: project, status, priority, assignee, due date, search, sort, pagination.
- [ ] Tambahkan Kanban reorder endpoint yang atomik.
- [ ] Tambahkan task checklist/subtask.
- [ ] Tambahkan task dependency/blocker.
- [ ] Cegah task menjadi `done` jika dependency wajib belum selesai.
- [ ] Pastikan task update menghasilkan activity log.
- [ ] Pastikan assignment menghasilkan notification.

## 8. Attachment dan Cloudflare R2

- [ ] Ubah attachment dari metadata JSON menjadi upload file `multipart/form-data`.
- [ ] Integrasikan Cloudflare R2 sebagai object storage.
- [ ] Simpan metadata attachment di database: disk, path, original name, MIME type, size, uploader.
- [ ] Tambahkan endpoint download yang mengecek permission user terhadap task/project.
- [ ] Pastikan delete attachment menghapus metadata dan object di R2.
- [ ] Tambahkan validasi file type dan size.
- [ ] Pastikan URL file tidak membocorkan credential.

## 9. Notification

- [ ] Standarkan response notification dengan envelope `{ data, pagination }`.
- [ ] Tambahkan notification untuk task assignment, mention, overdue reminder, dan project update.
- [ ] Pastikan mark one dan mark all as read hanya berlaku untuk notification milik user.
- [ ] Tambahkan notification digest via scheduled job.

## 10. Activity Log

- [ ] Catat project create/update/archive.
- [ ] Catat task create/update/status change/reorder.
- [ ] Catat assignee change.
- [ ] Catat comment create/update/delete.
- [ ] Catat attachment upload/delete.
- [ ] Catat role/member change.
- [ ] Tambahkan endpoint activity log sesuai scope role.

## 11. Dashboard, Export, dan Webhook

- [ ] Tambahkan dashboard summary: active projects, task count per status, overdue tasks, workload per member, recently updated tasks, blocked tasks.
- [ ] Tambahkan export CSV untuk project report dan task list.
- [ ] Jalankan export besar via queue/job.
- [ ] Tambahkan webhook endpoint management.
- [ ] Tambahkan webhook delivery log.
- [ ] Tambahkan signing payload menggunakan HMAC secret.
- [ ] Tambahkan retry webhook dengan backoff.

## 12. Queue, Scheduler, dan Operations

- [ ] Tambahkan queue worker untuk notification, webhook, export, cleanup, dan reminder.
- [ ] Tambahkan scheduled job `tasks:send-overdue-reminders`.
- [ ] Tambahkan scheduled job `notifications:send-digest`.
- [ ] Tambahkan scheduled job `webhooks:retry-failed`.
- [ ] Tambahkan scheduled job `exports:cleanup-expired`.
- [ ] Tambahkan scheduled job untuk cleanup expired refresh tokens.
- [ ] Tambahkan structured logging dan request/correlation ID.

## 13. Documentation dan Contract

- [x] Update `doc/api_contract.md` agar mengikuti endpoint dan response target shared contract.
- [ ] Tandai endpoint dengan status: planned, route exists, implemented, tested.
- [ ] Update Swagger/OpenAPI agar sesuai contract final.
- [x] Update Postman collection.
- [ ] Update README setup, env, test, seed, deploy, dan demo credentials.
- [x] Pastikan contract menjelaskan perbedaan behavior lama dan target `/api/v1`.

## 14. Testing

- [ ] Tambahkan unit test untuk role hierarchy dan policy decisions.
- [ ] Tambahkan feature/integration test untuk auth, users, teams, projects, tasks, comments, attachments, notifications, activity, dashboard, export, dan webhook.
- [ ] Tambahkan test untuk duplicate membership/assignment conflict.
- [ ] Tambahkan test untuk visibility scope project/task.
- [ ] Tambahkan test untuk upload/delete file dengan storage fake/mock.
- [ ] Tambahkan smoke test `/health`.
