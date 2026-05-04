# Campus Notification Application

Full-stack notification dashboard for viewing campus notifications, ranking unread priority items, generating or saving API tokens, and forwarding frontend logs through a backend proxy.

## Project Structure

- `notification_app_fe`: React + Vite frontend running on `http://localhost:3000`.
- `notification_app_be`: Spring Boot backend running on `http://localhost:8080`.
- `logging_middleware`: Browser-safe logging utility used by the frontend.
- `notification_system_design.md`: Short design notes for the notification ranking workflow.

## Features

- Fetches protected notifications through a Spring Boot proxy.
- Supports pasted bearer tokens and token generation from API credentials.
- Stores the selected token in browser `localStorage`.
- Displays all notifications and a priority inbox.
- Prioritizes unread notifications by type weight and recency.
- Supports notification type filtering, unread-only filtering, and priority limits.
- Stores viewed notification IDs in browser `localStorage`.
- Captures frontend logs locally and forwards them to the backend log proxy.

## Prerequisites

- Java 17
- Maven
- Node.js and npm

## Run The Application

Open two terminals from the repository root.

Terminal 1: start the backend.

```powershell
cd notification_app_be
mvn spring-boot:run
```

Terminal 2: start the frontend.

```powershell
cd notification_app_fe
npm install
npm run dev
```

Open the app at `http://localhost:3000`.

## Authentication

The app can authenticate in three ways.

### Generate A Token In The UI

1. Start both backend and frontend.
2. Open `http://localhost:3000`.
3. In the `API Token` panel, enter email, name, roll number, access code, client ID, and client secret.
4. Click `Generate token`.
5. The frontend calls `POST /api/auth/token`, saves the generated token, and refreshes notifications.

### Paste An Existing Token

1. Open `http://localhost:3000`.
2. Paste the bearer token into the `Bearer token` field.
3. Click `Save`.
4. Click the refresh button in the top bar.

Saved tokens are stored in browser `localStorage` under `notificationApiToken`. Use the clear button in the token panel to remove the saved token.

### Configure Backend Environment Variables

Use this when you want the backend to generate and cache tokens without entering credentials in the UI.

```powershell
$env:NOTIFICATION_API_EMAIL="your_email"
$env:NOTIFICATION_API_NAME="your_name"
$env:NOTIFICATION_API_ROLL_NO="your_roll_number"
$env:NOTIFICATION_API_ACCESS_CODE="your_access_code"
$env:NOTIFICATION_API_CLIENT_ID="your_client_id"
$env:NOTIFICATION_API_CLIENT_SECRET="your_client_secret"
cd notification_app_be
mvn spring-boot:run
```

You can also provide a ready bearer token:

```powershell
$env:NOTIFICATION_API_TOKEN="your_token_here"
cd notification_app_be
mvn spring-boot:run
```

## Configuration

Backend defaults are in `notification_app_be/src/main/resources/application.properties`.

| Property | Environment Variable | Default |
| --- | --- | --- |
| `notification.api.base-url` | `NOTIFICATION_API_BASE_URL` | `http://20.207.122.201` |
| `notification.api.auth-url` | `NOTIFICATION_API_AUTH_URL` | `http://20.244.56.144/evaluation-service/auth` |
| `notification.api.log-url` | `NOTIFICATION_API_LOG_URL` | `http://20.244.56.144/evaluation-service/logs` |
| `notification.api.token` | `NOTIFICATION_API_TOKEN` | empty |
| `notification.api.email` | `NOTIFICATION_API_EMAIL` | empty |
| `notification.api.name` | `NOTIFICATION_API_NAME` | empty |
| `notification.api.roll-no` | `NOTIFICATION_API_ROLL_NO` | empty |
| `notification.api.access-code` | `NOTIFICATION_API_ACCESS_CODE` | empty |
| `notification.api.client-id` | `NOTIFICATION_API_CLIENT_ID` | empty |
| `notification.api.client-secret` | `NOTIFICATION_API_CLIENT_SECRET` | empty |

## Backend Endpoints

- `GET /api/health`: returns backend health status.
- `GET /api/notifications`: proxies notification requests to the external notification API.
- `POST /api/auth/token`: generates a bearer token from credentials.
- `POST /api/logs`: forwards frontend logs to the configured external log service.

`GET /api/notifications` accepts these optional query parameters:

- `limit`
- `page`
- `notification_type`

`GET /api/notifications` and `POST /api/logs` accept an optional `X-Notification-Token` header. If provided, that token takes priority over backend environment-variable credentials.

Token generation request body:

```json
{
  "email": "your_email",
  "name": "your_name",
  "rollNo": "your_roll_number",
  "accessCode": "your_access_code",
  "clientId": "your_client_id",
  "clientSecret": "your_client_secret"
}
```

## Logging Middleware

The frontend creates a logger from `logging_middleware/browserLogger.js`.

Logs are stored locally under `notificationAppLogs` and sent best-effort to `/api/logs`. Remote log payloads use this shape:

```json
{
  "stack": "frontend",
  "level": "info",
  "package": "notification_app_fe",
  "message": "Fetched notifications {\"count\":10}"
}
```

Supported levels are `debug`, `info`, `warn`, `error`, and `fatal`. Logging errors are isolated so they never block the notification workflow.

## Priority Ranking

Priority notifications are selected from unread notifications only. Ranking uses:

- Type weight: `Placement` highest, then `Result`, then `Event`.
- Recency: newer notifications rank higher when type weights match.

The complete notification feed remains available separately and can be filtered by type or unread status.

## Build And Verify

Backend:

```powershell
cd notification_app_be
mvn test
```

Frontend:

```powershell
cd notification_app_fe
npm run lint
npm run build
```

## Troubleshooting

- If the frontend cannot load notifications, confirm the backend is running on `http://localhost:8080`.
- If requests return `401`, save a valid token in the UI or configure backend auth environment variables.
- If token generation fails, check that all six credential fields are filled correctly.
- If frontend requests do not reach the backend, confirm Vite is running on `http://localhost:3000` and the proxy in `notification_app_fe/vite.config.js` points to `http://127.0.0.1:8080`.
- If logs are not visible remotely, check `NOTIFICATION_API_LOG_URL` and make sure a valid token is available.
