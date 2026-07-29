# Overview dan Scope

> Bagian dari [PRD: Project Manager](../prd.md).

## 1. Ringkasan Produk

Project Manager adalah aplikasi kolaborasi untuk mengelola user, team, project, task, komentar, attachment, notification, audit trail, dan dashboard operasional.

Frontend React/TypeScript di `../project-manager-fe` sudah menyediakan pengalaman TaskFlow dengan sidebar project, dashboard, project board, list task, admin management, profile, notification bell, dan task detail dialog. Backend Node.js harus menyediakan kontrak API yang konsisten untuk fitur tersebut sambil menjaga kompatibilitas bertahap dengan implementasi lama.

## 2. Masalah yang Diselesaikan

Tim membutuhkan satu tempat untuk:

- menyusun organisasi pengguna ke dalam tim;
- membuat proyek dan menugaskan satu atau lebih tim;
- merencanakan serta memantau task dari backlog sampai selesai;
- menentukan assignee, prioritas, due date, dan posisi board;
- berkolaborasi melalui komentar, mention, dan attachment;
- menerima notifikasi assignment dan mention;
- melihat ringkasan progres, deadline, workload, dan aktivitas terbaru;
- membatasi tindakan berdasarkan role, ownership, dan membership.

## 3. Tujuan Produk

1. Menyediakan sumber data terpusat untuk project dan task.
2. Memperjelas ownership melalui role global, team membership, project owner, creator, dan assignee.
3. Mendukung workflow harian melalui Kanban board, list view, search, filter, sort, pagination, dan drag-and-drop.
4. Mempermudah kolaborasi kontekstual di task detail melalui komentar dan attachment.
5. Memberikan operational visibility melalui dashboard summary dan activity/latest updates.
6. Menjaga keamanan administrative dengan authentication, RBAC, resource scope, dan response sanitization.

## 4. Persona

| Persona | Kebutuhan utama |
| --- | --- |
| `teamMember` | Melihat project/task yang relevan, memperbarui status task, komentar, upload attachment, menerima notifikasi |
| `projectManager` | Membuat project/task, mengatur assignee, memantau board/list, mengelola member pada scope team/project |
| `productOwner` | Mengelola portfolio project, team, priority, delivery visibility, dan reporting |
| `admin` | Mengelola user, role, team, permission, audit, dan konfigurasi sistem |

## 5. Scope MVP

- Authentication, refresh token cookie, logout, dan protected route support.
- User management untuk admin, termasuk search/filter/sort/pagination.
- Profile self-service untuk update name/email/avatar.
- Team management untuk admin/product owner dan member management.
- Project management, project sidebar, last-opened project redirect support, dan project summary.
- Task management dengan board/list view, search/filter/pagination, create/edit/delete, status move, priority, assignee, due date, dan attachment saat create.
- Task detail dengan komentar, attachment list, upload, download, delete milik sendiri, dan edit task.
- Notification list, unread count, mark one/read all.
- Dashboard summary: progress aktif, in review, due soon, overdue, recent tasks, upcoming deadlines, high-priority tasks, latest updates.
- Response envelope, error shape, pagination, dan resource-scoped access yang konsisten.

## 6. Non-Goals Saat Ini

- Native mobile app.
- Billing/subscription.
- Full multi-tenant organization model.
- Realtime collaborative editing.
- Public project portal untuk unauthenticated stakeholder.
