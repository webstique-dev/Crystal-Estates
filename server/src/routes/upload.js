import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { getDb } from '../config/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')

const router = Router()

// Destination folders
const clientPlotsDir = path.join(rootDir, 'client/public/plots')
const clientImagesDir = path.join(rootDir, 'client/public/images/plots')
const serverUploadsPlotsDir = path.join(rootDir, 'server/uploads/plots')
const serverUploadsImagesDir = path.join(rootDir, 'server/uploads/images')

// Ensure all upload directories exist
for (const dir of [clientPlotsDir, clientImagesDir, serverUploadsPlotsDir, serverUploadsImagesDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Multer storage for raw multipart uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
})

/**
 * Helper to safely sanitize filenames and slugs
 */
function sanitizeSlug(str) {
  if (!str) return `layout-${Date.now()}`
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Extract SVG viewBox, width, and height from SVG string
 */
function extractSvgDimensions(svgContent) {
  let viewBox = '0 0 1056 816'
  let width = 1056
  let height = 816

  const viewBoxMatch = svgContent.match(/viewBox=["']([0-9.\s-]+)["']/i)
  if (viewBoxMatch && viewBoxMatch[1]) {
    viewBox = viewBoxMatch[1].trim()
    const parts = viewBox.split(/\s+/).map(Number)
    if (parts.length === 4) {
      width = parts[2]
      height = parts[3]
    }
  } else {
    const widthMatch = svgContent.match(/width=["']([0-9.]+)["']/i)
    const heightMatch = svgContent.match(/height=["']([0-9.]+)["']/i)
    if (widthMatch && heightMatch) {
      width = parseFloat(widthMatch[1]) || 1056
      height = parseFloat(heightMatch[1]) || 816
      viewBox = `0 0 ${width} ${height}`
    }
  }

  return { viewBox, width, height }
}

/**
 * POST /api/upload/image
 * Accepts image file (multipart or base64) and saves to both client/public and server/uploads
 */
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    let buffer
    let originalName = 'plot-image'
    let ext = '.jpg'

    if (req.file) {
      // Multipart upload
      buffer = req.file.buffer
      originalName = req.file.originalname
      ext = path.extname(originalName).toLowerCase() || '.jpg'
    } else if (req.body.imageBase64) {
      // Base64 upload
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '')
      buffer = Buffer.from(base64Data, 'base64')
      if (req.body.filename) {
        originalName = req.body.filename
        ext = path.extname(originalName).toLowerCase() || '.jpg'
      }
    } else {
      return res.status(400).json({ success: false, error: 'No image file or base64 provided' })
    }

    const timestamp = Date.now()
    const safeBase = sanitizeSlug(path.basename(originalName, ext))
    const filename = `plot-${safeBase}-${timestamp}${ext}`

    // Write to client/public/images/plots
    const clientPath = path.join(clientImagesDir, filename)
    fs.writeFileSync(clientPath, buffer)

    // Write copy to server/uploads/images
    const serverPath = path.join(serverUploadsImagesDir, filename)
    fs.writeFileSync(serverPath, buffer)

    const publicUrl = `/images/plots/${filename}`

    return res.json({
      success: true,
      url: publicUrl,
      filename,
      size: buffer.length,
    })
  } catch (err) {
    console.error('Image upload error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/upload/layout-svg
 * Accepts converted SVG content string (e.g. from PDF conversion) and saves as
 * client/public/plots/<slug>-layout.svg like kolapakkam-layout.svg
 */
router.post('/layout-svg', upload.single('svgFile'), async (req, res) => {
  try {
    let svgContent = ''
    let slug = ''
    let projectName = ''

    if (req.file) {
      svgContent = req.file.buffer.toString('utf-8')
      slug = req.body.layoutSlug || path.basename(req.file.originalname, '.svg')
      projectName = req.body.projectName || slug
    } else if (req.body.svgContent) {
      svgContent = req.body.svgContent
      slug = req.body.layoutSlug || 'layout'
      projectName = req.body.projectName || slug
    } else {
      return res.status(400).json({
        success: false,
        error: 'No svgContent or svgFile provided in request',
      })
    }

    // Clean slug
    const cleanSlug = sanitizeSlug(slug)
    const filename = `${cleanSlug}-layout.svg`

    // Extract viewBox and dimensions
    const { viewBox, width, height } = extractSvgDimensions(svgContent)

    // Write to client/public/plots/<slug>-layout.svg
    const clientSvgPath = path.join(clientPlotsDir, filename)
    fs.writeFileSync(clientSvgPath, svgContent, 'utf-8')

    // Write copy to server/uploads/plots/<slug>-layout.svg
    const serverSvgPath = path.join(serverUploadsPlotsDir, filename)
    fs.writeFileSync(serverSvgPath, svgContent, 'utf-8')

    const layoutBackgroundUrl = `/plots/${filename}`

    // Save/update layout metadata in MongoDB
    try {
      const db = await getDb()
      await db.collection('layout_metadata').updateOne(
        { slug: cleanSlug },
        {
          $set: {
            slug: cleanSlug,
            name: projectName || cleanSlug.replace(/-/g, ' ').toUpperCase(),
            layoutBackgroundUrl,
            viewBox,
            width,
            height,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )
    } catch (dbErr) {
      console.warn('Could not update layout_metadata in MongoDB:', dbErr.message)
    }

    return res.json({
      success: true,
      layoutBackgroundUrl,
      filename,
      slug: cleanSlug,
      viewBox,
      width,
      height,
      sizeBytes: Buffer.byteLength(svgContent, 'utf-8'),
    })
  } catch (err) {
    console.error('Layout SVG upload error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/upload/layouts
 * Returns all registered layout maps
 */
router.get('/layouts', async (req, res) => {
  try {
    const db = await getDb()
    const layouts = await db.collection('layout_metadata').find({}, { projection: { _id: 0 } }).toArray()

    // Also scan filesystem for existing SVGs in client/public/plots
    const files = fs.readdirSync(clientPlotsDir).filter((f) => f.endsWith('.svg'))
    const availableFiles = files.map((file) => ({
      filename: file,
      url: `/plots/${file}`,
      slug: file.replace(/-layout\.svg$|\.svg$/, ''),
    }))

    return res.json({
      success: true,
      databaseLayouts: layouts || [],
      files: availableFiles,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router

