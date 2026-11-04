import { Router } from 'express'
import { getDb } from '../config/db.js'
import { plots as fallbackPlots } from '../data/site.js'

const router = Router()

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
      hasLayoutMap: p.name === 'Kolapakkam',
      layoutSlug: p.name === 'Kolapakkam' ? 'kolapakkam' : null,
    })),
  })
})

/**
 * PATCH /api/plots or PATCH /api/plots/:id
 * Update a featured plot in MongoDB
 */
const handlePatchPlot = async (req, res) => {
  try {
    const id = req.params.id || req.body.id
    const { status, price, area, facing } = req.body

    if (!id) {
      return res.status(400).json({ success: false, error: 'Plot id is required' },)
    }

    const db = await getDb()
    const updateData = {}
    if (status) updateData.status = status
    if (price !== undefined) updateData.price = Number(price)
    if (area !== undefined) updateData.area = Number(area)
    if (facing) updateData.facing = facing
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

router.patch('/', handlePatchPlot)
router.patch('/:id', handlePatchPlot)

export default router

