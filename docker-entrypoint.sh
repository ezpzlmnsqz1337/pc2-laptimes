#!/bin/bash

# Start the WebSocket server in the background
echo "Starting WebSocket server..."
cd /app/ws-server
node server.js &

# Start nginx in the foreground
echo "Starting nginx..."
nginx -g 'daemon off;'
