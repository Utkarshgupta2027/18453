# Notification App Frontend

Responsive React notification dashboard for viewing all campus notifications and a separate priority inbox.

## Run

```bash
npm install
npm run dev
```

The app is configured to run on `http://localhost:3000`.

Start the Spring Boot backend first because the frontend calls `/api/notifications` through the Vite proxy.

## Token Setup

Use the API Token panel in the left sidebar after the app opens.

To use an existing token:

1. Paste the bearer token into `Bearer token`.
2. Click `Save`.
3. Click the refresh button in the top bar.

To generate a token:

1. Fill in email, name, roll number, access code, client ID, and client secret.
2. Click `Generate token`.
3. The generated token is saved in this browser and used for notification requests.

Saved tokens are stored in browser `localStorage` under `notificationApiToken`. Click the clear button in the token panel to remove the saved token.

## Features

- Fetches notifications from the evaluation API through a Vite proxy.
- Displays all notifications and priority notifications on separate pages.
- Supports type filtering, unread-only filtering, and top `n` priority limits.
- Supports pasted tokens and token generation from API credentials.
- Distinguishes new and viewed notifications with persistent browser state.
- Uses Material UI components for layout, controls, and styling.
- Uses the repository logging middleware for application events.
