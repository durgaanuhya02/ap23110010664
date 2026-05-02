# Campus Notifications Microservice — System Design

# Stage 1

## Overview

This document describes the REST API design and contract for a Campus Notification Platform where students receive real-time updates about Placements, Events, and Results.


## Core Actions the Notification Platform Should Support

1. Fetch all notifications for a logged-in student
2. Fetch a single notification by ID
3. Mark a notification as read
4. Mark all notifications as read
5. Delete a notification
6. Send a notification (admin/HR action)
7. Subscribe to real-time notifications (WebSocket)


## REST API Endpoints

### Base URL

/api/v1


### Authentication
All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

### 1. Get All Notifications for a Student

**GET** `/api/v1/notifications`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Query Parameters:**

| Parameter | Type    | Required | Description                              |
|-----------|---------|----------|------------------------------------------|
| page      | integer | No       | Page number for pagination (default: 1)  |
| limit     | integer | No       | Items per page (default: 20, max: 100)   |
| type      | string  | No       | Filter by type: Placement, Event, Result |
| isRead    | boolean | No       | Filter by read status                    |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
        "type": "Placement",
        "message": "CSX Corporation is hiring",
        "isRead": false,
        "createdAt": "2026-04-22T17:51:30Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized. Invalid or expired token."
}
```

---

### 2. Get a Single Notification by ID

**GET** `/api/v1/notifications/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
    "type": "Placement",
    "message": "CSX Corporation is hiring",
    "isRead": false,
    "createdAt": "2026-04-22T17:51:30Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Notification not found."
}
```

---

### 3. Mark a Notification as Read

**PATCH** `/api/v1/notifications/:id/read`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read.",
  "data": {
    "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
    "isRead": true,
    "updatedAt": "2026-04-22T18:00:00Z"
  }
}
```

---

### 4. Mark All Notifications as Read

**PATCH** `/api/v1/notifications/read-all`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read.",
  "data": {
    "updatedCount": 45
  }
}
```

---

### 5. Delete a Notification

**DELETE** `/api/v1/notifications/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully."
}
```

---

### 6. Send a Notification (Admin/HR)

**POST** `/api/v1/notifications`

**Headers:**
```json
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "type": "Placement",
  "message": "Google is hiring — apply by May 10th",
  "targetAudience": "all"
}
```

| Field          | Type   | Required | Values                         |
|----------------|--------|----------|--------------------------------|
| type           | string | Yes      | "Placement", "Event", "Result" |
| message        | string | Yes      | Notification content           |
| targetAudience | string | Yes      | "all" or specific student IDs  |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Notification sent successfully.",
  "data": {
    "id": "a1b2c3d4-0000-0000-0000-000000000001",
    "type": "Placement",
    "message": "Google is hiring — apply by May 10th",
    "createdAt": "2026-04-22T18:05:00Z"
  }
}
```

---

## Real-Time Notification Mechanism — WebSocket

For real-time delivery, the platform uses **WebSockets** via the `ws` protocol.

### Why WebSockets?
- Persistent, bidirectional connection — server can push notifications instantly
- Lower latency than polling
- Ideal for campus notifications where students are logged in on a dashboard

### WebSocket Endpoint
```
ws://<host>/ws/notifications
```

### Connection Flow

1. Client connects with a Bearer token as a query parameter:
   ```
   ws://<host>/ws/notifications?token=<bearer_token>
   ```
2. Server authenticates the token and registers the student's socket connection
3. When a new notification is created for that student, the server pushes it immediately

### Real-Time Push Payload (Server → Client)
```json
{
  "event": "new_notification",
  "data": {
    "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
    "type": "Placement",
    "message": "Amazon is hiring — deadline tomorrow",
    "isRead": false,
    "createdAt": "2026-04-22T17:51:30Z"
  }
}
```

### Client Acknowledgement (Client → Server)
```json
{
  "event": "ack",
  "notificationId": "d146095a-0d86-4a34-9e69-3900a14576bc"
}
```

---

## Summary of Endpoints

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| GET    | /api/v1/notifications            | Get all notifications (paged)  |
| GET    | /api/v1/notifications/:id        | Get single notification        |
| PATCH  | /api/v1/notifications/:id/read   | Mark one as read               |
| PATCH  | /api/v1/notifications/read-all   | Mark all as read               |
| DELETE | /api/v1/notifications/:id        | Delete a notification          |
| POST   | /api/v1/notifications            | Send notification (admin only) |
| WS     | ws://host/ws/notifications       | Real-time push channel         |


---

# Stage 2

## Persistent Storage — Database Choice

### Recommended Database: PostgreSQL (Relational)

**Why PostgreSQL?**
- Notifications have a clear, structured schema — relational DB fits perfectly
- Strong support for indexes, critical for querying by `studentID`, `isRead`, and `createdAt`
- ACID compliance ensures no notification is lost or duplicated during high-volume sends
- Native support for enums (e.g. `notification_type`)
- Scales well with proper indexing and partitioning strategies
- Widely supported, production-battle-tested, with excellent tooling

---

## Database Schema

### Table: `students`
```sql
CREATE TABLE students (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    roll_no    VARCHAR(50)  UNIQUE NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

### Enum: `notification_type`
```sql
CREATE TYPE notification_type AS ENUM ('Placement', 'Event', 'Result');
```

### Table: `notifications`
```sql
CREATE TABLE notifications (
    id                UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID              NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    message           TEXT              NOT NULL,
    is_read           BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP         NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP         NOT NULL DEFAULT NOW()
);
```

### Index Strategy
```sql
-- Composite index for the most frequent query: student + unread + sorted by time
CREATE INDEX idx_notifications_student_unread
    ON notifications(student_id, is_read, created_at DESC);

-- Index for filtering by notification type
CREATE INDEX idx_notifications_type
    ON notifications(notification_type);
```

---

## Problems as Data Volume Increases

| Problem          | Description                                                            |
|------------------|------------------------------------------------------------------------|
| Slow queries     | Full table scans on 5M+ rows without indexes become very slow          |
| High memory      | Fetching all notifications per student loads too much data into memory |
| Write contention | Bulk inserts (50,000 students at once) can lock tables                 |
| Storage bloat    | Old read notifications accumulate and slow down queries                |
| Index overhead   | Too many indexes slow down INSERT/UPDATE operations                    |

## Solutions

| Problem          | Solution                                                               |
|------------------|------------------------------------------------------------------------|
| Slow queries     | Composite index on `(student_id, is_read, created_at)`                |
| High memory      | Pagination with `LIMIT` / `OFFSET` or cursor-based                    |
| Write contention | Async bulk inserts via a message queue (Redis / RabbitMQ)             |
| Storage bloat    | Archive or delete notifications older than 90 days via cron job       |
| Index overhead   | Only index columns used in WHERE, ORDER BY, or JOIN clauses           |

---

## SQL Queries Based on Stage 1 REST APIs

### 1. Get all notifications for a student (paginated)
```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### 2. Get a single notification by ID
```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE id = $1 AND student_id = $2;
```

### 3. Mark a notification as read
```sql
UPDATE notifications
SET is_read = TRUE, updated_at = NOW()
WHERE id = $1 AND student_id = $2
RETURNING id, is_read, updated_at;
```

### 4. Mark all notifications as read
```sql
UPDATE notifications
SET is_read = TRUE, updated_at = NOW()
WHERE student_id = $1 AND is_read = FALSE;
```

### 5. Delete a notification
```sql
DELETE FROM notifications
WHERE id = $1 AND student_id = $2;
```

### 6. Send a notification to all students (admin)
```sql
INSERT INTO notifications (student_id, notification_type, message)
SELECT id, $1, $2
FROM students;
```

### 7. Get unread notification count
```sql
SELECT COUNT(*) AS unread_count
FROM notifications
WHERE student_id = $1 AND is_read = FALSE;
```

### 8. Filter notifications by type
```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = $1 AND notification_type = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```
