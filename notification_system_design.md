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


---

# Stage 3

## Query Analysis

### Original Query
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

### Is this query accurate?
Functionally yes — it correctly fetches unread notifications for a student sorted by newest first. However it has serious performance problems at scale.

### Why is it slow?

With 50,000 students and 5,000,000 notifications:

1. **No index on `studentID` or `isRead`** — the database performs a full table scan across 5M rows on every request
2. **`SELECT *`** — fetches all columns including unused ones, increasing I/O and memory usage
3. **No `LIMIT`** — if a student has thousands of unread notifications, all are loaded into memory at once
4. **`ORDER BY createdAt DESC` without an index** — sorting millions of rows in memory is expensive

### Optimized Query
```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = $1 AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 20 OFFSET $2;
```

**Changes made:**
- Replace `SELECT *` with only the required columns
- Add `LIMIT` and `OFFSET` for pagination
- Use parameterized query to prevent SQL injection
- Backed by composite index: `(student_id, is_read, created_at DESC)`

### Computation Cost: Before vs After

| Metric        | Before (Original)           | After (Optimized)           |
|---------------|-----------------------------|-----------------------------|
| Rows scanned  | 5,000,000 (full table scan) | ~20 (index seek)            |
| Sort cost     | High (in-memory sort)       | Low (index pre-sorted)      |
| Memory usage  | High (all columns, no limit)| Low (selected cols, paged)  |
| Query time    | Several seconds             | Milliseconds                |

---

## Should You Add Indexes on Every Column?

**No. This is bad advice.**

### Why over-indexing is harmful:
- Every index consumes additional disk space
- Every `INSERT`, `UPDATE`, and `DELETE` must update all indexes — slowing down writes significantly
- At 5M rows with bulk inserts of 50,000 at a time, over-indexing causes serious write bottlenecks
- The query optimizer can choose a suboptimal plan when too many indexes exist

### Correct approach:
Only index columns that appear in `WHERE`, `ORDER BY`, or `JOIN` clauses of your actual queries.

```sql
-- Covers the primary query pattern
CREATE INDEX idx_notifications_student_unread
    ON notifications(student_id, is_read, created_at DESC);

-- For filtering by notification type
CREATE INDEX idx_notifications_type
    ON notifications(notification_type);
```

---

## Query: Students Who Received a Placement Notification in the Last 7 Days

```sql
SELECT DISTINCT s.id, s.name, s.email, s.roll_no
FROM students s
JOIN notifications n ON n.student_id = s.id
WHERE n.notification_type = 'Placement'
  AND n.created_at >= NOW() - INTERVAL '7 days';
```

- Joins `students` and `notifications` on `student_id`
- Filters by `notification_type = 'Placement'` using the enum
- `NOW() - INTERVAL '7 days'` dynamically computes the 7-day window
- `DISTINCT` ensures each student appears only once even with multiple placement notifications


---

# Stage 4

## Problem: DB Overwhelmed on Every Page Load

Fetching notifications from the database on every page load for 50,000 students is unsustainable. Below are strategies to solve this with their tradeoffs.

---

## Strategy 1: Server-Side Caching with Redis

**How it works:**
Cache the result of each student's notification query in Redis with a short TTL. On subsequent requests within the TTL, serve from cache — no DB hit. Invalidate the cache when a new notification arrives or when a notification is marked as read.

```
Cache key : notifications:<studentID>:unread
TTL       : 60 seconds
Invalidate: on new notification insert or mark-as-read
```

| Tradeoff | Detail |
|----------|--------|
| Pro | Dramatically reduces DB load; sub-millisecond response times |
| Pro | Scales horizontally across multiple app servers |
| Con | May serve slightly stale data within the TTL window |
| Con | Adds infrastructure complexity; cache invalidation must be carefully managed |

---

## Strategy 2: Pagination

**How it works:**
Instead of loading all notifications at once, load 20 at a time using `LIMIT`/`OFFSET` or cursor-based pagination.

| Tradeoff | Detail |
|----------|--------|
| Pro | Reduces memory and DB load per request significantly |
| Pro | Works well even without a caching layer |
| Con | Frontend must implement "load more" or infinite scroll |

---

## Strategy 3: Real-Time Push via WebSocket (Eliminate Polling)

**How it works:**
Use the WebSocket channel designed in Stage 1. The client fetches notifications once on login and then receives new ones via push — no repeated DB reads on page load.

| Tradeoff | Detail |
|----------|--------|
| Pro | Eliminates repeated DB reads entirely |
| Pro | Best user experience — instant delivery |
| Con | Requires persistent WebSocket connections on the server |
| Con | Must handle reconnection and missed messages gracefully |

---

## Strategy 4: Database Read Replicas

**How it works:**
Set up a PostgreSQL read replica. All `SELECT` queries route to the replica; writes go to the primary. Distributes read load across multiple DB instances.

| Tradeoff | Detail |
|----------|--------|
| Pro | Scales reads horizontally without changing application logic much |
| Con | Replication lag — replica may be slightly behind the primary |
| Con | Higher infrastructure and maintenance cost |

---

## Recommended Combined Approach

1. **Redis cache** — cache unread notifications per student (TTL: 60s), invalidate on write
2. **Pagination** — default 20 notifications per page on all list endpoints
3. **WebSockets** — push new notifications in real time; avoid polling entirely
4. **Read replica** — add once traffic exceeds single DB capacity


---

# Stage 5

## Shortcomings of the Original `notify_all` Implementation

```
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        send_email(student_id, message)   # calls Email API
        save_to_db(student_id, message)   # DB insert
        push_to_app(student_id, message)  # WebSocket push
```

### Problems:

1. **Synchronous loop over 50,000 students** — processes one student at a time; extremely slow and blocks the server
2. **No error handling or retry logic** — if `send_email` fails for student 200, the entire loop stops or silently skips
3. **Tightly coupled operations** — email, DB insert, and push happen together; one failure can affect the others
4. **No partial failure recovery** — if the process crashes at student 25,000, there is no way to resume
5. **DB write bottleneck** — 50,000 individual `INSERT` statements instead of a single bulk insert

---

## What Happens When `send_email` Fails for 200 Students Midway?

With the original implementation, those 200 students simply don't get an email and there is no record of the failure. The loop either crashes or continues silently — the failure is undetected and unrecoverable.

---

## Should DB Save and Email Happen Together?

**No.** They should be decoupled.

- **DB insert** should happen immediately and independently — it is the source of truth
- **Email sending** is a side effect that can be retried asynchronously if it fails
- Coupling them means a failed email blocks or rolls back a successful DB write, which is wrong

---

## Redesigned Implementation

### Architecture: Message Queue + Worker Pool

Instead of a synchronous loop, publish notification jobs to a message queue (e.g. BullMQ / Redis Queue). Worker processes consume jobs concurrently and handle retries independently.

### Revised Pseudocode

```
function notify_all(student_ids: array, message: string):
    # Step 1: Bulk insert all notifications into DB immediately
    bulk_save_to_db(student_ids, message)

    # Step 2: Enqueue one job per student for email + push
    for student_id in student_ids:
        enqueue_job(queue="notifications", payload={
            student_id: student_id,
            message: message
        })

# Worker (runs concurrently, N workers in parallel)
function process_job(job):
    try:
        send_email(job.student_id, job.message)
        push_to_app(job.student_id, job.message)
        mark_job_complete(job.id)
    except EmailFailure:
        if job.retry_count < 3:
            requeue_job(job, delay=exponential_backoff(job.retry_count))
        else:
            log_to_dead_letter_queue(job)
            Log("backend", "error", "service",
                "Email delivery failed after 3 retries for student: " + job.student_id)
```

### Why This Is Better

| Issue                    | Original           | Redesigned                               |
|--------------------------|--------------------|------------------------------------------|
| Speed                    | Sequential (slow)  | Parallel workers (fast)                  |
| Email failure handling   | None               | Retry with exponential backoff           |
| DB + email coupling      | Tightly coupled    | Decoupled — DB writes always succeed     |
| Partial failure recovery | Not possible       | Dead letter queue tracks failed jobs     |
| Crash recovery           | Loses progress     | Queue persists; workers resume on restart|
| 50,000 DB inserts        | One by one         | Single bulk INSERT                       |


---

# Stage 6

## Priority Inbox — Approach

### Problem
Display the top N most important unread notifications first. Priority is determined by:
- **Type weight**: Placement (3) > Result (2) > Event (1)
- **Recency**: newer notifications score higher within the same type weight

### Scoring Formula
```
score = typeWeight * 1000 + recencyScore

recencyScore = seconds since oldest notification in batch (capped at 999)
```

Multiplying type weight by 1000 ensures type always dominates over recency, while recency breaks ties within the same type.

### Algorithm — Min-Heap of Size N

To efficiently maintain the top N notifications as new ones arrive:

1. Maintain a **min-heap of size N** (smallest score at the top)
2. For each new notification:
   - If heap size < N → push it in
   - If its score > heap minimum → pop the minimum, push the new one
3. Result: heap always contains the top N highest-scored notifications

**Time complexity**: O(M log N) where M = total notifications, N = top count  
**Space complexity**: O(N)

This is far more efficient than sorting all M notifications every time (O(M log M)).

### How New Notifications Are Handled Efficiently
- The min-heap structure means inserting a new notification is O(log N)
- No need to re-sort the entire list — just compare against the current minimum
- The heap self-maintains the top N at all times

### API Endpoint

**GET** `/api/v1/notifications/priority?n=10`

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
  "topN": 10,
  "count": 10,
  "notifications": [
    {
      "ID": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
      "Type": "Placement",
      "Message": "CSX Corporation hiring",
      "Timestamp": "2026-04-22T17:51:18Z",
      "score": 3999
    }
  ]
}
```

### Folder Structure
```
notification_app_be/
├── src/
│   ├── config/
│   │   └── config.ts           # App configuration
│   ├── controller/
│   │   └── notification.controller.ts  # Request handler
│   ├── middleware/
│   │   └── logger.middleware.ts        # Reusable Log function
│   ├── route/
│   │   └── notification.route.ts       # Express routes
│   ├── service/
│   │   └── notification.service.ts     # Business logic + scoring
│   ├── types/
│   │   └── notification.types.ts       # TypeScript interfaces
│   ├── utils/
│   │   └── priorityQueue.ts            # Min-heap implementation
│   └── index.ts                        # Express app entry point
├── package.json
├── tsconfig.json
└── .env
```
