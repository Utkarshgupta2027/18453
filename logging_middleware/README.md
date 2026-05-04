# Logging Middleware

Small browser-safe logging middleware used by the frontend application.

The middleware exposes the reusable function required by the evaluation setup:

```js
Log(stack, level, packageName, message)
```

Every `Log` call sends a `POST` request to the log API through the backend proxy at `/api/logs`. Logs are also stored in `localStorage` under `notificationAppLogs` for local inspection.

Remote log payloads use the evaluation-service shape:

```json
{
  "stack": "frontend",
  "level": "info",
  "package": "component",
  "message": "Fetched notifications {\"count\":10}"
}
```

## Usage

```js
import { Log, configureLogger, createLogger } from '../../logging_middleware/browserLogger'

configureLogger({
  getToken: () => localStorage.getItem('notificationApiToken') || '',
})

await Log('frontend', 'info', 'component', 'Dashboard loaded')

const logger = createLogger('component')
logger.info('Fetched notifications', { count: 10 })
logger.error('Failed to fetch notifications', { message: 'Unauthorized' })
```

## Constraints

Supported stacks are `frontend` and `backend`.

Supported levels are `debug`, `info`, `warn`, `error`, and `fatal`.

Supported frontend packages are `api`, `component`, `hook`, `page`, `state`, `style`, `auth`, `config`, `middleware`, and `utils`.

The middleware isolates storage and network errors so logging cannot break the notification workflow. Use `getStoredLogs()` and `clearStoredLogs()` to inspect or clear the local log history.
