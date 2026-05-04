# Notification App Backend

Spring Boot backend that proxies notification requests to the protected evaluation API.

## Run

Start the service:

```powershell
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`.

You can provide authentication in three ways.

### Option 1: Generate a token from the frontend

Run the backend and frontend, open `http://localhost:3000`, then use the API Token panel to enter:

- Email
- Name
- Roll number
- Access code
- Client ID
- Client secret

Click `Generate token`. The frontend calls `POST /api/auth/token`, saves the returned token in this browser, and sends it with notification requests.

### Option 2: Paste an existing token in the frontend

Open `http://localhost:3000`, paste the bearer token into the API Token panel, and click `Save`.

The frontend sends saved tokens to the backend with the `X-Notification-Token` request header.

### Option 3: Configure the backend with environment variables

Set the API login values before starting the backend. The backend will request and cache the bearer token automatically.

```powershell
$env:NOTIFICATION_API_EMAIL="your_email"
$env:NOTIFICATION_API_NAME="your_name"
$env:NOTIFICATION_API_ROLL_NO="your_roll_number"
$env:NOTIFICATION_API_ACCESS_CODE="your_access_code"
$env:NOTIFICATION_API_CLIENT_ID="your_client_id"
$env:NOTIFICATION_API_CLIENT_SECRET="your_client_secret"
mvn spring-boot:run
```

If you already have a valid bearer token, you can use this fallback:

```powershell
$env:NOTIFICATION_API_TOKEN="your_token_here"
mvn spring-boot:run
```

## Endpoints

- `GET /api/health`
- `GET /api/notifications`
- `POST /api/auth/token`
- `POST /api/logs`

The notifications endpoint forwards `limit`, `page`, and `notification_type` query parameters to the external API.

`GET /api/notifications` accepts an optional `X-Notification-Token` header. If that header is present, it takes priority over environment-variable credentials.

`POST /api/logs` accepts frontend log entries and forwards them to the configured evaluation log service. It also accepts the optional `X-Notification-Token` header.

`POST /api/auth/token` accepts:

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
