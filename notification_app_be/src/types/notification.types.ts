// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationType = "Placement" | "Result" | "Event";

// Raw notification from the test server API
export interface RawNotification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

// Notification with computed priority score
export interface ScoredNotification extends RawNotification {
  score: number;
}

// API response from test server
export interface NotificationApiResponse {
  notifications: RawNotification[];
}

// Response returned by our priority inbox endpoint
export interface PriorityInboxResponse {
  success: boolean;
  topN: number;
  notifications: ScoredNotification[];
}
