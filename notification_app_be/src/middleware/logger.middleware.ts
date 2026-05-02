import axios from "axios";
import { config } from "../config/config";

// ─── Valid field types ────────────────────────────────────────────────────────

type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package =
  | "cache" | "controller" | "cron_job" | "db" | "domain"
  | "handler" | "repository" | "route" | "service"
  | "auth" | "config" | "middleware" | "utils";

// ─── Log function ─────────────────────────────────────────────────────────────

/**
 * Sends a structured log entry to the evaluation test server.
 * @param stack   - "backend" or "frontend"
 * @param level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     - the package/layer where the log originates
 * @param message - descriptive message about what happened
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  try {
    await axios.post(
      config.logApiUrl,
      { stack, level, package: pkg, message },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.bearerToken}`,
        },
      }
    );
  } catch (error) {
    // Log failures should never crash the app — silently record to console
    console.error(`[LOG FAILED] ${level} | ${pkg} | ${message}`);
  }
}
