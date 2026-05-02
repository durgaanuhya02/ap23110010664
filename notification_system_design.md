# Campus Notifications Microservice — System Design

---

# Stage 1

## Overview

This document describes the REST API design and contract for a Campus Notification Platform where students receive real-time updates about Placements, Events, and Results.

---

## Core Actions the Notification Platform Should Support

1. Fetch all notifications for a logged-in student
2. Fetch a single notification by ID
3. Mark a notification as read
4. Mark all notifications as read
5. Delete a notification
6. Send a notification (admin/HR action)
7. Subscribe to real-time notifications (WebSocket)

---

## REST API Endpoints

### Base URL
```
/api/v1
```

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

| Field          | Type   | Required | Values                          |
|----------------|--------|----------|---------------------------------|
| type           | string | Yes      | "Placement", "Event", "Result"  |
| message        | string | Yes      | Notification content            |
| targetAudience | string | Yes      | "all" or specific student IDs   |

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

| Method | Endpoint                              | Description                    |
|--------|---------------------------------------|--------------------------------|
| GET    | /api/v1/notifications                 | Get all notifications (paged)  |
| GET    | /api/v1/notifications/:id             | Get single notification        |
| PATCH  | /api/v1/notifications/:id/read        | Mark one as read               |
| PATCH  | /api/v1/notifications/read-all        | Mark all as read               |
| DELETE | /api/v1/notifications/:id             | Delete a notification          |
| POST   | /api/v1/notifications                 | Send notification (admin only) |
| WS     | ws://host/ws/notifications            | Real-time push channel         |

---
