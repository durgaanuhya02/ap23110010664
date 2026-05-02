import axios from "axios";
import { config } from "../config/config";
import { MinHeap } from "../utils/priorityQueue";
import { Log } from "../middleware/logger.middleware";
import {
  RawNotification,
  ScoredNotification,
  NotificationApiResponse,
} from "../types/notification.types";

// ─── Type Weight Map ──────────────────────────────────────────────────────────
// Priority: Placement (3) > Result (2) > Event (1)

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ─── Score Calculation ────────────────────────────────────────────────────────
//
// Score = typeWeight * 1000 + recencyScore
//
// recencyScore is based on how recent the notification is.
// Newer notifications get a higher recency score.
// We use Unix timestamp in seconds, normalized to a 0-999 range
// relative to the oldest notification in the batch.

function computeScore(
  notification: RawNotification,
  oldestTimestamp: number
): number {
  const typeWeight = TYPE_WEIGHT[notification.Type] ?? 1;
  const notifTimestamp = new Date(notification.Timestamp).getTime() / 1000;

  // Recency: how many seconds newer than the oldest notification (capped at 999)
  const recencyScore = Math.min(notifTimestamp - oldestTimestamp, 999);

  return typeWeight * 1000 + recencyScore;
}

// ─── Fetch Notifications from Test Server ────────────────────────────────────

export async function fetchNotificationsFromApi(): Promise<RawNotification[]> {
  await Log("backend", "info", "service", "Fetching notifications from evaluation API");

  const response = await axios.get<NotificationApiResponse>(
    config.notificationApiUrl,
    {
      headers: {
        Authorization: `Bearer ${config.bearerToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const notifications = response.data.notifications;
  await Log(
    "backend",
    "info",
    "service",
    `Fetched ${notifications.length} notifications from API`
  );

  return notifications;
}

// ─── Get Top N Priority Notifications ────────────────────────────────────────
//
// Uses a min-heap of size N to find the top N notifications efficiently.
// Time complexity: O(M log N) where M = total notifications, N = top count
// Space complexity: O(N)

export async function getTopNNotifications(
  topN: number = 10
): Promise<ScoredNotification[]> {
  await Log(
    "backend",
    "info",
    "service",
    `Computing top ${topN} priority notifications`
  );

  const notifications = await fetchNotificationsFromApi();

  if (notifications.length === 0) {
    await Log("backend", "warn", "service", "No notifications returned from API");
    return [];
  }

  // Find the oldest timestamp to compute relative recency scores
  const oldestTimestamp =
    Math.min(
      ...notifications.map((n) => new Date(n.Timestamp).getTime() / 1000)
    );

  // Score all notifications
  const scored: ScoredNotification[] = notifications.map((n) => ({
    ...n,
    score: computeScore(n, oldestTimestamp),
  }));

  // Use min-heap to find top N efficiently
  const heap = new MinHeap();

  for (const notification of scored) {
    if (heap.length() < topN) {
      // Heap not full yet — just push
      heap.push(notification);
    } else if (
      heap.peek() &&
      notification.score > heap.peek()!.score
    ) {
      // New notification beats the current minimum — replace it
      heap.pop();
      heap.push(notification);
    }
  }

  // Return sorted highest priority first
  const result = heap.toSortedArray();

  await Log(
    "backend",
    "info",
    "service",
    `Returning top ${result.length} notifications. Highest score: ${result[0]?.score}`
  );

  return result;
}
