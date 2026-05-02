// ─── App Configuration ────────────────────────────────────────────────────────

export const config = {
  port: process.env.PORT || 3000,

  // Bearer token for the evaluation test server
  bearerToken: process.env.BEARER_TOKEN || "",

  // Test server notification API
  notificationApiUrl:
    process.env.NOTIFICATION_API_URL ||
    "http://20.207.122.201/evaluation-service/notifications",

  // Logging API
  logApiUrl:
    process.env.LOG_API_URL ||
    "http://20.207.122.201/evaluation-service/logs",
};
