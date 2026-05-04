# Logging Middleware

Small browser-safe logging middleware used by the frontend application.

Logs are stored in `localStorage` under `notificationAppLogs` and are also sent best-effort to `/api/logs`.

Remote log payloads use the evaluation-service shape:

```json
{
  "stack": "frontend",
  "level": "info",
  "package": "notification_app_fe",
  "message": "Fetched notifications {\"count\":10}"
}
```

## Usage

```js
import { createLogger } from '../../logging_middleware/browserLogger'

const logger = createLogger('notification_app_fe', {
  getToken: () => localStorage.getItem('notificationApiToken') || '',
})

logger.info('Fetched notifications', { count: 10 })
logger.error('Failed to fetch notifications', { message: 'Unauthorized' })
```

Supported levels are `debug`, `info`, `warn`, `error`, and `fatal`.

The middleware isolates storage and network errors so logging cannot break the notification workflow. Use `getStoredLogs()` and `clearStoredLogs()` to inspect or clear the local log history.
