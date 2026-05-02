// ─── App Configuration ────────────────────────────────────────────────────────

export const config = {
  port: process.env.PORT || 3000,

  // Bearer token for the evaluation test server
  bearerToken: process.env.BEARER_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkdXJnYWFudWh5YV9ndXJyYW1Ac3JtYXAuZWR1LmluIiwiZXhwIjoxNzc3NzA0OTU1LCJpYXQiOjE3Nzc3MDQwNTUsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5YTRkNDY0OS1jZjcxLTQ3ZjQtOWUyNi1iMTBlZTQ2NWM3MTciLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhcDIzMTEwMDEwNjY0Iiwic3ViIjoiY2RiOWNmNzYtOTJiZS00NDEzLThmMWUtMTZjNjI2MzZhZGYzIn0sImVtYWlsIjoiZHVyZ2FhbnVoeWFfZ3VycmFtQHNybWFwLmVkdS5pbiIsIm5hbWUiOiJhcDIzMTEwMDEwNjY0Iiwicm9sbE5vIjoiYXAyMzExMDAxMDY2NCIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6ImNkYjljZjc2LTkyYmUtNDQxMy04ZjFlLTE2YzYyNjM2YWRmMyIsImNsaWVudFNlY3JldCI6IlZSaHVjSHBnUEpwcW5jTmMifQ.yJowWo7C68mVUWAIN7CD2Dm9K2MchOjHwOfi_Ir7ZE4",

  // Test server notification API
  notificationApiUrl:
    process.env.NOTIFICATION_API_URL ||
    "http://20.207.122.201/evaluation-service/notifications",

  // Logging API
  logApiUrl:
    process.env.LOG_API_URL ||
    "http://20.207.122.201/evaluation-service/logs",
};
