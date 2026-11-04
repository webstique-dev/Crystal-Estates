import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import plotsRouter from './routes/plots.js'
import kolapakkamRouter from './routes/kolapakkam.js'
import { getDb, closeDb } from './config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'

// Middleware
app.use(
  cors({
    origin: [
      CLIENT_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`)
  next()
})

// Root & Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Crystal Estates API Server',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      plots: '/api/plots',
      kolapakkam: '/api/plots/kolapakkam',
    },
  })
})

app.get('/api/health', async (req, res) => {
  try {
    const db = await getDb()
    await db.command({ ping: 1 })
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err.message,
    })
  }
})

// Mount API routes
app.use('/api/plots/kolapakkam', kolapakkamRouter)
app.use('/api/plots', plotsRouter)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  })
})

const server = app.listen(PORT, () => {
  console.log(`🚀 Crystal Estates Server listening on port ${PORT}`)
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`)
  console.log(`🗺️ Plots API: http://localhost:${PORT}/api/plots`)
  console.log(`📍 Kolapakkam API: http://localhost:${PORT}/api/plots/kolapakkam`)
})

// Graceful Shutdown
const handleShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`)
  server.close(async () => {
    try {
      await closeDb()
      console.log('MongoDB connection closed.')
    } catch (e) {
      console.error('Error closing MongoDB:', e.message)
    }
    process.exit(0)
  })
}

process.on('SIGINT', () => handleShutdown('SIGINT'))
process.on('SIGTERM', () => handleShutdown('SIGTERM'))

export default app

