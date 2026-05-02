import express from "express";
import dotenv from "dotenv";
import notificationRoutes from "./route/notification.route";
import { Log } from "./middleware/logger.middleware";

// Load environment variables
dotenv.config();

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/v1/notifications", notificationRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "notification_app_be" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, async () => {
  console.log(`[SERVER] notification_app_be running on port ${PORT}`);
  await Log(
    "backend",
    "info",
    "service",
    `notification_app_be server started on port ${PORT}`
  );
});

export default app;
