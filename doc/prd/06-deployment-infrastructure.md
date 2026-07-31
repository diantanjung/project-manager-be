# Deployment dan Infrastructure

> Bagian dari [PRD: Project Manager](../prd.md).

## 1. Target Platform

Target deployment portfolio harus mendukung konfigurasi berikut:

| Area | Target utama | Alternatif |
| --- | --- | --- |
| Backend API | Render Web Service | Railway atau VPS Sumopod |
| Frontend React | Vercel | Static hosting lain bila diperlukan |
| Database | Supabase Postgres | PostgreSQL managed/self-hosted compatible |
| File storage | Cloudflare R2 | S3-compatible object storage |

Backend tetap harus bisa berjalan lokal dengan Docker Compose untuk demo dan development.

## 2. Backend Deployment

Backend API harus dapat dijalankan sebagai long-running web service.

Requirement:

- Service membaca port dari environment variable `PORT` bila disediakan platform.
- Service expose health check public di `/health` dan/atau `/api/v1/health`.
- Service tidak bergantung pada local filesystem untuk data permanen selain temporary upload staging.
- Secret dan credential hanya berasal dari environment variable atau secret manager platform.
- Build/start command harus terdokumentasi untuk Render, Railway, dan VPS Sumopod.
- Dockerfile disediakan untuk deployment container dan VPS.

Platform notes:

- Render Web Service dapat memakai Docker atau native runtime dan health check path.
- Railway dapat memakai Dockerfile atau native build/start command dengan environment variable.
- VPS Sumopod menggunakan Docker Compose atau system service yang menjalankan container backend.

## 3. Frontend Deployment

Frontend React TypeScript Vite ditargetkan deploy ke Vercel.

Requirement:

- Build command: `npm run build`.
- Output directory: `dist`.
- API base URL dibaca dari `VITE_API_URL`.
- Production `VITE_API_URL` mengarah ke backend public HTTPS.
- Auth flow dengan refresh token cookie membutuhkan CORS credentials dan cookie config yang cocok lintas domain.

## 4. Database

Database production target memakai Supabase Postgres.

Requirement:

- Backend memakai `DATABASE_URL` untuk koneksi Postgres.
- Migration harus dapat dijalankan terhadap Supabase Postgres sebelum/ketika release.
- Connection pooling harus dipertimbangkan untuk platform serverless/managed; gunakan connection string pooled bila runtime atau platform membutuhkan.
- Database schema tetap portable PostgreSQL dan tidak bergantung pada fitur Supabase Auth/Storage untuk MVP.
- Backup, restore, dan migration rollback minimal terdokumentasi.

## 5. Storage

Attachment dan avatar production target memakai Cloudflare R2.

Requirement:

- Backend menyimpan object ke R2 melalui API S3-compatible.
- Metadata file tetap disimpan di database: original name, mime type, size, uploader, related resource, `storageKey`, dan createdAt.
- Provider, bucket, endpoint, dan signed URL TTL tidak perlu disimpan per row untuk MVP; backend membacanya dari environment runtime.
- Download dapat dilakukan melalui backend proxy atau signed URL sementara.
- Delete attachment/avatar menghapus metadata dan object storage sesuai authorization.
- Local storage hanya boleh dipakai untuk development fallback, bukan production default.

## 6. Environment Variable

Backend minimal:

- `NODE_ENV` atau `SPRING_PROFILES_ACTIVE`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `REFRESH_TOKEN_COOKIE_NAME`
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

Frontend minimal:

- `VITE_API_URL`

Local-only fallback:

- `LOCAL_STORAGE_PATH`

## 7. Acceptance Criteria

- Backend berhasil deploy di minimal satu target: Render Web Service, Railway, atau VPS Sumopod.
- Frontend berhasil deploy di Vercel dan dapat login menggunakan backend production.
- Backend production tersambung ke Supabase Postgres dan migration berhasil dijalankan.
- Upload, download, dan delete attachment memakai Cloudflare R2 di production.
- Health check melaporkan status database dan storage.
- Dokumentasi README menjelaskan setup environment variable dan urutan deployment.
