import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import plotsRouter from './routes/plots.js'
import kolapakkamRouter from './routes/kolapakkam.js'
import uploadRouter from './routes/upload.js'
import layoutRouter from './routes/layout.js'
import leadsRouter from './routes/leads.js'
import visitsRouter from './routes/visits.js'
import authRouter from './routes/auth.js'
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

// Serve static layout SVGs, plot images, documents and videos (checks server/uploads first, falls back to client/public)
const uploadsDir = path.join(__dirname, '../uploads')
app.use('/plots', express.static(path.join(uploadsDir, 'plots')), express.static(path.join(rootDir, 'client/public/plots')))
app.use('/images/plots', express.static(path.join(uploadsDir, 'images')), express.static(path.join(rootDir, 'client/public/images/plots')))
app.use('/images', express.static(path.join(uploadsDir, 'images')), express.static(path.join(rootDir, 'client/public/images')))
app.use('/documents', express.static(path.join(uploadsDir, 'documents')), express.static(path.join(rootDir, 'client/public/documents')))
app.use('/videos', express.static(path.join(uploadsDir, 'videos')), express.static(path.join(rootDir, 'client/public/videos')))
app.use('/uploads', express.static(uploadsDir))

// MongoDB persistent streaming fallback for uploaded images, layout SVGs, and documents (critical for Render / Vercel cloud deploys)
app.get(
  ['/images/plots/:filename', '/images/:filename', '/plots/:filename', '/documents/:filename'],
  async (req, res, next) => {
    try {
      const filename = req.params.filename
      const db = await getDb()
      const fileDoc = await db.collection('uploaded_files').findOne({ filename })
      if (fileDoc) {
        let buffer = null
        if (fileDoc.binaryData) {
          buffer = fileDoc.binaryData.buffer || fileDoc.binaryData
        } else if (fileDoc.data) {
          buffer = Buffer.from(fileDoc.data, 'base64')
        }
        if (buffer) {
          res.set('Content-Type', fileDoc.contentType || 'application/octet-stream')
          res.set('Cache-Control', 'public, max-age=31536000, immutable')
          return res.send(buffer)
        }
      }
    } catch (e) {
      console.warn('MongoDB file streaming fallback warning:', e.message)
    }
    next()
  }
)

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
app.use('/api/leads', leadsRouter)
app.use('/api/visits', visitsRouter)
app.use('/api/auth', authRouter)

// Direct website enquiry endpoint saving into leads collection under "new" stage
app.post('/api/enquiry', async (req, res) => {
  try {
    const body = req.body || {}
    const name = (body.name || body.ownerName || '').trim()
    const phone = (body.phone || '').trim()
    const email = (body.email || '').trim()

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Name and phone number are required' })
    }

    const db = await getDb()
    const id = `lead-${Date.now()}`

    // Resolve property / interest name
    let propertyName = (body.property || body.interest || '').trim()
    if (!propertyName) {
      if (body.landType) {
        propertyName = `Land Sale: ${body.landType}`
      } else {
        propertyName = 'General Enquiry'
      }
    }

    // Resolve source
    const leadSource = body.source || 'Website'

    // Resolve notes / extra details
    const extraDetails = []
    if (body.location) extraDetails.push(`Location: ${body.location}`)
    if (body.landType) extraDetails.push(`Land Type: ${body.landType}`)
    if (body.extent) extraDetails.push(`Size/Extent: ${body.extent}`)
    if (body.expectedPrice) extraDetails.push(`Expected Price: ${body.expectedPrice}`)
    if (body.datePreference) extraDetails.push(`Preferred Date: ${body.datePreference}`)

    let finalNotes = (body.notes || body.message || '').trim()
    if (extraDetails.length > 0) {
      finalNotes = finalNotes
        ? `${extraDetails.join(' | ')}\nNote: ${finalNotes}`
        : extraDetails.join(' | ')
    }
    if (!finalNotes) {
      finalNotes = `Submitted via ${leadSource}`
    }

    // Resolve requirement
    const requirement =
      body.requirement ||
      body.landType ||
      (propertyName.toLowerCase().includes('residence') || propertyName.toLowerCase().includes('apartment')
        ? '3 BHK'
        : 'Plot / Land')

    // Resolve follow-up date
    const followUpDate = body.followUpDate || body.datePreference || 'Today'

    // Timestamp formatting
    const createdDate = new Date()
    const createdDayStr = createdDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const createdTimeStr = createdDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase()
    const timeFormatted = `${createdDayStr} · ${createdTimeStr}`

    // Upcoming follow-up item
    const upcomingFollowUps = [
      {
        id: `fu-${id}`,
        type: 'Call',
        title: `Follow-up on website enquiry from ${name}`,
        when: followUpDate === 'Today' ? 'Today, 5:00 pm' : `${followUpDate}, 11:00 am`,
        completed: false,
        createdAt: createdDate,
      },
    ]

    // Activity timeline items
    const activities = [
      {
        id: `act-1-${Date.now()}`,
        text: `Enquiry received from ${leadSource} for ${propertyName}`,
        time: timeFormatted,
        createdAt: createdDate,
      },
    ]

    if (body.message || body.notes || extraDetails.length > 0) {
      activities.push({
        id: `act-2-${Date.now()}`,
        text: `Details: ${finalNotes}`,
        time: timeFormatted,
        createdAt: createdDate,
      })
    }

    let assignedAgent = body.assignedAgent
    if (!assignedAgent || !assignedAgent.name) {
      const defaultUser = await db.collection('users').findOne({}, { projection: { name: 1, color: 1, initials: 1 } })
      if (defaultUser) {
        assignedAgent = {
          name: defaultUser.name,
          initials: defaultUser.initials || defaultUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
          color: defaultUser.color || '#0B57D0',
        }
      } else {
        assignedAgent = {
          name: 'Unassigned',
          initials: 'UN',
          color: '#64748B',
        }
      }
    }

    const newLead = {
      id,
      name,
      phone,
      email,
      property: propertyName,
      propertyId: body.propertyId || null,
      stage: 'new', // Always ensure it lands in "New leads"
      source: leadSource,
      budget: Number(body.budget) || 0,
      budgetFormatted: body.budgetFormatted || body.expectedPrice || 'TBD',
      assignedAgent,
      requirement,
      unit: body.unit || 'Not allotted',
      followUpDate,
      advanceReceived: null,
      notes: finalNotes,
      upcomingFollowUps,
      activity: activities,
      payments: [],
      createdAt: createdDate,
      updatedAt: createdDate,
    }

    await db.collection('leads').insertOne(newLead)

    // If this enquiry is a site visit request, automatically record it in site_visits collection
    if (body.isSiteVisit || leadSource.toLowerCase().includes('site visit') || body.datePreference) {
      try {
        const matchedPlot = await db.collection('plots').findOne(
          { name: { $regex: `^${propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
          { projection: { _id: 0, location: 1 } }
        )
        const location = (body.location || matchedPlot?.location || 'Chennai').trim()
        const visitDateRaw = body.datePreference || body.date || 'This Saturday'
        
        let d = new Date()
        const raw = String(visitDateRaw).toLowerCase()
        if (raw.includes('saturday')) {
          const diff = (6 - d.getDay() + 7) % 7 || 7
          d.setDate(d.getDate() + diff)
        } else if (raw.includes('sunday')) {
          const diff = (7 - d.getDay()) % 7 || 7
          d.setDate(d.getDate() + diff)
        } else if (raw.includes('weekday')) {
          d.setDate(d.getDate() + 1)
          if (d.getDay() === 0) d.setDate(d.getDate() + 1)
          if (d.getDay() === 6) d.setDate(d.getDate() + 2)
        } else {
          d.setDate(d.getDate() + 1)
        }
        const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const dateLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        const weekdayLabel = d.toLocaleDateString('en-US', { weekday: 'long' })

        const newVisit = {
          id: `visit-${Date.now()}`,
          leadId: id,
          leadName: name,
          leadPhone: phone,
          leadEmail: email,
          leadInitials: name.split(/\s+/).filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CE',
          property: propertyName,
          location,
          visitDate: isoDate,
          dateLabel,
          weekdayLabel,
          visitTime: '11:00 am',
          status: 'Pending',
          cabPickup: Boolean(body.cabPickup),
          assignedAgent,
          notes: finalNotes,
          source: leadSource,
          createdAt: createdDate,
          updatedAt: createdDate,
        }
        await db.collection('site_visits').insertOne(newVisit)
      } catch (visitErr) {
        console.warn('Auto site_visits insert error in /api/enquiry:', visitErr.message)
      }
    }

    // Exclude Mongo _id from response
    const { _id, ...savedLead } = newLead

    return res.status(201).json({
      success: true,
      message: 'Enquiry saved successfully as New Lead in CRM',
      lead: savedLead,
    })
  } catch (err) {
    console.error('Error saving website enquiry:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

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
