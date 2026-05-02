import { Router } from "express";
import { getPriorityInbox } from "../controller/notification.controller";

// ─── Notification Routes ──────────────────────────────────────────────────────

const router = Router();

/**
 * GET /api/v1/notifications/priority?n=10
 * Returns top N priority notifications scored by type weight + recency
 */
router.get("/priority", getPriorityInbox);

export default router;
