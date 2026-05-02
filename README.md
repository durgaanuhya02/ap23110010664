# AP23110010664 — Backend Track Assignment

**Student:** Durga Anuhya Gurram  
**Roll No:** AP23110010664  
**Email:** durgaanuhya_gurram@srmap.edu.in  
**Track:** Backend

---

## Repository Structure

```
├── logging_middleware/          # Reusable logging package (TypeScript)
├── notification_app_be/         # Campus Notifications Microservice (TypeScript + Express)
│   ├── src/
│   │   ├── config/              # App configuration
│   │   ├── controller/          # Request handlers
│   │   ├── middleware/          # Logger middleware
│   │   ├── route/               # Express routes
│   │   ├── service/             # Business logic
│   │   ├── types/               # TypeScript interfaces
│   │   ├── utils/               # Min-heap priority queue
│   │   └── index.ts             # Entry point
│   ├── screenshots/             # Postman output screenshots
│   ├── package.json
│   └── tsconfig.json
├── vehicle_maintence_scheduler/ # Vehicle Maintenance Scheduler
├── notification_system_design.md # System design document (Stages 1–6)
├── .gitignore
└── README.md
```

---

## Task: Campus Notifications Microservice

A backend microservice for a campus notification platform where students receive real-time updates about Placements, Events, and Results.

---

## Logging Middleware

A reusable TypeScript package that sends structured logs to the evaluation test server.

**Function signature:**
```typescript
Log(stack, level, package, message)
```

**Usage:**
```typescript
import { Log } from './logging_middleware/src';

await Log("backend", "info", "service", "Server started successfully");
await Log("backend", "error", "db", "Database connection failed");
```

---

## Campus Notifications Microservice — Stages

| Stage | Description | Deliverable |
|-------|-------------|-------------|
| Stage 1 | REST API design + WebSocket real-time mechanism | `notification_system_design.md` |
| Stage 2 | Database schema, SQL queries, scale problems | `notification_system_design.md` |
| Stage 3 | Query optimization, indexing strategy | `notification_system_design.md` |
| Stage 4 | Caching strategies, performance improvements | `notification_system_design.md` |
| Stage 5 | notify_all redesign with message queue | `notification_system_design.md` |
| Stage 6 | Priority inbox with min-heap algorithm | `notification_app_be/` |

---

## Stage 6 — Priority Inbox API

### How to Run

```bash
cd notification_app_be
npm install
npm run build
npm start
```

Server runs on `http://localhost:3000`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications/priority?n=10` | Get top N priority notifications |
| GET | `/health` | Health check |

### Priority Scoring

Notifications are scored using:
```
score = typeWeight * 1000 + recencyScore

Type weights:
  Placement = 3  (highest priority)
  Result    = 2
  Event     = 1  (lowest priority)
```

A **min-heap of size N** is used to efficiently find the top N notifications in O(M log N) time.

### Sample Response

```json
{
  "success": true,
  "topN": 10,
  "count": 10,
  "notifications": [
    {
      "ID": "a305e1ae-95b1-4d6f-bf03-97ba70e350ed",
      "Type": "Placement",
      "Message": "Visa Inc. hiring",
      "Timestamp": "2026-05-02 04:49:33",
      "score": 3999
    }
  ]
}
```

---

## Tech Stack

- **Language:** TypeScript
- **Framework:** Express.js
- **Algorithm:** Min-Heap (no external algorithm libraries)
- **HTTP Client:** Axios
- **Environment:** dotenv
