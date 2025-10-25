# PC2 Laptimes WebSocket Notification Server

A simple WebSocket relay server that broadcasts database change notifications between clients in real-time.

**Note:** This WebSocket server runs in the same container as the web app (nginx). No separate deployment needed!

## How It Works

1. **Client makes change**: A user adds/updates/deletes a laptime, car, track, or driver
2. **Client broadcasts**: After successful database update, the client sends a notification to the WebSocket server
3. **Server relays**: The server broadcasts this notification to all other connected clients
4. **Other clients update**: Other clients receive the notification and reload the affected data

This is a simple **message relay** - the server doesn't connect to the database or track state. Clients handle everything.

## Deployment

The WebSocket server is automatically included in the main app container. When you build and deploy the app, both nginx (web app) and the WebSocket server start together.

```bash
# Build and deploy (includes WebSocket server)
./deploy.sh
```

The `Dockerfile` handles:
- Building the Vue app
- Installing Node.js in the nginx container
- Installing WebSocket server dependencies
- Starting both nginx and WebSocket server via `docker-entrypoint.sh`

## Environment Variables

- `WS_PORT`: WebSocket server port (default: `3002`)

Set in `deployment/create-pod.sh`:
```bash
-e WS_PORT=3002
```

## Development

Run locally for development:

```bash
cd ws-server
npm install
npm run dev
```

## Container Architecture

The container runs two processes:
1. **nginx** (port 80) - Serves the Vue web app
2. **Node.js** (port 3002) - WebSocket relay server

Both start via `/docker-entrypoint.sh` when the container launches.

## How Clients Connect

The Vue frontend automatically connects to the WebSocket server on startup:

```javascript
this.$dataStore.setupDbNotifications()
```

When a client makes a database change:
1. Client updates database via PostgREST
2. On success, client broadcasts notification to WebSocket server
3. Server relays message to all other connected clients
4. Other clients reload the affected data table

## Message Format

Clients send and receive messages in this format:

```json
{
  "table": "times",
  "operation": "CHANGE",
  "timestamp": "2025-10-25T12:34:56.789Z"
}
```

- `table`: The database table that changed (`cars`, `tracks`, `drivers`, `times`)
- `operation`: Type of change (always `CHANGE` in this simple version)
- `timestamp`: When the change occurred

## Features

✅ **Single container** - No separate deployment needed
✅ **Simple relay** - No database connection needed
✅ **Stateless** - Server doesn't track any data
✅ **Broadcast to others** - Message sender doesn't receive their own broadcast
✅ **Connection tracking** - Logs when clients connect/disconnect
✅ **Minimal dependencies** - Only requires `ws` package
