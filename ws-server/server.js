import { WebSocketServer } from 'ws'

const WS_PORT = process.env.WS_PORT || 3002

// Create WebSocket server
const wss = new WebSocketServer({ port: WS_PORT })

// Track connected clients
const clients = new Set()

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress
  console.log(`New WebSocket client connected from ${clientIp}. Total clients: ${clients.size + 1}`)

  clients.add(ws)

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to PC2 Laptimes notification server',
    timestamp: new Date().toISOString()
  }))

  // Handle incoming messages from clients
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data)
      console.log(`Received message from ${clientIp}:`, message)

      // Broadcast to all other clients (not the sender)
      const broadcastMessage = JSON.stringify(message)
      clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) { // OPEN
          client.send(broadcastMessage)
        }
      })

      console.log(`Broadcasted to ${clients.size - 1} other clients`)
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })

  ws.on('close', () => {
    console.log(`Client disconnected from ${clientIp}. Total clients: ${clients.size - 1}`)
    clients.delete(ws)
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
    clients.delete(ws)
  })

  // Handle ping/pong for connection health
  ws.on('ping', () => {
    ws.pong()
  })
})

// Handle server errors
wss.on('error', (error) => {
  console.error('WebSocket server error:', error)
})

// Start the server
console.log(`WebSocket server listening on port ${WS_PORT}`)
console.log('Waiting for client connections...')

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  clients.forEach((client) => {
    client.close()
  })
  wss.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  clients.forEach((client) => {
    client.close()
  })
  wss.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})
