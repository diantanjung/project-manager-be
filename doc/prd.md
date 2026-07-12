# Product Requirements Document — Project Manager

> Status: dokumentasi hasil reverse-engineering kode backend  
> Versi: 1.1  
> Tanggal analisis: 10 Juli 2026  
> Referensi implementasi: `src/routes`, `src/controllers`, `src/services`, `src/schemas`, dan `src/db/schema.ts`

## 1. Ringkasan Produk

Project Manager adalah aplikasi kolaborasi untuk mengelola pengguna, tim, proyek, dan task. Sistem mendukung alur kerja task bergaya Kanban, pembagian peran, komentar, attachment berbasis URL, multi-assignee, dan notifikasi.

Backend dibangun dengan Express 5, TypeScript, PostgreSQL, Drizzle ORM, Zod, JWT, dan Swagger. Frontend terkait berada di `../project-manager-fe`.

## 2. Masalah yang Diselesaikan

Tim membutuhkan satu tempat untuk:

- menyusun organisasi pengguna ke dalam tim;
- membuat proyek dan menugaskan satu atau lebih tim;
- merencanakan serta memantau task dari backlog sampai selesai;
- menentukan penanggung jawab utama dan assignee tambahan;
- berkolaborasi melalui komentar, mention, dan attachment;
- menerima notifikasi atas assignment dan mention;
- membatasi tindakan berdasarkan tanggung jawab pengguna.

## 3. Tujuan Produk

1. Menyediakan sumber data terpusat untuk proyek dan task.
2. Memperjelas ownership melalui role, team membership, project owner, dan assignee.
3. Mendukung visibilitas progres melalui status, prioritas, due date, dan posisi task.
4. Mempermudah kolaborasi kontekstual di dalam task.
5. Menjaga akses administratif menggunakan autentikasi dan RBAC.

## 4. Persona dan Hak Akses

Hierarki role global, dari terendah ke tertinggi:

| Role | Kebutuhan utama | Hak utama saat ini |
|---|---|---|
| `teamMember` | Mengerjakan dan memantau task | Membaca seluruh resource, mengubah task/status, mengelola komentar dan attachment milik sendiri, memperbarui profil sendiri |
| `projectManager` | Mengatur pelaksanaan proyek | Semua hak team member; membuat/mengubah proyek dan task; mengelola anggota tim, assignee tambahan, dan team assignment proyek |
| `productOwner` | Mengatur portofolio dan struktur tim | Semua hak project manager; membuat/mengubah tim; menghapus proyek dan project-team assignment |
| `admin` | Administrasi sistem | Semua hak; membuat/menghapus user dan menghapus tim |

Team membership juga memiliki role lokal `owner`, `admin`, atau `member`, tetapi implementasi saat ini belum memakai role lokal tersebut untuk otorisasi.

## 5. Cakupan Fitur Saat Ini

### 5.1 Autentikasi dan sesi

- Registrasi user publik dengan role default `teamMember`.
- Login menggunakan email dan password.
- Access token JWT dikirim melalui response body.
- Refresh token disimpan dalam cookie `HttpOnly`, di-hash di database, berlaku default sesuai konfigurasi, dan dirotasi saat refresh.
- Logout mencabut refresh token aktif dan menghapus cookie.

### 5.2 Manajemen user

- Daftar user dengan pagination, pencarian, dan sorting.
- Detail user.
- Pembuatan dan penghapusan user oleh admin.
- Pembaruan profil oleh user sendiri atau minimal project manager.
- Daftar task yang dibuat atau menjadi primary assignment user.
- Avatar disimpan sebagai URL; file avatar dapat diunggah ke penyimpanan lokal.

### 5.3 Manajemen tim

- CRUD tim dengan RBAC.
- Daftar tim dengan pagination.
- Menambah, melihat, dan menghapus anggota tim.
- Role anggota tim: `owner`, `admin`, `member`.

### 5.4 Manajemen proyek

- CRUD proyek dengan primary team dan owner.
- Daftar proyek dengan pagination, pencarian, filter tim, dan sorting.
- Melihat task pada proyek.
- Menambahkan tim lain ke proyek melalui project-team assignment.

### 5.5 Manajemen task

- CRUD task.
- Workflow status: `backlog` → `todo` → `in_progress` → `review` → `done`.
- Priority: `low`, `medium`, `high`, `urgent`.
- Primary assignee wajib, assignee tambahan opsional.
- Due date dan `position` untuk pengurutan pada board.
- Daftar task mendukung pagination, pencarian, filter proyek/status/prioritas/assignee, serta sorting.
- Detail task menyertakan komentar dan attachment.

### 5.6 Kolaborasi

- Komentar per task.
- Author dapat mengubah atau menghapus komentarnya sendiri.
- Mention dengan pola `@name` membuat notifikasi bagi user yang namanya cocok persis.
- Metadata attachment dicatat pada task; hanya uploader yang dapat menghapusnya.

### 5.7 Notifikasi

- Tipe: `task_assigned`, `mention`, `system_alert`.
- Daftar notifikasi user, terbaru lebih dulu.
- Menandai satu atau semua notifikasi sebagai telah dibaca.
- Assignment tambahan menghasilkan notifikasi `task_assigned`.
- Mention dalam komentar menghasilkan notifikasi `mention`.

## 6. Alur Pengguna Utama

### 6.1 Menyiapkan proyek

1. Admin membuat user yang diperlukan.
2. Product owner membuat tim.
3. Project manager menambahkan user sebagai anggota tim.
4. Project manager membuat proyek dengan primary team; pembuat menjadi owner.
5. Project manager dapat menambahkan tim pendukung.

### 6.2 Menjalankan pekerjaan

1. Project manager membuat task dan menetapkan primary assignee.
2. Project manager dapat menambahkan assignee lain.
3. User mengubah status task mengikuti progres pekerjaan.
4. User berdiskusi melalui komentar, mention, dan attachment.
5. User memantau notifikasi serta menandainya telah dibaca.

## 7. Aturan Bisnis yang Terimplementasi

- Email user unik.
- Password minimal 6 karakter dan disimpan sebagai bcrypt hash.
- Nama user, tim, proyek, dan judul task minimal 2 karakter.
- Project selalu memiliki satu primary team dan satu owner.
- Task selalu memiliki project, creator, dan primary assignee.
- User tidak dapat ditambahkan dua kali ke tim yang sama.
- Team tidak dapat ditambahkan dua kali sebagai additional team proyek.
- User tidak dapat ditambahkan dua kali sebagai additional assignee task.
- Komentar hanya dapat diubah/dihapus oleh author.
- Attachment hanya dapat dihapus oleh uploader.
- Pagination default `page=1`, `limit=10`; limit maksimum 100 pada endpoint yang divalidasi.

## 8. Model Domain

| Entitas | Relasi penting |
|---|---|
| User | memiliki refresh token, team membership, komentar, task, dan notifikasi |
| Team | memiliki anggota; menjadi primary team atau additional team proyek |
| Project | dimiliki user; memiliki primary team, additional teams, dan task |
| Task | berada di proyek; memiliki creator, primary assignee, additional assignees, komentar, dan attachment |
| Notification | dimiliki recipient; opsional terkait actor dan task |

Catatan: beberapa foreign key belum mendefinisikan cascade delete. Penghapusan parent yang masih direferensikan dapat gagal pada level database.

## 9. Non-Functional Requirements Saat Ini

- API berbasis JSON melalui prefix `/api`.
- API versi baru tersedia melalui prefix `/api/v1`; prefix lama `/api` tetap dipertahankan untuk kompatibilitas.
- Endpoint terproteksi memakai `Authorization: Bearer <accessToken>`.
- Refresh cookie memerlukan CORS credentials.
- Security header menggunakan Helmet.
- Swagger tersedia hanya saat `NODE_ENV !== production`.
- Upload avatar menerima MIME `image/*`, maksimum 5 MB.
- Health check tersedia di `/health`.
- Unit test tersedia pada service dan controller.

## 10. Batasan dan Temuan Implementasi

1. **Scope user dan tim masih terlalu luas.** Project/task sudah dibatasi berbasis akses, tetapi semua user terautentikasi masih dapat membaca daftar user dan tim.
2. **Otorisasi task sudah resource-scoped, tetapi belum granular per field.** Creator, assignee, additional assignee, dan user yang punya akses proyek dapat mengubah task; belum ada pemisahan field khusus untuk status-only vs metadata task.
3. **Registrasi publik tidak memiliki verifikasi email atau approval.**
4. **Forgot/reset password, verifikasi email, logout all devices, dan rate limiting login belum tersedia.**
5. **Response envelope dan error domain belum konsisten.** Sebagian endpoint mengembalikan object/array langsung, sedangkan notifikasi memakai `{ success, data }`; sebagian constraint database berakhir sebagai HTTP 500.
6. **Attachment API hanya menyimpan metadata URL.** Upload route yang ada khusus field `avatar` dan penyimpanan lokal, belum menjadi upload attachment terpadu.
7. **Mention berbasis nama tidak stabil.** Nama tidak unik, regex hanya menangkap karakter `\w`, dan mention pada edit komentar tidak diproses ulang.
8. **Primary assignee dan additional assignees adalah dua mekanisme terpisah**, sehingga query “task user” dan notifikasi assignment belum konsisten.
9. **Tidak ada audit log**, activity history, password reset, maupun revocation semua sesi.
10. **Tidak ada unique constraint database** untuk membership dan assignment; pengecekan duplikasi di service rentan race condition.
11. **Role lokal tim baru dipakai untuk pembuatan proyek pada primary team**, belum untuk seluruh operasi dalam scope tim.

## 11. Fitur Utama yang Direkomendasikan

### P0 — Keamanan dan konsistensi akses

Status implementasi per 10 Juli 2026: **sebagian besar fondasi backend selesai; beberapa item session/API hardening masih tersisa.**

**A. Resource-scoped authorization**

- Implemented: daftar/detail proyek dibatasi berdasarkan project owner, primary team membership, atau additional team membership; `admin` dan `productOwner` tetap memiliki akses global.
- Implemented: daftar/detail task dibatasi berdasarkan akses proyek, creator, primary assignee, atau additional assignee.
- Implemented: update status/update/delete task melakukan pre-check akses; user di luar scope menerima 404.
- Implemented: pembuatan proyek oleh `projectManager` dibatasi ke tim tempat user memiliki role lokal `owner` atau `admin`; `productOwner`/`admin` dapat membuat proyek lintas tim.
- Remaining: role lokal tim belum diterapkan untuk semua operasi tim/project-team; endpoint user dan team belum resource-scoped.
- Acceptance criteria saat ini: user di luar proyek tidak melihat project/task pada endpoint list dan menerima 404 saat membaca/mengubah resource tersebut.

**B. Perbaikan user dan session management**

- Implemented: create/update user menerima `role` eksplisit, dan perubahan role hanya dapat dilakukan admin.
- Implemented: create, list, detail, update, dan delete user mengembalikan field aman tanpa `password`.
- Implemented: access token baru memuat `role` untuk mendukung authorization context.
- Remaining: forgot/reset password, verifikasi email, logout all devices, audit perubahan role, dan rate limiting login belum tersedia.
- Acceptance criteria saat ini: response user tidak memuat `password`; perubahan role terlindungi admin-only.

**C. Standardisasi API**

- Implemented: duplicate team membership, task assignment, dan project-team assignment mengembalikan `409 Conflict`.
- Implemented: route versi `/api/v1` tersedia, sementara `/api` tetap aktif sebagai alias kompatibilitas.
- Remaining: response envelope, error code, pagination, dan validation error belum distandardisasi menyeluruh.

### P1 — Nilai produk inti

**D. Activity history dan audit log**

- Rekam perubahan status, assignee, priority, due date, komentar, dan attachment.
- Tampilkan timeline pada detail task.
- Acceptance criteria: setiap perubahan penting mempunyai actor, timestamp, before, dan after.

**E. Board Kanban yang kuat**

- Endpoint reorder/bulk update yang atomik untuk `status` dan `position`.
- Optimistic concurrency agar drag-and-drop bersamaan tidak saling menimpa.
- Filter tersimpan dan board per proyek.

**F. Task hierarchy dan dependency**

- Subtask/checklist, dependency `blocked_by`, label, estimate, dan milestone/sprint.
- Cegah task ditandai selesai bila dependency wajib belum selesai.
- Sajikan progres proyek dari penyelesaian task/subtask.

**G. Unified assignment**

- Jadikan assignment sebagai satu model yang konsisten, dengan penanda primary assignee.
- Kirim notifikasi saat primary maupun additional assignment berubah.
- Query “My Tasks” mencakup seluruh jenis assignment.

**H. Attachment upload terpadu**

- Multipart upload attachment dengan object storage, validasi MIME/ukuran, signed URL, dan penghapusan file fisik.
- Batasi akses download berdasarkan akses ke task.

### P2 — Kolaborasi dan insight

**I. Notifikasi real-time dan preferensi**

- WebSocket/SSE, unread count, pagination, delete/archive, dan preferensi per tipe.
- Deep link ke task yang terkait.

**J. Mention yang andal**

- Mention menggunakan immutable user ID, autocomplete, dan dukungan display name dengan spasi.
- Proses perubahan mention saat komentar diedit.

**K. Dashboard dan reporting**

- Ringkasan overdue, workload per anggota, cycle time, throughput, serta status proyek.
- Export CSV dan filter rentang tanggal.

## 12. Prioritas Roadmap

| Fase | Fokus | Outcome |
|---|---|---|
| 1 | P0: authorization, user/session security, API consistency | Sistem aman untuk penggunaan multi-team |
| 2 | P1: audit trail, Kanban reorder, unified assignment | Workflow harian stabil dan dapat ditelusuri |
| 3 | P1: hierarchy/dependency, attachment upload | Perencanaan dan kolaborasi lebih lengkap |
| 4 | P2: real-time notification, dashboard/reporting | Visibilitas operasional dan engagement meningkat |

## 13. Metrik Keberhasilan yang Disarankan

- Persentase task aktif dengan assignee, priority, dan due date lengkap.
- Median waktu dari `todo` ke `done`.
- Jumlah task overdue dan tren penyelesaiannya.
- Weekly active users dan project active users.
- Waktu respons komentar/mention.
- Error rate API, p95 latency, serta jumlah 401/403/500.
- Tidak ada kebocoran resource lintas tim pada automated authorization test.

## 14. Di Luar Cakupan Implementasi Saat Ini

- Billing/subscription dan multi-tenant organization.
- Calendar/Gantt view.
- Integrasi GitHub/GitLab, Slack, email, atau webhook.
- Time tracking.
- Offline mode.
- Mobile push notification.

Item tersebut dapat dievaluasi setelah fitur P0–P1 stabil.
