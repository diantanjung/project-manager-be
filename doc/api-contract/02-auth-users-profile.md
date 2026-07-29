# Auth, Users, dan Profile

> Bagian dari [API Contract](../api_contract.md).

## Auth

| Endpoint | Auth | Target |
| --- | --- | --- |
| `POST /api/v1/auth/register` | Public | MVP |
| `POST /api/v1/auth/login` | Public | MVP |
| `POST /api/v1/auth/refresh` | Public/cookie | MVP |
| `POST /api/v1/auth/logout` | Bearer | MVP |
| `GET /api/v1/auth/me` | Bearer | MVP |

### `POST /api/v1/auth/register`

```json
{
  "name": "Dian Tanjung",
  "email": "dian@example.com",
  "password": "secret123"
}
```

Response `201`:

```json
{
  "data": {
    "user": {},
    "accessToken": "<jwt>",
    "refreshToken": "<refresh-token>"
  }
}
```

### `POST /api/v1/auth/login`

```json
{
  "email": "dian@example.com",
  "password": "secret123"
}
```

Response `200`: sama seperti register.

### `POST /api/v1/auth/refresh`

Refresh token dibaca dari cookie `refreshToken`. Non-browser client boleh mengirim:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Response `200`:

```json
{
  "data": {
    "accessToken": "<new-jwt>",
    "refreshToken": "<new-refresh-token>"
  }
}
```

### `GET /api/v1/auth/me`

Response `200`:

```json
{
  "data": {
    "id": 1,
    "name": "Dian Tanjung",
    "email": "dian@example.com",
    "avatarUrl": null,
    "role": "admin"
  }
}
```

## Users dan Profile

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/users` | Bearer/Admin screen | MVP |
| `POST /api/v1/users` | Admin | MVP |
| `GET /api/v1/users/{user}` | Bearer/scoped | MVP |
| `PATCH /api/v1/users/{user}` | Self/Admin; role admin-only | MVP |
| `DELETE /api/v1/users/{user}` | Admin | MVP |
| `POST /api/v1/users/{user}/avatar` | Self/Admin | MVP |
| `GET /api/v1/users/{user}/tasks` | Self/Admin/scoped manager | MVP |

### `GET /api/v1/users`

Query: `page`, `limit`, `search`, `role`, `sortBy`, `order`.

Response `200`: paginated `User[]`.

### `POST /api/v1/users`

```json
{
  "name": "Jane Member",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "teamMember",
  "avatarUrl": null,
  "isActive": true
}
```

Response `201`: `{ "data": User }`.

### `PATCH /api/v1/users/{user}`

Self-update fields:

```json
{
  "name": "Jane Updated",
  "email": "jane.updated@example.com",
  "avatarUrl": "/uploads/avatar.png"
}
```

Admin-only fields:

```json
{
  "role": "projectManager",
  "isActive": true,
  "password": "newsecret"
}
```

Response `200`: `{ "data": User }`.

### `POST /api/v1/users/{user}/avatar`

`multipart/form-data`:

```text
avatar: <image/*, max configurable; legacy Node.js max 5 MB>
```

Response `200`:

```json
{
  "data": {
    "url": "/uploads/avatar-123.png"
  }
}
```

Compatibility note: legacy Node.js has `POST /api/v1/upload` with field `avatar`; target route is user-scoped.

### `GET /api/v1/users/{user}/tasks`

Query: `page`, `limit`, `status`, `priority`, `projectId`, `sortBy`, `order`.

Target behavior: mencakup task user sebagai creator, primary assignee, dan additional assignee.
