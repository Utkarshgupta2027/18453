# Notification App Frontend

Responsive React notification dashboard for viewing all campus notifications and a separate priority inbox.

## Run

```bash
npm install
npm run dev
```

The app is configured to run on `http://localhost:3000`.

## Features

- Fetches notifications from the evaluation API through a Vite proxy.
- Displays all notifications and priority notifications on separate pages.
- Supports type filtering, unread-only filtering, and top `n` priority limits.
- Distinguishes new and viewed notifications with persistent browser state.
- Uses Material UI components for layout, controls, and styling.
- Uses the repository logging middleware for application events.
