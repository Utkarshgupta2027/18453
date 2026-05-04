# Stage 1

## Goal

The notification system highlights the most important unread campus updates while still keeping a complete feed available for browsing and filtering.

## Priority Strategy

Priority is calculated with two signals:

- Notification type weight: `Placement` is highest, then `Result`, then `Event`.
- Recency: newer notifications win when two notifications have the same type weight.

The implementation keeps the ranking deterministic by sorting first by type weight and then by timestamp. The frontend stores viewed notification IDs in `localStorage`, so newly fetched notifications can still enter the priority inbox without requiring a database.

## Architecture

- `notification_app_fe`: React frontend that runs on `http://localhost:3000`.
- `logging_middleware`: browser logging utility used by the frontend instead of direct console logging.
- `notification_app_be`: Spring Boot proxy backend that attaches the protected API bearer token server-side.

## Data Flow

1. The frontend requests `/api/notifications`.
2. Vite proxies the request to the Spring Boot backend on `localhost:8080`.
3. Spring Boot forwards the request to the provided notification API with the bearer token from `NOTIFICATION_API_TOKEN`.
4. The API response is normalized for field names such as `ID`, `Type`, `Message`, and `Timestamp`.
5. The all-notifications page sorts records by newest first.
6. The priority page filters unread records, applies type and limit controls, and shows the top ranked records.
7. Viewed IDs and application logs are persisted locally in the browser.

## Error Handling

The frontend shows a clear retryable error if the API request fails or returns an unexpected shape. Logging failures are intentionally isolated so the notification UI remains usable.
