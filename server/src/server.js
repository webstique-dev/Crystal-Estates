import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import plotsRouter from './routes/plots.js'
import kolapakkamRouter from './routes/kolapakkam.js'
import uploadRouter from './routes/upload.js'
import layoutRouter from './routes/layout.js'
import { getDb, closeDb } from './config/db.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../..')

const app = express()
const PORT = process.env.PORT || 5000

// Parse allowed origins from environment variable (supports comma-separated list, wildcards, and trailing slashes)
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]))
const allowAll = allowedOrigins.includes('*')

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (e.g. Next.js server-side rewrites, mobile apps, curl, Postman)
  if (!origin) return true
  if (allowAll) return true

  const normalized = origin.replace(/\/$/, '')
  if (allowedOrigins.includes(normalized)) return true

  // Support wildcard subdomains (e.g. *.vercel.app or *.railway.app)
  return allowedOrigins.some((allowed) => {
    if (allowed.startsWith('*.')) {
      const suffix = allowed.slice(1)
      try {
        const { hostname } = new URL(origin)
        return hostname.endsWith(suffix)
      } catch {
        return false
      }
    }
    return false
  })
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`)
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}

// Middleware
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Support high payload size for SVG vector data and base64 images
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`)
  next()
})

// Serve static layout SVGs and plot images
app.use('/plots', express.static(path.join(rootDir, 'client/public/plots')))
app.use('/images', express.static(path.join(rootDir, 'client/public/images')))

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
      upload: '/api/upload',
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
app.use('/api/upload', uploadRouter)
app.use('/api/plots', layoutRouter)
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
  console.log(`📤 Upload API: http://localhost:${PORT}/api/upload`)
  console.log(`🌐 Allowed CORS Origins:`, allowedOrigins.length > 0 ? allowedOrigins : 'all')
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
