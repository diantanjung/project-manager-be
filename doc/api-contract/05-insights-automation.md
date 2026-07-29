# Notifications, Dashboard, Activity, Export, Webhook

> Bagian dari [API Contract](../api_contract.md).

## Notifications

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/notifications` | Bearer | MVP |
| `PATCH /api/v1/notifications/{notification}/read` | Owner | MVP |
| `PATCH /api/v1/notifications/read-all` | Bearer | MVP |

### `GET /api/v1/notifications`

Query: `page`, `limit`, `unreadOnly`, `type`.

Target response:

```json
{
  "data": [
    {
      "id": 1,
      "recipientId": 2,
      "actorId": 3,
      "actorName": "Project Manager",
      "actorAvatarUrl": null,
      "type": "mention",
      "taskId": 10,
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-07-29T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "meta": {
    "unreadCount": 1
  }
}
```

Legacy Node.js response:

```json
{
  "success": true,
  "count": 1,
  "data": []
}
```

Migration note: frontend notification bell needs unread count; `count` should not mean unread unless explicitly documented.

## Dashboard

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/dashboard` | Bearer/scoped | MVP |

Response `200`:

```json
{
  "totalActiveProjects": 3,
  "taskCountPerStatus": {
    "backlog": 2,
    "todo": 8,
    "in_progress": 4,
    "review": 3,
    "done": 15
  },
  "activeProgress": {
    "doing": 4,
    "todo": 8,
    "total": 12,
    "ratio": 0.3333,
    "percentage": 33.33
  },
  "inReview": 3,
  "dueSoon": 5,
  "overdue": 2,
  "overdueTaskCount": 2,
  "workloadPerMember": {
    "1": 7
  },
  "recentlyUpdatedTasks": [],
  "recentTasks": [],
  "upcomingDeadlines": [],
  "highPriorityTasks": [],
  "latestUpdates": []
}
```

Notes:

- Scoped to authenticated user's visible projects/tasks.
- `activeProgress.doing` counts `in_progress`.
- `activeProgress.todo` counts `todo`.
- `activeProgress.total = todo + doing`.
- `activeProgress.ratio = doing / total`, rounded to 4 decimals; `0` when total is 0.
- `activeProgress.percentage` rounded to 2 decimals.
- `dueSoon` counts not-done tasks due from today through the next 7 days.
- `overdue` counts not-done tasks due before today.
- `overdueTaskCount` is compatibility alias for `overdue`.
- `recentTasks`, `upcomingDeadlines`, and `highPriorityTasks` contain max 5 task response items.
- `latestUpdates` contains max 5 activity log items or `[]` until activity log exists.

## Activity Logs

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/activity-logs` | Scoped role | P1 |
| `GET /api/v1/projects/{project}/activity` | ProjectManager+ scoped | P1 |
| `GET /api/v1/tasks/{task}/activity` | Scoped | P1 |

Activity log item:

```json
{
  "id": 1,
  "actorId": 2,
  "entityType": "Task",
  "entityId": 11,
  "action": "task.status_updated",
  "before": {
    "status": "todo"
  },
  "after": {
    "status": "in_progress"
  },
  "ipAddress": null,
  "userAgent": null,
  "createdAt": "2026-07-29T00:00:00.000Z",
  "actor": {}
}
```

## Export

| Endpoint | Auth | Target |
| --- | --- | --- |
| `POST /api/v1/exports/project-report` | ProjectManager+ scoped | P1 |
| `GET /api/v1/exports/{export}` | Owner/scoped | P1 |

Export supports CSV project report and task list. Large exports may be async jobs.

## Webhook

| Endpoint | Auth | Target |
| --- | --- | --- |
| `GET /api/v1/webhook-endpoints` | Admin | P1 |
| `POST /api/v1/webhook-endpoints` | Admin | P1 |
| `PATCH /api/v1/webhook-endpoints/{webhookEndpoint}` | Admin | P1 |
| `DELETE /api/v1/webhook-endpoints/{webhookEndpoint}` | Admin | P1 |
| `GET /api/v1/webhook-deliveries` | Admin | P1 |

Webhook payload dikirim via queue job, ditandatangani dengan HMAC secret, dan delivery gagal dapat di-retry.
