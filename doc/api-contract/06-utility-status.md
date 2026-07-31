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
    "storage": "configured",
    "deployment": {
      "backend": "render",
      "frontend": "vercel",
      "database": "supabase"
    }
  }
}
```

Deployment metadata values are optional and may be omitted when the runtime does not expose them. They are intended for diagnostics only and must not include secrets, connection strings, bucket names, bucket credentials, or private endpoint credentials.

## Deployment Runtime Contract

Target production topology:

| Area | Target |
| --- | --- |
| Backend API | Render Web Service, Railway, or VPS Sumopod |
| Frontend React | Vercel |
| Database | Supabase Postgres |
| Storage | Cloudflare R2 |

Backend environment variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | platform-dependent | Web service port, especially on Render/Railway. |
| `NODE_ENV` / `SPRING_PROFILES_ACTIVE` | yes | Runtime profile. |
| `DATABASE_URL` | yes | Supabase Postgres connection string or compatible Postgres URL. |
| `JWT_SECRET` | yes | Secret value, never committed. |
| `COOKIE_DOMAIN` | production | Needed when refresh cookie crosses frontend/backend domains. |
| `CORS_ORIGINS` | yes | Must include Vercel production/preview origins as needed. |
| `AI_API_KEY` | optional/MVP AI | Required only when AI features are enabled. |
| `AI_BASE_URL` | optional/MVP AI | OpenAI-compatible provider base URL. |
| `AI_MODEL` | optional/MVP AI | Model id. |
| `STORAGE_DRIVER` | yes | `r2` in production; `local` allowed for development. |
| `R2_ACCOUNT_ID` | production | Cloudflare account id. |
| `R2_ACCESS_KEY_ID` | production | Secret. |
| `R2_SECRET_ACCESS_KEY` | production | Secret. |
| `R2_BUCKET` | production | Bucket name. |
| `R2_ENDPOINT` | production | S3-compatible endpoint. |
| `R2_SIGNED_URL_TTL_SECONDS` | production | Short-lived download URL TTL. |
| `LOCAL_STORAGE_PATH` | development | Local fallback only. |

Frontend environment variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | yes | Public HTTPS backend base URL, including API host but not necessarily `/api/v1` if frontend service appends it. |

Cross-origin auth requirements:

- Backend CORS must allow configured Vercel origins and credentials.
- Refresh token cookie must use `HttpOnly`, `Secure`, and an appropriate `SameSite`/domain strategy for frontend/backend production domains.
- API clients must send credentials for refresh/logout flows when cookie auth is involved.

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
| Attachment multipart upload/download with R2 storage | planned | route exists | planned |
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
