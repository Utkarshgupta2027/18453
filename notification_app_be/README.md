# Notification App Backend

Spring Boot backend that proxies notification requests to the protected evaluation API.

## Run

Set a valid, non-expired API token, then start the service:

```powershell
$env:NOTIFICATION_API_TOKEN="your_token_here"
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`.

## Endpoints

- `GET /api/health`
- `GET /api/notifications`

The notifications endpoint forwards `limit`, `page`, and `notification_type` query parameters to the external API.
