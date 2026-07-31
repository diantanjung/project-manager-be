# PRD: Project Manager Java Spring Boot Portfolio

## 1. Ringkasan

Project Manager Java Spring Boot adalah aplikasi manajemen proyek berbasis web yang dibangun sebagai portfolio untuk posisi Java & AI Developer. Produk ini merepresentasikan sistem internal perusahaan untuk mengelola user, team, project, task, komentar, attachment, notifikasi, serta AI assistant untuk membantu project manager memahami progres pekerjaan.

Project ini merupakan versi Java Spring Boot dari domain `project-manager-be` yang sudah ada, dengan frontend React dari `../project-manager-fe` sebagai aplikasi demo utama. Fokus portfolio adalah menunjukkan kemampuan backend enterprise, REST API, autentikasi, role-based access control, database design, integrasi frontend-backend, dokumentasi teknis, Docker deployment, dan integrasi AI.

## 2. Tujuan Portfolio

- Membuktikan kemampuan membangun aplikasi Java Spring Boot yang production-minded.
- Menunjukkan pemahaman clean architecture/layered architecture.
- Menunjukkan kemampuan membuat REST API, validasi request, pagination, filtering, dan error handling.
- Menunjukkan kemampuan database design dan query optimization dasar.
- Menunjukkan kemampuan menggunakan Docker untuk local development dan deployment ke Render/Railway/VPS.
- Menunjukkan kemampuan mengintegrasikan AI ke workflow aplikasi bisnis.
- Menunjukkan kemampuan menghubungkan backend Spring Boot dengan frontend React TypeScript yang sudah berjalan.
- Menyediakan demo yang mudah dijalankan dengan `docker compose up`.

## 3. Target Pengguna

- Admin: mengelola user dan akses sistem.
- Product Owner: mengelola team dan ownership proyek.
- Project Manager: membuat project, assign team, membuat task, assign member, dan memonitor progres.
- Team Member: melihat task, update status task, menulis komentar, dan menerima notifikasi.

## 4. Problem Statement

Tim proyek membutuhkan aplikasi internal untuk mengelola pekerjaan secara terstruktur. Data project, task, assignee, komentar, dan notifikasi sering tersebar di banyak tempat sehingga sulit dipantau. Project manager juga membutuhkan ringkasan progres yang cepat tanpa harus membaca semua task satu per satu.

Solusi yang dibangun adalah sistem project management dengan AI assistant yang dapat membantu menyimpulkan kondisi project, mendeteksi task bermasalah, dan membuat draft status report.

## 5. Scope Produk

### 5.1 In Scope

- User management.
- Authentication dengan access token dan refresh token.
- Role-based access control.
- Team management.
- Project management.
- Single-team project assignment.
- Task management.
- Single-assignee task assignment.
- Comment management.
- Attachment metadata management.
- Notification management.
- AI assistant untuk project summary dan task insights.
- Integrasi dengan frontend React TypeScript existing di `../project-manager-fe`.
- Perbaikan frontend agar portfolio-ready: dashboard data real, AI panel, role-based UI, README, dan Docker setup.
- REST API documentation dengan OpenAPI/Swagger.
- Database migration.
- Docker Compose untuk menjalankan frontend, backend, dan database secara lokal.
- Production deployment ke backend web service, Vercel frontend, Supabase Postgres, dan Cloudflare R2.
- Unit test dan integration test dasar.

### 5.2 Out of Scope

- Real-time collaboration dengan WebSocket.
- Storage provider selain Cloudflare R2/S3-compatible untuk MVP.
- Payment/subscription.
- Native mobile app.
- Fine-tuning model sebagai fitur wajib.
- Multi-tenant SaaS billing.

## 6. Tech Stack

- Language: Java 21.
- Framework: Spring Boot 3.x.
- Web: Spring Web.
- Security: Spring Security + JWT.
- Persistence: Spring Data JPA.
- Database: PostgreSQL, production target Supabase Postgres.
- Migration: Flyway.
- API Docs: springdoc-openapi.
- Testing: JUnit 5, Mockito, Testcontainers.
- Build Tool: Maven.
- Deployment: Docker, Docker Compose, Render Web Service/Railway/VPS Sumopod untuk backend, Vercel untuk frontend.
- Observability: Spring Boot Actuator.
- AI Integration: OpenAI-compatible API atau local LLM-compatible provider.
- Frontend: existing React TypeScript Vite app di `../project-manager-fe`.
- Frontend State Management: Zustand.
- Frontend HTTP Client: Axios.
- Frontend Styling: Tailwind CSS.
- Frontend Interaction: `@hello-pangea/dnd` untuk kanban drag-and-drop.

Catatan: Spring Boot menyediakan fondasi untuk aplikasi stand-alone dengan embedded servlet container, externalized configuration, production-ready Actuator endpoints, testing support, dan packaging ke Docker container.

### 6.1 MVP Implementation Decisions

- Gunakan Maven sebagai build tool.
- Gunakan Flyway untuk database migration.
- Gunakan relasi sederhana: satu project hanya memiliki satu team melalui `project.teamId`.
- Gunakan single assignee: satu task hanya memiliki satu assignee melalui `task.assigneeId`.
- Gunakan RBAC sederhana berbasis system role dan ownership/membership dasar.
- Refresh token dikirim melalui HttpOnly cookie, disimpan dalam bentuk hash di database, dan dapat dicabut saat logout.
- Attachment menggunakan multipart upload ke Cloudflare R2 untuk production; local storage hanya fallback development.
- AI request audit bersifat optional, bukan acceptance criteria wajib.

## 7. Arsitektur Aplikasi

Gunakan layered architecture:

```text
Controller Layer
  - REST endpoint
  - Request validation
  - Response mapping

Application/Service Layer
  - Business logic
  - RBAC decision
  - Transaction boundary

Domain Layer
  - Entity
  - Enum
  - Domain rule

Persistence Layer
  - Repository
  - Query method
  - Specification/filtering

Integration Layer
  - AI provider client
  - File metadata handling
  - Notification generator
```

Recommended package structure:

```text
com.example.projectmanager
  auth
  user
  team
  project
  task
  collaboration
  notification
  ai
  common
  config
```

Frontend integration target:

```text
../project-manager-fe
  src/services       -> API client per resource
  src/stores         -> Zustand state management
  src/pages          -> Login, dashboard, admin, project board
  src/components     -> Reusable UI components
  src/lib/axios.ts   -> Base API client, access token, refresh handling
```

Backend Spring Boot harus menjaga kontrak response yang kompatibel dengan frontend existing jika memungkinkan. Jika ada perubahan kontrak, perubahan harus didokumentasikan di README dan disesuaikan di service layer frontend.

## 8. Role dan Permission

### 8.1 System Roles

- `ADMIN`
- `PRODUCT_OWNER`
- `PROJECT_MANAGER`
- `TEAM_MEMBER`

### 8.2 Permission Matrix

| Feature | Admin | Product Owner | Project Manager | Team Member |
| --- | --- | --- | --- | --- |
| Manage users | Yes | No | No | No |
| Create team | Yes | Yes | No | No |
| Update team | Yes | Yes | No | No |
| Delete team | Yes | No | No | No |
| Create project | Yes | Yes | Yes | No |
| Update project | Yes | Yes | Yes | No |
| Delete project | Yes | Yes | No | No |
| Set project team | Yes | Yes | Yes | No |
| Create task | Yes | Yes | Yes | No |
| Update task status | Yes | Yes | Yes | Yes |
| Comment on task | Yes | Yes | Yes | Yes |
| View notifications | Own data | Own data | Own data | Own data |
| Use AI assistant | Yes | Yes | Yes | Limited |

## 9. Core Entities

### 9.1 User

- `id`
- `name`
- `email`
- `passwordHash`
- `avatarStorageKey`
- `role`
- `createdAt`
- `updatedAt`

### 9.2 Team

- `id`
- `name`
- `description`
- `createdAt`
- `updatedAt`

### 9.3 TeamMember

- `id`
- `teamId`
- `userId`
- `role`
- `joinedAt`

### 9.4 Project

- `id`
- `name`
- `description`
- `teamId`
- `ownerId`
- `createdAt`
- `updatedAt`

Catatan: untuk MVP portfolio, satu project hanya terhubung ke satu team. Relasi multi-team dapat menjadi future improvement.

### 9.5 Task

- `id`
- `title`
- `description`
- `status`
- `priority`
- `projectId`
- `creatorId`
- `assigneeId`
- `dueDate`
- `position`
- `createdAt`
- `updatedAt`

Catatan: untuk MVP portfolio, satu task hanya memiliki satu assignee. Relasi multi-assignee dapat menjadi future improvement.

### 9.6 Comment

- `id`
- `content`
- `taskId`
- `authorId`
- `createdAt`
- `updatedAt`

### 9.7 Attachment

- `id`
- `fileName`
- `originalName`
- `storageKey`
- `fileSize`
- `mimeType`
- `taskId`
- `uploaderId`
- `createdAt`

### 9.8 Notification

- `id`
- `userId`
- `actorId`
- `type`
- `taskId`
- `isRead`
- `createdAt`

## 10. Functional Requirements

### 10.1 Authentication

- User dapat login menggunakan email dan password.
- Sistem mengembalikan access token dan refresh token.
- Refresh token dapat digunakan untuk membuat access token baru.
- Logout menghapus atau mencabut refresh token.
- Password harus disimpan dalam bentuk hash.

### 10.2 User Management

- Admin dapat membuat, melihat, mengubah, dan menghapus user.
- User dapat melihat detail profile sendiri.
- Endpoint list user mendukung pagination, search, role filter, sort, dan order.

### 10.3 Team Management

- Product Owner dapat membuat dan mengubah team.
- Admin dapat menghapus team.
- Project Manager dapat menambahkan atau menghapus member dari team.
- Sistem menyimpan role member di dalam team: `OWNER`, `ADMIN`, `MEMBER`.
- Aturan MVP dibuat sederhana: Admin dapat mengelola semua team, Product Owner dapat membuat/mengubah team, dan Project Manager hanya dapat mengelola member pada team yang terkait dengannya.

### 10.4 Project Management

- Project Manager dapat membuat dan mengubah project.
- Product Owner dapat menghapus project.
- Project dapat memiliki owner.
- Project wajib dihubungkan dengan satu team.
- Endpoint list project mendukung pagination, search, team filter, sort, dan order.
- Aturan MVP dibuat sederhana: Admin dan Product Owner dapat melihat semua project, Project Manager dapat mengelola project miliknya, dan Team Member hanya dapat melihat project dari team tempat ia terdaftar.

### 10.5 Task Management

- Project Manager dapat membuat task.
- Task memiliki status: `BACKLOG`, `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`.
- Task memiliki priority: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
- Team Member dapat mengubah status task yang di-assign kepadanya.
- Endpoint list task mendukung pagination, search, project filter, status filter, priority filter, assignee filter, sort, dan order.
- Aturan MVP dibuat sederhana: Project Manager dapat mengelola task di project miliknya, Team Member dapat melihat task di project team-nya, dan hanya assignee yang dapat update status task miliknya.

### 10.6 Collaboration

- User yang memiliki akses ke task dapat menulis komentar.
- Author dapat mengubah atau menghapus komentarnya sendiri.
- Attachment disimpan melalui multipart upload ke Cloudflare R2/S3-compatible object storage di production dan metadata file disimpan di database.
- Upload file/avatar wajib dibatasi berdasarkan MIME type dan ukuran file.

### 10.7 Notification

- Sistem membuat notifikasi saat task di-assign.
- Sistem membuat notifikasi saat user disebut dalam komentar jika mention parsing tersedia.
- User dapat melihat notifikasi miliknya.
- User dapat menandai satu notifikasi atau semua notifikasi sebagai read.

### 10.8 AI Assistant

AI assistant menjadi pembeda utama portfolio.

Minimum viable AI features:

- Generate project summary berdasarkan task, status, priority, dan komentar.
- Generate weekly status report untuk project manager.
- Suggest next actions untuk overdue atau high-priority task.
- Break down project description menjadi draft task list.

Optional AI features:

- Prompt template management.
- Audit log untuk setiap AI request.
- RAG sederhana dari dokumen project.
- AI-generated risk detection.
- AI-generated release notes dari task yang sudah done.

## 11. API Requirements

Base path:

```text
/api/v1
```

### 11.1 Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### 11.2 Users

- `GET /users`
- `POST /users`
- `GET /users/{id}`
- `PATCH /users/{id}`
- `DELETE /users/{id}`
- `GET /users/{id}/tasks`

### 11.3 Teams

- `GET /teams`
- `POST /teams`
- `GET /teams/{id}`
- `PATCH /teams/{id}`
- `DELETE /teams/{id}`
- `GET /teams/{id}/members`
- `POST /teams/{id}/members`
- `DELETE /teams/{id}/members/{userId}`

### 11.4 Projects

- `GET /projects`
- `POST /projects`
- `GET /projects/{id}`
- `PATCH /projects/{id}`
- `DELETE /projects/{id}`
- `GET /projects/{id}/tasks`

### 11.5 Tasks

- `GET /tasks`
- `POST /tasks`
- `GET /tasks/{id}`
- `PATCH /tasks/{id}`
- `PATCH /tasks/{id}/status`
- `DELETE /tasks/{id}`
- `GET /tasks/{id}/comments`
- `POST /tasks/{id}/comments`
- `GET /tasks/{id}/attachments`
- `POST /tasks/{id}/attachments`

### 11.6 Collaboration

- `PATCH /comments/{id}`
- `DELETE /comments/{id}`
- `GET /attachments/{id}`
- `DELETE /attachments/{id}`

### 11.7 Notifications

- `GET /notifications`
- `PATCH /notifications/{id}/read`
- `PATCH /notifications/read-all`

### 11.8 AI

- `POST /ai/projects/{projectId}/summary`
- `POST /ai/projects/{projectId}/weekly-report`
- `POST /ai/projects/{projectId}/task-breakdown`
- `POST /ai/tasks/{taskId}/next-actions`

### 11.9 API Contract Examples

Login response:

```json
{
  "user": {
    "id": "uuid",
    "name": "Dian",
    "email": "dian@example.com",
    "role": "PROJECT_MANAGER"
  },
  "accessToken": "jwt-access-token"
}
```

Refresh response:

```json
{
  "accessToken": "jwt-access-token"
}
```

Paginated response:

```json
{
  "data": [],
  "pagination": {
    "page": 0,
    "size": 10,
    "totalElements": 0,
    "totalPages": 0
  }
}
```

Error response:

```json
{
  "timestamp": "2026-01-01T10:00:00Z",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "path": "/api/v1/tasks",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

Create project request:

```json
{
  "name": "Smart Inventory Dashboard",
  "description": "Internal dashboard for inventory visibility",
  "teamId": "uuid",
  "ownerId": "uuid"
}
```

Create task request:

```json
{
  "title": "Design stock movement API",
  "description": "Create endpoint contract and implementation plan",
  "projectId": "uuid",
  "assigneeId": "uuid",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-01-15"
}
```

AI response:

```json
{
  "result": "Project is on track with two high-priority risks.",
  "metadata": {
    "feature": "PROJECT_SUMMARY",
    "projectId": "uuid",
    "model": "configured-model"
  }
}
```

Upload request:

```text
POST /api/v1/tasks/{taskId}/attachments
Content-Type: multipart/form-data

file=<binary>
```

## 12. Non-Functional Requirements

### 12.1 Security

- Password hashing menggunakan BCrypt atau Argon2.
- JWT access token memiliki expiry singkat.
- Refresh token dikirim melalui HttpOnly cookie.
- Refresh token disimpan dalam bentuk hash di database dan dapat dicabut.
- Semua endpoint protected harus memvalidasi authentication dan authorization.
- Validasi request menggunakan Bean Validation.
- Jangan log password, token, atau API key.
- AI prompt tidak boleh mengirim secret atau data sensitif yang tidak diperlukan.

### 12.2 Performance

- Pagination wajib untuk endpoint list.
- Index database untuk foreign key, email, task status, priority, assignee, dan project.
- Hindari N+1 query pada relasi utama.
- Response list endpoint target di bawah 300 ms untuk dataset kecil-menengah di local demo.

### 12.3 Reliability

- Database migration dapat dijalankan otomatis saat startup local.
- Transaction boundary jelas di service layer.
- Error response konsisten.
- Health check tersedia di `/actuator/health`.

### 12.4 Observability

- Expose health check dengan Spring Boot Actuator.
- Log request penting dan business error.
- Gunakan correlation/request id jika sempat.
- Jika AI request audit dibuat, simpan minimal: user, feature, project/task id, timestamp, dan status.

### 12.5 Deployment

- Aplikasi dapat dijalankan lokal dengan Docker Compose.
- Backend production dapat dijalankan sebagai web service di Render, Railway, atau VPS Sumopod.
- Frontend React production ditargetkan deploy ke Vercel.
- Database production memakai Supabase Postgres.
- File storage production memakai Cloudflare R2.
- Environment variable minimal:
  - `PORT`
  - `SPRING_PROFILES_ACTIVE`
  - `DATABASE_URL`
  - `DATABASE_USERNAME`
  - `DATABASE_PASSWORD`
  - `JWT_SECRET`
  - `COOKIE_DOMAIN`
  - `CORS_ORIGINS`
  - `AI_API_KEY`
  - `AI_BASE_URL`
  - `AI_MODEL`
  - `STORAGE_DRIVER`
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET`
  - `R2_ENDPOINT`
  - `R2_SIGNED_URL_TTL_SECONDS`
  - `LOCAL_STORAGE_PATH`
  - `VITE_API_URL`

## 13. Frontend Requirements

Frontend utama menggunakan aplikasi existing di `../project-manager-fe`. Frontend tersebut sudah menggunakan React TypeScript, Vite, Zustand, Axios, Tailwind CSS, protected route, auth flow, user/team/task/project services, notification, dan kanban board drag-and-drop.

### 13.1 Frontend Reuse Strategy

- Jangan membuat frontend baru dari nol.
- Gunakan `../project-manager-fe` sebagai demo UI untuk backend Spring Boot.
- Pertahankan struktur service layer agar integrasi API mudah diuji.
- Pastikan `VITE_API_URL` dapat diarahkan ke backend Spring Boot.
- Pastikan auth flow tetap memakai access token di memory dan refresh token via HttpOnly cookie.
- Pertahankan route dan screen yang sudah ada selama masih cocok dengan domain.

### 13.2 Required Frontend Improvements

- Ganti README template Vite menjadi README portfolio.
- Ubah dashboard hardcoded menjadi dashboard berbasis data API.
- Tambahkan project overview: total task, done task, overdue task, high-priority task, dan recent activity.
- Tambahkan AI assistant panel di project board/detail.
- Tambahkan role-based UI visibility untuk tombol create, update, delete, assign, dan admin menu.
- Tambahkan empty state, loading state, error state, dan success/error toast.
- Ganti `window.confirm` dengan reusable confirmation dialog.
- Pastikan tampilan responsif untuk desktop dan mobile.
- Tambahkan screenshot demo ke README.
- Tambahkan Dockerfile frontend dan integrasikan dengan Docker Compose portfolio.

### 13.3 Existing Screens to Keep

- Login.
- Register.
- Profile.
- Dashboard.
- Admin users.
- Admin teams.
- Project board.
- Task list.
- Task detail dialog.
- Notification bell.

### 13.4 New or Improved Screens

- Dashboard with real metrics.
- Project detail summary.
- AI assistant panel.
- AI output history atau recent AI reports.
- Better empty state for projects, tasks, comments, attachments, and notifications.

### 13.5 Frontend API Compatibility

Frontend dan backend harus sepakat pada kontrak berikut:

- Base URL menggunakan `VITE_API_URL`.
- API base path menggunakan `/api/v1`.
- JSON field menggunakan `camelCase`.
- Login response mengandung `user` dan `accessToken`.
- Refresh endpoint mengembalikan `accessToken`.
- Refresh token dikirim melalui HttpOnly cookie.
- Error response konsisten dan dapat ditampilkan oleh frontend.
- Pagination response menggunakan format `data` dan `pagination`.

### 13.6 Frontend AI Features

AI assistant panel minimal memiliki:

- Button `Generate Summary`.
- Button `Generate Weekly Report`.
- Button `Suggest Next Actions`.
- Loading state saat AI request berjalan.
- Error state saat AI gagal.
- Output area yang mudah dibaca.
- Copy-to-clipboard untuk hasil AI.

## 14. Portfolio Deliverables

Wajib:

- GitHub repository untuk backend Spring Boot.
- Frontend repository atau folder reference ke `../project-manager-fe`.
- README backend berbahasa Inggris.
- README frontend berbahasa Inggris.
- Architecture diagram.
- Database schema diagram.
- API documentation.
- Docker Compose setup untuk backend, frontend, dan PostgreSQL.
- Production deployment guide untuk backend di Render/Railway/VPS Sumopod, frontend di Vercel, Supabase Postgres, dan Cloudflare R2.
- Seed data.
- Screenshots.
- Demo video singkat 2-5 menit.

README harus menjelaskan:

- Problem statement.
- Features.
- Tech stack.
- How to run.
- Demo accounts.
- API documentation URL.
- AI features.
- Frontend integration guide.
- Environment variables for backend and frontend.
- Testing strategy.
- Future improvements.

## 15. Milestones

### Milestone 1: Backend Foundation

- Spring Boot project setup.
- PostgreSQL config.
- Flyway migration.
- Base entity, exception handler, response wrapper.
- Health check.

### Milestone 2: Auth and User

- Register/login/refresh/logout.
- JWT security filter.
- User CRUD.
- Role-based access control.

### Milestone 3: Project Core

- Team CRUD.
- Team member management.
- Project CRUD.
- Single-team project assignment melalui `project.teamId`.

### Milestone 4: Task and Collaboration

- Task CRUD.
- Single assignee task assignment melalui `task.assigneeId`.
- Comments.
- Multipart attachment upload ke Cloudflare R2 di production dan local storage fallback untuk development.
- Notifications.

### Milestone 5: AI Assistant

- AI provider client.
- Project summary.
- Weekly report.
- Task breakdown.
- Next action suggestion.
- Optional AI request audit.

### Milestone 6: Frontend Integration

- Point `../project-manager-fe` ke backend Spring Boot via `VITE_API_URL`.
- Audit semua service frontend terhadap endpoint Spring Boot.
- Sesuaikan auth login, refresh, logout, dan protected route.
- Sesuaikan pagination dan error response handling.
- Tambahkan AI assistant panel.
- Tambahkan Dockerfile frontend.
- Pastikan full demo berjalan dari browser.

### Milestone 7: Portfolio Polish

- Swagger/OpenAPI.
- Docker Compose untuk backend, frontend, dan PostgreSQL.
- Backend deploy ke minimal satu target production: Render Web Service, Railway, atau VPS Sumopod.
- Frontend deploy ke Vercel dengan `VITE_API_URL` production.
- Supabase Postgres connection dan migration berjalan.
- Cloudflare R2 upload/download/delete attachment berjalan.
- Unit and integration tests.
- Backend README.
- Frontend README update.
- Dashboard data real.
- Role-based frontend UI.
- Screenshots/demo video.

## 16. Acceptance Criteria

- Developer can run the project with `docker compose up`.
- Docker Compose starts PostgreSQL, Spring Boot backend, and React frontend.
- Production demo can run with backend on Render/Railway/VPS Sumopod, frontend on Vercel, Supabase Postgres, and Cloudflare R2.
- React frontend can login against Spring Boot backend.
- Backend exposes Swagger/OpenAPI documentation.
- Auth flow works end-to-end.
- RBAC blocks unauthorized actions.
- CRUD flows work for user, team, project, task, comment, attachment, and notification.
- List endpoints support pagination and filtering.
- Dashboard displays real data from backend.
- Project board displays and updates real task data from backend.
- Frontend hides or disables actions based on user role.
- AI assistant can generate at least one project summary from real database data.
- AI assistant can be used from the frontend project screen.
- Test suite passes locally.
- Backend and frontend README explain the project clearly in English.
- Repository looks portfolio-ready for Java & AI Developer applications.

## 17. Suggested Demo Scenario

1. Login as Project Manager.
2. Create a project named `Smart Inventory Dashboard`.
3. Assign a team to the project.
4. Create several tasks with different statuses and priorities.
5. Assign tasks to team members.
6. Add comments to one task.
7. Open project detail.
8. Use AI assistant to generate project summary.
9. Use AI assistant to generate weekly report.
10. Copy AI output from the frontend.
11. Show Swagger documentation.
12. Show Docker Compose setup for frontend, backend, and database.

## 18. Future Improvements

- WebSocket for live task updates.
- Advanced kanban board filters and saved views.
- Advanced analytics dashboard.
- RAG from project documents.
- Advanced storage features: lifecycle policy, virus scanning, and CDN/private bucket hardening.
- CI/CD with GitHub Actions.
- Multi-platform deployment parity across Render, Railway, and VPS Sumopod.
- Microservices split after monolith is stable.
