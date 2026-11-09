import { Router } from 'express'
import { getDb } from '../config/db.js'
import { plots as fallbackPlots } from '../data/site.js'

const router = Router()

/**
 * Format currency number to Indian format (e.g. ₹ 42.00 Lakhs)
 */
function formatPrice(amount) {
  if (!amount || isNaN(amount)) return 'Price on Request'
  const num = Number(amount)
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2)} Cr`
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(2)} Lakhs`
  }
  return `₹ ${num.toLocaleString('en-IN')}`
}

/**
 * GET /api/plots
 * Retrieve all featured plots from MongoDB with graceful fallback
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDb()
    const plots = await db.collection('featured_plots').find({}, { projection: { _id: 0 } }).toArray()

    if (plots && plots.length > 0) {
      return res.json({
        success: true,
        source: 'database',
        plots,
      })
    }
  } catch (err) {
    console.error('MongoDB fetch error for /api/plots, using fallback:', err.message)
  }

  // Graceful fallback to static site data if DB is temporarily unreachable or empty
  return res.json({
    success: true,
    source: 'fallback',
    plots: fallbackPlots.map((p) => ({
      ...p,
      hasLayoutMap: p.name === 'Kolapakkam' || Boolean(p.layoutBackgroundUrl),
      layoutSlug: p.name === 'Kolapakkam' ? 'kolapakkam' : p.layoutSlug || null,
    })),
  })
})

/**
 * POST /api/plots
 * Create a new plot/project entry in MongoDB
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type = 'Residential Plots',
      location = 'Chennai',
      area,
      price,
      facing = 'East',
      status = 'Available',
      approval = 'CMDA & RERA Approved',
      image = '/images/plot-1.jpg',
      gallery = [],
      hasLayoutMap = false,
      layoutSlug,
      layoutBackgroundUrl,
      description,
    } = req.body

    if (!name) {
      return res.status(400).json({ success: false, error: 'Project / Plot name is required' })
    }

    const db = await getDb()
    const numericId = Date.now()
    const id = `ce-${numericId}`

    const newPlot = {
      id,
      name: name.trim(),
      type,
      location: location.trim(),
      area: area ? Number(area) : 1200,
      price: price ? Number(price) : 3500000,
      priceFormatted: formatPrice(price),
      facing,
      status,
      approval,
      image,
      gallery: Array.isArray(gallery) ? gallery : image ? [image] : [],
      hasLayoutMap: Boolean(hasLayoutMap || layoutBackgroundUrl),
      layoutSlug: layoutSlug || (layoutBackgroundUrl ? layoutBackgroundUrl.replace('/plots/', '').replace('-layout.svg', '') : null),
      layoutBackgroundUrl: layoutBackgroundUrl || null,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('featured_plots').insertOne(newPlot)

    return res.status(201).json({
      success: true,
      message: 'Plot created successfully',
      plot: newPlot,
    })
  } catch (err) {
    console.error('Error creating plot:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * PATCH /api/plots or PATCH /api/plots/:id
 * Update a featured plot in MongoDB
 */
const handlePatchPlot = async (req, res) => {
  try {
    const id = req.params.id || req.body.id
    const {
      status,
      price,
      area,
      facing,
      image,
      gallery,
      layoutBackgroundUrl,
      hasLayoutMap,
      name,
      location,
      approval,
      type,
    } = req.body

    if (!id) {
      return res.status(400).json({ success: false, error: 'Plot id is required' })
    }

    const db = await getDb()
    const updateData = {}
    if (name) updateData.name = name
    if (type) updateData.type = type
    if (location) updateData.location = location
    if (approval) updateData.approval = approval
    if (status) updateData.status = status
    if (price !== undefined) {
      updateData.price = Number(price)
      updateData.priceFormatted = formatPrice(price)
    }
    if (area !== undefined) updateData.area = Number(area)
    if (facing) updateData.facing = facing
    if (image) updateData.image = image
    if (gallery) updateData.gallery = gallery
    if (layoutBackgroundUrl !== undefined) {
      updateData.layoutBackgroundUrl = layoutBackgroundUrl
      updateData.hasLayoutMap = Boolean(layoutBackgroundUrl)
    }
    if (hasLayoutMap !== undefined) updateData.hasLayoutMap = Boolean(hasLayoutMap)
    updateData.updatedAt = new Date()

    const result = await db.collection('featured_plots').updateOne(
      { id: isNaN(id) ? id : Number(id) },
      { $set: updateData }
    )

    return res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      updated: updateData,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/plots/:id
 * Delete a plot from MongoDB
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id
    if (!id) return res.status(400).json({ success: false, error: 'Plot ID required' })

    const db = await getDb()
    const result = await db.collection('featured_plots').deleteOne({
      id: isNaN(id) ? id : Number(id),
    })

    return res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Plot ${id} deleted successfully`,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

router.patch('/', handlePatchPlot)
router.patch('/:id', handlePatchPlot)

export default router
