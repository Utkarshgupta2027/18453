# Logging Middleware

Small browser-safe logging middleware used by the frontend application.

Logs are stored in `localStorage` under `notificationAppLogs` with level, source, message, context, and timestamp fields. The middleware isolates storage errors so logging cannot break the notification workflow.
