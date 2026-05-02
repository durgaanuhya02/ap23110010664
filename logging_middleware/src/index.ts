import axios from "axios";

// ─── Valid value types ────────────────────────────────────────────────────────

export type Stack = "backend" | "frontend";

export type Level = "debug" | "info" | "warn" | "error" | "fatal";

export type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";

export type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";

export type SharedPackage = "auth" | "config" | "middleware" | "utils";

export type Package = BackendPackage | FrontendPackage | SharedPackage;

// ─── Config ───────────────────────────────────────────────────────────────────

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

const BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkdXJnYWFudWh5YV9ndXJyYW1Ac3JtYXAuZWR1LmluIiwiZXhwIjoxNzc3Njk5NTcyLCJpYXQiOjE3Nzc2OTg2NzIsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIwNDE5MWVlMy1hYzdkLTRiZDgtYWExOC1iM2I5OWE4MzM4YWUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhcDIzMTEwMDEwNjY0Iiwic3ViIjoiY2RiOWNmNzYtOTJiZS00NDEzLThmMWUtMTZjNjI2MzZhZGYzIn0sImVtYWlsIjoiZHVyZ2FhbnVoeWFfZ3VycmFtQHNybWFwLmVkdS5pbiIsIm5hbWUiOiJhcDIzMTEwMDEwNjY0Iiwicm9sbE5vIjoiYXAyMzExMDAxMDY2NCIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6ImNkYjljZjc2LTkyYmUtNDQxMy04ZjFlLTE2YzYyNjM2YWRmMyIsImNsaWVudFNlY3JldCI6IlZSaHVjSHBnUEpwcW5jTmMifQ.y-js6z96mMhaEYXJSl723gNbzk4gcIIFYlVocfKudQo";

// ─── Log Response type ────────────────────────────────────────────────────────

export interface LogResponse {
  logID: string;
  message: string;
}

// ─── Main Log function ────────────────────────────────────────────────────────

/**
 * Sends a log entry to the evaluation test server.
 *
 * @param stack   - "backend" or "frontend"
 * @param level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     - the package/layer where the log originates (e.g. "handler", "db")
 * @param message - descriptive message about what happened
 * @returns       - the logID and confirmation message from the server, or null on failure
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<LogResponse | null> {
  try {
    const response = await axios.post<LogResponse>(
      LOG_API_URL,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    console.log(
      `[LOG SENT] stack=${stack} level=${level} package=${pkg} | logID=${response.data.logID}`
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        `[LOG FAILED] stack=${stack} level=${level} package=${pkg} | ${error.response?.status} - ${JSON.stringify(error.response?.data)}`
      );
    } else {
      console.error(`[LOG FAILED] Unexpected error:`, error);
    }
    return null;
  }
}

export default Log;
