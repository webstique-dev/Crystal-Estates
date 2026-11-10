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
const clientDocumentsDir = path.join(rootDir, 'client/public/documents')
const clientVideosDir = path.join(rootDir, 'client/public/videos')

const crmPlotsDir = path.join(rootDir, 'crm/public/plots')
const crmImagesDir = path.join(rootDir, 'crm/public/images/plots')
const crmDocumentsDir = path.join(rootDir, 'crm/public/documents')
const crmVideosDir = path.join(rootDir, 'crm/public/videos')

const serverUploadsPlotsDir = path.join(rootDir, 'server/uploads/plots')
const serverUploadsImagesDir = path.join(rootDir, 'server/uploads/images')
const serverUploadsDocumentsDir = path.join(rootDir, 'server/uploads/documents')
const serverUploadsVideosDir = path.join(rootDir, 'server/uploads/videos')

// Ensure all upload directories exist
const allDirs = [
  clientPlotsDir,
  clientImagesDir,
  clientDocumentsDir,
  clientVideosDir,
  crmPlotsDir,
  crmImagesDir,
  crmDocumentsDir,
  crmVideosDir,
  serverUploadsPlotsDir,
  serverUploadsImagesDir,
  serverUploadsDocumentsDir,
  serverUploadsVideosDir,
]

for (const dir of allDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Multer storage for raw multipart uploads (allows up to 100MB for drone videos/large docs)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
})

function sanitizeSlug(str) {
  if (!str) return `item-${Date.now()}`
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

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
 * Helper to write buffer safely to multiple destination folders
 */
function saveToDirs(dirs, filename, buffer) {
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, filename), buffer)
    } catch (e) {
      console.warn(`Could not write to ${dir}:`, e.message)
    }
  }
}

/**
 * POST /api/upload/image
 * Accepts image file (multipart or base64) and saves to client, crm, and server
 */
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    let buffer
    let originalName = 'plot-image'
    let ext = '.jpg'

    if (req.file) {
      buffer = req.file.buffer
      originalName = req.file.originalname
      ext = path.extname(originalName).toLowerCase() || '.jpg'
    } else if (req.body.imageBase64) {
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

    saveToDirs([clientImagesDir, crmImagesDir, serverUploadsImagesDir], filename, buffer)

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
 * POST /api/upload/document
 * Accepts property documents (PDF, DOC, DOCX, Patta, Legal Deeds)
 */
router.post('/document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No document file provided' })
    }

    const buffer = req.file.buffer
    const originalName = req.file.originalname
    const ext = path.extname(originalName).toLowerCase() || '.pdf'
    const timestamp = Date.now()
    const safeBase = sanitizeSlug(path.basename(originalName, ext))
    const filename = `doc-${safeBase}-${timestamp}${ext}`

    saveToDirs([clientDocumentsDir, crmDocumentsDir, serverUploadsDocumentsDir], filename, buffer)

    const publicUrl = `/documents/${filename}`

    return res.json({
      success: true,
      url: publicUrl,
      filename,
      name: originalName,
      size: buffer.length,
      sizeFormatted: `${(buffer.length / 1024).toFixed(1)} KB`,
    })
  } catch (err) {
    console.error('Document upload error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/upload/video
 * Accepts site drone videos or promotional video files (MP4, WEBM, MOV)
 */
router.post('/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' })
    }

    const buffer = req.file.buffer
    const originalName = req.file.originalname
    const ext = path.extname(originalName).toLowerCase() || '.mp4'
    const timestamp = Date.now()
    const safeBase = sanitizeSlug(path.basename(originalName, ext))
    const filename = `video-${safeBase}-${timestamp}${ext}`

    saveToDirs([clientVideosDir, crmVideosDir, serverUploadsVideosDir], filename, buffer)

    const publicUrl = `/videos/${filename}`

    return res.json({
      success: true,
      url: publicUrl,
      filename,
      name: originalName,
      size: buffer.length,
      sizeFormatted: `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`,
    })
  } catch (err) {
    console.error('Video upload error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/upload/layout-file
 * Accepts any layout blueprint file format (PDF, CAD DWG/DXF, SVG, PNG, JPG, DOC, etc.)
 * Saves directly without any conversion.
 */
router.post('/layout-file', upload.single('layoutFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No layout file provided' })
    }

    const buffer = req.file.buffer
    const originalName = req.file.originalname
    const ext = path.extname(originalName).toLowerCase() || '.pdf'
    const timestamp = Date.now()
    const safeBase = sanitizeSlug(path.basename(originalName, ext))
    const projectName = req.body.projectName || safeBase
    const filename = `layout-${safeBase}-${timestamp}${ext}`

    saveToDirs(
      [clientPlotsDir, crmPlotsDir, serverUploadsPlotsDir, clientDocumentsDir, crmDocumentsDir],
      filename,
      buffer
    )

    const publicUrl = `/plots/${filename}`
    const isSvg = ext === '.svg'

    let viewBox = '0 0 1056 816'
    let width = 1056
    let height = 816

    if (isSvg) {
      try {
        const svgContent = buffer.toString('utf-8')
        const dims = extractSvgDimensions(svgContent)
        viewBox = dims.viewBox
        width = dims.width
        height = dims.height

        const db = await getDb()
        await db.collection('layout_metadata').updateOne(
          { slug: safeBase },
          {
            $set: {
              slug: safeBase,
              name: projectName,
              layoutBackgroundUrl: publicUrl,
              viewBox,
              width,
              height,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true }
        )
      } catch (svgErr) {
        console.warn('SVG layout metadata extraction warning:', svgErr.message)
      }
    }

    return res.json({
      success: true,
      url: publicUrl,
      filename,
      name: originalName,
      slug: safeBase,
      size: buffer.length,
      sizeFormatted: `${(buffer.length / 1024).toFixed(1)} KB`,
      isSvg,
      viewBox,
      width,
      height,
    })
  } catch (err) {
    console.error('Layout file upload error:', err)
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

    const cleanSlug = sanitizeSlug(slug)
    const filename = `${cleanSlug}-layout.svg`
    const { viewBox, width, height } = extractSvgDimensions(svgContent)

    saveToDirs([clientPlotsDir, crmPlotsDir, serverUploadsPlotsDir], filename, Buffer.from(svgContent, 'utf-8'))

    const layoutBackgroundUrl = `/plots/${filename}`

    // Save/update layout metadata in MongoDB
    try {
      const db = await getDb()
      await db.collection('layout_metadata').updateOne(
        { slug: cleanSlug },
        {
          $set: {
            slug: cleanSlug,
            name: projectName,
            layoutBackgroundUrl,
            viewBox,
            width,
            height,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      )
    } catch (dbErr) {
      console.warn('MongoDB layout metadata upsert warning:', dbErr.message)
    }

    return res.json({
      success: true,
      slug: cleanSlug,
      filename,
      layoutBackgroundUrl,
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
