import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDb } from '../config/db.js'
import { KOLAPAKKAM_METADATA } from '../data/kolapakkamPlots.js'
import { computePathCentroid } from '../lib/svgPathCentroid.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const plotsDir = path.join(rootDir, 'client/public/plots')

const router = Router()

/**
 * Helper to normalize slug
 */
function normalizeSlug(slug) {
  if (!slug) return 'kolapakkam'
  return slug
    .toLowerCase()
    .trim()
    .replace(/-layout\.svg$|\.svg$/i, '')
    .replace(/-layout$/i, '')
    .replace(/[^a-z0-9_-]/g, '-')
}

/**
 * Helper to extract SVG dimensions and viewBox from SVG file
 */
function getSvgDetailsFromFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null
    const content = fs.readFileSync(filePath, 'utf-8')
    let viewBox = '0 0 1056 816'
    let width = 1056
    let height = 816

    const vbMatch = content.match(/viewBox=["']([0-9.\s-]+)["']/i)
    if (vbMatch && vbMatch[1]) {
      viewBox = vbMatch[1].trim()
      const parts = viewBox.split(/\s+/).map(Number)
      if (parts.length === 4) {
        width = parts[2]
        height = parts[3]
      }
    } else {
      const wMatch = content.match(/width=["']([0-9.]+)["']/i)
      const hMatch = content.match(/height=["']([0-9.]+)["']/i)
      if (wMatch && hMatch) {
        width = parseFloat(wMatch[1]) || 1056
        height = parseFloat(hMatch[1]) || 816
        viewBox = `0 0 ${width} ${height}`
      }
    }
    return { viewBox, width, height }
  } catch (err) {
    console.warn(`Error reading SVG file ${filePath}:`, err.message)
    return null
  }
}

/**
 * GET /api/plots/layouts
 * Retrieve list of all available layout maps (both DB registered and discovered in client/public/plots)
 */
router.get('/layouts', async (req, res) => {
  try {
    let dbLayouts = []
    let db = null
    try {
      db = await getDb()
      dbLayouts = await db.collection('layout_metadata').find({}, { projection: { _id: 0 } }).toArray()
    } catch (e) {
      console.warn('DB read error for layouts list:', e.message)
    }

    // Discover all SVG files in client/public/plots
    let svgFiles = []
    if (fs.existsSync(plotsDir)) {
      svgFiles = fs.readdirSync(plotsDir).filter((f) => f.endsWith('.svg'))
    }

    const layoutMap = new Map()

    // 1. Always ensure Kolapakkam default exists
    layoutMap.set('kolapakkam', {
      slug: 'kolapakkam',
      name: KOLAPAKKAM_METADATA.name || "Crystal Garden's - Kolapakkam",
      location: KOLAPAKKAM_METADATA.location || 'Kolapakkam, Sriperumbudur Taluk, Chennai',
      layoutBackgroundUrl: '/plots/kolapakkam-layout.svg',
      viewBox: KOLAPAKKAM_METADATA.viewBox || '0 0 1056 816',
      width: KOLAPAKKAM_METADATA.width || 1056,
      height: KOLAPAKKAM_METADATA.height || 816,
    })

    // 2. Add from DB
    for (const doc of dbLayouts) {
      if (!doc.slug) continue
      const slug = normalizeSlug(doc.slug)
      layoutMap.set(slug, {
        slug,
        name: doc.name || slug.replace(/-/g, ' ').toUpperCase(),
        location: doc.location || 'Chennai',
        layoutBackgroundUrl: doc.layoutBackgroundUrl || `/plots/${slug}-layout.svg`,
        viewBox: doc.viewBox || '0 0 1056 816',
        width: doc.width || 1056,
        height: doc.height || 816,
      })
    }

    // 3. Add discovered SVG files from disk
    for (const file of svgFiles) {
      const slug = normalizeSlug(file)
      if (!layoutMap.has(slug)) {
        const filePath = path.join(plotsDir, file)
        const details = getSvgDetailsFromFile(filePath) || {
          viewBox: '0 0 1056 816',
          width: 1056,
          height: 816,
        }
        const friendlyName = slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')

        layoutMap.set(slug, {
          slug,
          name: `${friendlyName} Layout`,
          location: 'Chennai',
          layoutBackgroundUrl: `/plots/${file}`,
          viewBox: details.viewBox,
          width: details.width,
          height: details.height,
        })
      }
    }

    const layoutsList = Array.from(layoutMap.values())

    return res.json({
      success: true,
      layouts: layoutsList,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/plots/layout/:slug
 * Fetch metadata and plot boundaries for a specific layout slug
 */
router.get('/layout/:slug', async (req, res) => {
  try {
    const rawSlug = req.params.slug
    const slug = normalizeSlug(rawSlug)

    let db = null
    try {
      db = await getDb()
    } catch (e) {
      console.warn('DB error in /api/plots/layout/:slug:', e.message)
    }

    // Determine collection name
    const collectionName = slug === 'kolapakkam' ? 'kolapakkam_layout' : `${slug}_layout`

    let plots = []
    let metadataDoc = null

    if (db) {
      try {
        const [dbPlots, meta] = await Promise.all([
          db.collection(collectionName).find({}, { projection: { _id: 0 } }).sort({ plotNo: 1, id: 1 }).toArray(),
          db.collection('layout_metadata').findOne({ slug }, { projection: { _id: 0 } }),
        ])
        plots = dbPlots || []
        metadataDoc = meta
      } catch (dbErr) {
        console.warn('DB query error for layout:', dbErr.message)
      }
    }

    // If metadata not in DB, inspect file on disk
    if (!metadataDoc) {
      if (slug === 'kolapakkam') {
        metadataDoc = KOLAPAKKAM_METADATA
      } else {
        // Look for file on disk
        const possibleFiles = [
          path.join(plotsDir, `${slug}-layout.svg`),
          path.join(plotsDir, `${slug}.svg`),
        ]
        let foundFile = possibleFiles.find((p) => fs.existsSync(p))
        let svgDetails = foundFile ? getSvgDetailsFromFile(foundFile) : null

        const friendlyName = slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')

        metadataDoc = {
          slug,
          name: `${friendlyName} Layout`,
          location: 'Chennai',
          layoutBackgroundUrl: foundFile ? `/plots/${path.basename(foundFile)}` : `/plots/${slug}-layout.svg`,
          viewBox: svgDetails?.viewBox || '0 0 1056 816',
          width: svgDetails?.width || 1056,
          height: svgDetails?.height || 816,
        }
      }
    }

    return res.json({
      success: true,
      slug,
      source: db ? 'database' : 'filesystem',
      metadata: metadataDoc,
      plots,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/plots/layout/:slug
 * Add plot to a specific layout
 */
router.post('/layout/:slug', async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug)
    const collectionName = slug === 'kolapakkam' ? 'kolapakkam_layout' : `${slug}_layout`

    const {
      plotNo,
      status = 'Available',
      facing = 'East',
      width = "40'0\"",
      length = "30'0\"",
      area = '1200 sq.ft',
      price = '₹ 42.00 Lakhs',
      svgPath,
      textX,
      textY,
    } = req.body

    if (!plotNo) {
      return res.status(400).json({ success: false, error: 'plotNo is required' })
    }

    const db = await getDb()
    const numericPlotNo = parseInt(plotNo, 10)

    // Calculate centroid if coordinates not explicitly provided
    let centroid = { x: textX, y: textY }
    if ((textX === undefined || textY === undefined) && svgPath) {
      centroid = computePathCentroid(svgPath)
    }

    const newPlotDoc = {
      id: isNaN(numericPlotNo) ? Date.now() : numericPlotNo,
      plotNo: String(plotNo),
      status,
      facing,
      dimensions: { width, length },
      area,
      price,
      svgPath: svgPath || '',
      textX: Math.round(centroid.x || 100),
      textY: Math.round(centroid.y || 100),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection(collectionName).updateOne(
      { plotNo: String(plotNo) },
      { $set: newPlotDoc },
      { upsert: true }
    )

    return res.status(201).json({
      success: true,
      message: `Plot ${plotNo} added to ${slug} layout`,
      plot: newPlotDoc,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * PATCH /api/plots/layout/:slug
 * Update plot details or status on a specific layout
 */
router.patch('/layout/:slug', async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug)
    const collectionName = slug === 'kolapakkam' ? 'kolapakkam_layout' : `${slug}_layout`

    const { plotNo, status, facing, dimensions, area, price, svgPath, textX, textY } = req.body

    if (!plotNo) {
      return res.status(400).json({ success: false, error: 'plotNo is required' })
    }

    const db = await getDb()
    const updateFields = { updatedAt: new Date() }

    if (status) updateFields.status = status
    if (facing) updateFields.facing = facing
    if (dimensions) updateFields.dimensions = dimensions
    if (area) updateFields.area = area
    if (price) updateFields.price = price
    if (svgPath) updateFields.svgPath = svgPath
    if (textX !== undefined) updateFields.textX = textX
    if (textY !== undefined) updateFields.textY = textY

    const result = await db.collection(collectionName).updateOne(
      { plotNo: String(plotNo) },
      { $set: updateFields }
    )

    return res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      updated: updateFields,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * DELETE /api/plots/layout/:slug
 * Delete a plot from a specific layout
 */
router.delete('/layout/:slug', async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug)
    const collectionName = slug === 'kolapakkam' ? 'kolapakkam_layout' : `${slug}_layout`
    const plotNo = req.query.plotNo || req.body.plotNo

    if (!plotNo) {
      return res.status(400).json({ success: false, error: 'plotNo parameter is required' })
    }

    const db = await getDb()
    const result = await db.collection(collectionName).deleteOne({ plotNo: String(plotNo) })

    return res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Plot ${plotNo} deleted from ${slug}`,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router

