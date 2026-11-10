import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDb } from '../config/db.js'
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
 * Retrieve list of all available layout maps strictly from MongoDB (layout_metadata and featured_plots with layouts)
 */
router.get('/layouts', async (req, res) => {
  try {
    let dbLayouts = []
    let featuredWithLayouts = []
    try {
      const db = await getDb()
      const [metas, plots] = await Promise.all([
        db.collection('layout_metadata').find({}, { projection: { _id: 0 } }).toArray(),
        db.collection('featured_plots').find(
          {
            $or: [
              { layoutBackgroundUrl: { $exists: true, $ne: null } },
              { layoutUrl: { $exists: true, $ne: null } },
              { hasLayoutMap: true },
            ],
          },
          { projection: { _id: 0 } }
        ).toArray(),
      ])
      dbLayouts = metas || []
      featuredWithLayouts = plots || []
    } catch (e) {
      console.warn('DB read error for layouts list:', e.message)
    }

    const layoutMap = new Map()

    // 1. Add from layout_metadata collection
    for (const doc of dbLayouts) {
      if (!doc.slug) continue
      const slug = normalizeSlug(doc.slug)
      layoutMap.set(slug, {
        slug,
        name: doc.name || doc.title || slug.replace(/-/g, ' ').toUpperCase(),
        location: doc.location || doc.village || 'Chennai',
        layoutBackgroundUrl: doc.layoutBackgroundUrl || `/plots/${slug}-layout.svg`,
        viewBox: doc.viewBox || '0 0 1056 816',
        width: doc.width || 1056,
        height: doc.height || 816,
      })
    }

    // 2. Add from featured_plots collection uploaded via CRM
    for (const prop of featuredWithLayouts) {
      const slug = normalizeSlug(
        prop.layoutSlug || prop.slug || prop.projectId || prop.name
      )
      const layoutUrl = prop.layoutBackgroundUrl || prop.layoutUrl
      if (!layoutUrl) continue

      if (!layoutMap.has(slug)) {
        layoutMap.set(slug, {
          slug,
          name: prop.name || prop.projectName || 'Layout Plan',
          location: prop.location || 'Chennai',
          layoutBackgroundUrl: layoutUrl,
          layoutUrl: layoutUrl,
          viewBox: prop.viewBox || '0 0 1056 816',
          width: prop.width || 1056,
          height: prop.height || 816,
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
 * Fetch metadata and plot boundaries dynamically for a specific layout slug from MongoDB
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

    if (!db) {
      return res.status(503).json({ success: false, error: 'Database unavailable' })
    }

    const collectionName = `${slug}_layout`

    const [dbPlots, metaDoc, propertyDoc] = await Promise.all([
      db.collection(collectionName).find({}, { projection: { _id: 0 } }).sort({ plotNo: 1, id: 1 }).toArray().catch(() => []),
      db.collection('layout_metadata').findOne({ slug }, { projection: { _id: 0 } }),
      db.collection('featured_plots').findOne(
        {
          $or: [
            { layoutSlug: slug },
            { slug },
            { projectId: slug },
            { id: slug },
          ],
        },
        { projection: { _id: 0 } }
      ),
    ])

    let metadataDoc = metaDoc

    if (!metadataDoc && propertyDoc) {
      const layoutUrl = propertyDoc.layoutBackgroundUrl || propertyDoc.layoutUrl || null
      metadataDoc = {
        slug,
        name: propertyDoc.name || propertyDoc.projectName,
        title: propertyDoc.name || propertyDoc.projectName,
        location: propertyDoc.location || '',
        village: propertyDoc.village || propertyDoc.location || '',
        taluk: propertyDoc.taluk || '',
        district: propertyDoc.district || '',
        sNo: propertyDoc.surveyNumber || '',
        layoutBackgroundUrl: layoutUrl,
        layoutUrl: layoutUrl,
        viewBox: propertyDoc.viewBox || '0 0 1056 816',
        width: propertyDoc.width || 1056,
        height: propertyDoc.height || 816,
      }
    }

    if (!metadataDoc) {
      return res.status(404).json({
        success: false,
        error: `Layout not found for slug: ${slug}`,
      })
    }

    const resolvedPlots = (dbPlots && dbPlots.length > 0) ? dbPlots : (propertyDoc?.plots || [])

    return res.json({
      success: true,
      slug,
      source: 'database',
      metadata: metadataDoc,
      plots: resolvedPlots,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * PUT /api/plots/layout/:slug/plots
 * Replace or batch update all plots for a specific layout
 */
router.put(['/layout/:slug/plots', '/layout/:slug/batch'], async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug)
    const collectionName = slug === 'kolapakkam' ? 'kolapakkam_layout' : `${slug}_layout`
    const { plots = [] } = req.body

    const db = await getDb()

    // Format all plots
    const formattedPlots = plots.map((p, idx) => {
      let centroid = { textX: p.textX, textY: p.textY }
      if ((p.textX === undefined || p.textY === undefined) && p.svgPath) {
        centroid = computePathCentroid(p.svgPath) || { textX: 100, textY: 100 }
      }

      const numId = parseInt(p.plotNo, 10)

      return {
        id: p.id || (!isNaN(numId) ? numId : idx + 1),
        plotNo: String(p.plotNo || idx + 1),
        status: p.status || 'Available',
        facing: p.facing || 'East',
        area: p.area || '1200 sq.ft',
        dimensions: typeof p.dimensions === 'string' ? p.dimensions : `${p.width || "30'0\""} x ${p.length || "40'0\""}`,
        width: p.width || "30'0\"",
        length: p.length || "40'0\"",
        price: p.price || '',
        roadWidth: p.roadWidth || '30 ft',
        type: p.type || 'Residential Plot',
        surveyNo: p.surveyNo || '',
        svgPath: p.svgPath || '',
        textX: Math.round(centroid.textX || centroid.x || 100),
        textY: Math.round(centroid.textY || centroid.y || 100),
        updatedAt: new Date(),
      }
    })

    // 1. Update layout collection in DB
    await db.collection(collectionName).deleteMany({})
    if (formattedPlots.length > 0) {
      await db.collection(collectionName).insertMany(formattedPlots)
    }

    // 2. Sync to featured_plots collection
    await db.collection('featured_plots').updateMany(
      {
        $or: [
          { layoutSlug: slug },
          { slug },
          { projectId: slug },
          { id: slug },
        ],
      },
      {
        $set: {
          plots: formattedPlots,
          totalPlots: formattedPlots.length,
          availablePlots: formattedPlots.filter((p) => p.status === 'Available').length,
          hasLayoutMap: true,
          updatedAt: new Date(),
        },
      }
    )

    return res.json({
      success: true,
      message: `${formattedPlots.length} plots saved to ${slug} layout`,
      plots: formattedPlots,
    })
  } catch (err) {
    console.error('Error saving layout plots:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/plots/layout/:slug (and /api/plots/layout/:slug/plot)
 * Add or update a single plot in a specific layout
 */
router.post(['/layout/:slug', '/layout/:slug/plot'], async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug)
    const collectionName = slug === 'kolapakkam' ? 'kolapakkam_layout' : `${slug}_layout`

    const {
      plotNo,
      status = 'Available',
      facing = 'East',
      width = "40'0\"",
      length = "30'0\"",
      dimensions,
      area = '1200 sq.ft',
      price = '₹ 42.00 Lakhs',
      roadWidth = '30 ft',
      type = 'Residential Plot',
      surveyNo = '',
      svgPath = '',
      textX,
      textY,
    } = req.body

    if (!plotNo) {
      return res.status(400).json({ success: false, error: 'plotNo is required' })
    }

    const db = await getDb()
    const numericPlotNo = parseInt(plotNo, 10)

    // Calculate centroid if coordinates not explicitly provided
    let centroid = { textX, textY }
    if ((textX === undefined || textY === undefined) && svgPath) {
      centroid = computePathCentroid(svgPath) || { textX: 100, textY: 100 }
    }

    const newPlotDoc = {
      id: isNaN(numericPlotNo) ? Date.now() : numericPlotNo,
      plotNo: String(plotNo),
      status,
      facing,
      dimensions: typeof dimensions === 'string' ? dimensions : `${width} x ${length}`,
      width,
      length,
      area,
      price,
      roadWidth,
      type,
      surveyNo,
      svgPath: svgPath || '',
      textX: Math.round(centroid.textX || centroid.x || 100),
      textY: Math.round(centroid.textY || centroid.y || 100),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection(collectionName).updateOne(
      { plotNo: String(plotNo) },
      { $set: newPlotDoc },
      { upsert: true }
    )

    // Synchronize to featured_plots.plots
    const allPlots = await db.collection(collectionName).find({}, { projection: { _id: 0 } }).toArray()
    await db.collection('featured_plots').updateMany(
      {
        $or: [
          { layoutSlug: slug },
          { slug },
          { projectId: slug },
          { id: slug },
        ],
      },
      {
        $set: {
          plots: allPlots,
          totalPlots: allPlots.length,
          availablePlots: allPlots.filter((p) => p.status === 'Available').length,
          hasLayoutMap: true,
          updatedAt: new Date(),
        },
      }
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
 * DELETE /api/plots/layout/:slug (and /api/plots/layout/:slug/plot/:plotNo)
 * Delete a plot from a specific layout
 */
router.delete(['/layout/:slug', '/layout/:slug/plot/:plotNo'], async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug)
    const collectionName = slug === 'kolapakkam' ? 'kolapakkam_layout' : `${slug}_layout`
    const plotNo = req.params.plotNo || req.query.plotNo || req.body.plotNo

    if (!plotNo) {
      return res.status(400).json({ success: false, error: 'plotNo parameter is required' })
    }

    const db = await getDb()
    const result = await db.collection(collectionName).deleteOne({ plotNo: String(plotNo) })

    // Sync to featured_plots
    const remainingPlots = await db.collection(collectionName).find({}, { projection: { _id: 0 } }).toArray()
    await db.collection('featured_plots').updateMany(
      {
        $or: [
          { layoutSlug: slug },
          { slug },
          { projectId: slug },
          { id: slug },
        ],
      },
      {
        $set: {
          plots: remainingPlots,
          totalPlots: remainingPlots.length,
          availablePlots: remainingPlots.filter((p) => p.status === 'Available').length,
          updatedAt: new Date(),
        },
      }
    )

    return res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Plot ${plotNo} deleted from ${slug}`,
      remainingPlots: remainingPlots.length,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router

