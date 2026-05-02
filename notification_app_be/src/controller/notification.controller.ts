import { Request, Response } from "express";
import { getTopNNotifications } from "../service/notification.service";
import { Log } from "../middleware/logger.middleware";

// ─── Priority Inbox Controller ────────────────────────────────────────────────

/**
 * GET /api/v1/notifications/priority
 * Query param: n (optional, default 10) — number of top notifications to return
 *
 * Returns the top N most important unread notifications sorted by:
 * - Type weight: Placement (3) > Result (2) > Event (1)
 * - Recency: newer notifications score higher within the same type
 */
export async function getPriorityInbox(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Parse and validate the `n` query parameter
    const rawN = req.query.n;
    const topN = rawN ? parseInt(rawN as string, 10) : 10;

    if (isNaN(topN) || topN < 1 || topN > 100) {
      await Log(
        "backend",
        "warn",
        "handler",
        `Invalid topN value received: ${rawN}`
      );
      res.status(400).json({
        success: false,
        error: "Query param 'n' must be a number between 1 and 100.",
      });
      return;
    }

    await Log(
      "backend",
      "info",
      "handler",
      `Priority inbox requested for top ${topN} notifications`
    );

    const notifications = await getTopNNotifications(topN);

    res.status(200).json({
      success: true,
      topN,
      count: notifications.length,
      notifications,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await Log(
      "backend",
      "error",
      "handler",
      `Failed to fetch priority notifications: ${message}`
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch priority notifications.",
    });
  }
}
