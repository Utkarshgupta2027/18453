# Notification App Backend

Spring Boot backend that proxies notification requests to the protected evaluation API.

## Run

Set the API login values, then start the service. The backend will request and cache the bearer token automatically.

```powershell
$env:NOTIFICATION_API_EMAIL="your_email"
$env:NOTIFICATION_API_NAME="your_name"
$env:NOTIFICATION_API_ROLL_NO="your_roll_number"
$env:NOTIFICATION_API_ACCESS_CODE="your_access_code"
$env:NOTIFICATION_API_CLIENT_ID="your_client_id"
$env:NOTIFICATION_API_CLIENT_SECRET="your_client_secret"
mvn spring-boot:run
```

If you already have a valid bearer token, you can use this fallback instead:

```powershell
$env:NOTIFICATION_API_TOKEN="your_token_here"
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`.

## Endpoints

- `GET /api/health`
- `GET /api/notifications`

The notifications endpoint forwards `limit`, `page`, and `notification_type` query parameters to the external API.
