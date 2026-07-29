# API Contract - Project Manager

> Shared contract untuk implementasi backend Node.js, Laravel, dan Golang.  
> Dokumen ini mendeskripsikan target API product, bukan snapshot runtime Node.js lama.  
> Base URL lokal: `http://localhost:<PORT>`  
> API prefix utama: `/api/v1`

API contract dipecah menjadi beberapa file kecil agar review dan implementasi lebih fokus.

| Dokumen | Isi |
| --- | --- |
| [Konvensi, Enum, dan Model](api-contract/01-conventions-models.md) | Auth, envelope, error, enum, dan tipe response |
| [Auth, Users, dan Profile](api-contract/02-auth-users-profile.md) | Session, user CRUD, profile, avatar, dan user tasks |
| [Teams dan Projects](api-contract/03-teams-projects.md) | Team/member, project, sidebar project, summary, dan project-team |
| [Tasks, Comments, dan Attachments](api-contract/04-tasks-collaboration.md) | Task board/list, reorder, komentar, mention, upload/download attachment |
| [Notifications, Dashboard, Activity, Export, Webhook](api-contract/05-insights-automation.md) | Notification bell, dashboard summary, audit/activity, export, webhook |
| [Utility dan Implementation Status](api-contract/06-utility-status.md) | Health, Swagger, status matrix, dan perbedaan Node.js legacy |

## Status Contract

- `MVP`: dibutuhkan oleh frontend React saat ini atau fondasi utama backend.
- `P1`: peningkatan workflow inti setelah MVP stabil.
- `P2`: insight, realtime, integrasi, atau polish lanjutan.
- `Legacy Node.js`: behavior runtime Node.js lama yang masih perlu dimigrasikan menuju target contract.

Gunakan file modular di atas sebagai acuan detail endpoint, payload, response, authorization, dan gap implementasi.
