# Utility dan Implementation Status

> Bagian dari [API Contract](../api_contract.md).

## Utility

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /health` | Public | MVP |
| `GET /api/v1/health` | Public | MVP |
| `GET /api-docs` | Public/non-production | Optional |
| `GET /api-docs.json` | Public/non-production | Optional |

Health response target:

```json
{
  "data": {
    "status": "ok",
    "timestamp": "2026-07-29T00:00:00.000Z",
    "database": "ok",
    "queue": "ok",
    "storage": "configured"
  }
}
```

Legacy Node.js `/health` response:

```json
{
  "status": "ok",
  "timestamp": "2026-07-29T00:00:00.000Z",
  "env": "development"
}
```

## Implementation Status Matrix

Status values: `planned`, `route exists`, `implemented`, `tested`.

| Area | Node.js | Laravel | Golang |
| --- | --- | --- | --- |
| `/api/v1` prefix | implemented | implemented | planned |
| `/api` compatibility alias | implemented | optional | optional |
| Response envelope `{ data }` | partial | partial | planned |
| Auth token rotation/hash | implemented | implemented | planned |
| `GET /auth/me` | planned | planned | planned |
| Users CRUD/profile | partial | planned | planned |
| User avatar upload scoped route | planned | planned | planned |
| Teams/member management | partial | route exists | planned |
| Projects CRUD | partial | route exists | planned |
| Project sidebar with `openTaskCount` | planned | implemented/target | planned |
| Project summary | planned | implemented/target | planned |
| Tasks board/list | partial | route exists | planned |
| Task reorder atomik | planned | planned | planned |
| Comments | partial | route exists | planned |
| Attachment multipart upload/download | planned | route exists | planned |
| Notifications unread count | partial | implemented/target | planned |
| Dashboard summary | planned | implemented/target | planned |
| Activity log | planned | planned | planned |
| Checklist | planned | planned | planned |
| Export/webhook | planned | planned | planned |
| RBAC/resource scope | partial | planned | planned |

## Legacy Node.js Differences

Implementasi Node.js legacy berbeda dari target contract:

- Banyak response masih object/array langsung, bukan `{ data }`.
- Notification memakai `{ success, count, data }`.
- Attachment API menyimpan metadata JSON dengan `fileUrl`, belum multipart upload/download.
- Avatar upload route legacy adalah `/api/v1/upload`, bukan `/api/v1/users/{user}/avatar`.
- Comment dan attachment belum selalu resource-scoped berdasarkan akses task.
- `GET /auth/me`, `/dashboard`, `/projects/sidebar`, `/projects/{id}/summary`, activity log, checklist, export, webhook belum tersedia di route Node.js legacy.
- Some request schemas prefer `camelCase`; frontend migration currently sends several `snake_case` aliases.
- Swagger lama dapat berbeda dari runtime behavior.

Perubahan Node.js berikutnya harus mengarah ke target contract di file modular ini.
