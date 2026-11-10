import { Router } from 'express'
import { getDb } from '../config/db.js'

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
 * Retrieve all featured plots dynamically from MongoDB
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDb()
    const plots = await db.collection('featured_plots').find({}, { projection: { _id: 0 } }).toArray()

    return res.json({
      success: true,
      source: 'database',
      plots: plots || [],
    })
  } catch (err) {
    console.error('MongoDB fetch error for /api/plots:', err.message)
    return res.status(500).json({
      success: false,
      source: 'database',
      error: err.message,
      plots: [],
    })
  }
})

/**
 * GET /api/plots/:id
 * Retrieve a single plot by id, projectId, or slug strictly from MongoDB
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDb()
    const plot = await db.collection('featured_plots').findOne(
      {
        $or: [
          { id },
          { projectId: id },
          { slug: id },
          { layoutSlug: id },
        ],
      },
      { projection: { _id: 0 } }
    )

    if (plot) {
      return res.json({
        success: true,
        plot,
      })
    }

    return res.status(404).json({ success: false, error: 'Property not found' })
  } catch (err) {
    console.error('MongoDB fetch error for /api/plots/:id:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/plots
 * Create a new property/plot entry in MongoDB with the 16 full specifications:
 * 1. Project ID (Automatic unique number)
 * 2. Project name
 * 3. Property type (Residential / Agricultural / Bulk land)
 * 4. Location (District, Taluk, Village)
 * 5. Survey number
 * 6. Total land area (Acres / Cents / Sq.ft.)
 * 7. Available area
 * 8. Plot number (Individual plot identification)
 * 9. Plot dimensions (Length and width)
 * 10. Price (Total price / per sq.ft. / per cent)
 * 11. Road access (Road width and access details)
 * 12. Approval status (Applicable approval details)
 * 13. Documents (Uploaded property documents)
 * 14. Images (Site photographs)
 * 15. Videos (Drone and site videos)
 * 16. Status (Available / Reserved / Booked / Sold)
 */
router.post('/', async (req, res) => {
  try {
    const {
      projectId,
      name,
      projectName,
      propertyType,
      type = 'Residential',
      location = '',
      district = '',
      taluk = '',
      village = '',
      surveyNumber = '',
      totalLandArea = '',
      totalLandAreaUnit = 'Sq.ft.',
      availableArea = '',
      availableAreaUnit = 'Sq.ft.',
      plotNumber = '',
      plotNo = '',
      plotDimensions = '',
      length = '',
      width = '',
      price = 0,
      pricePerSqft = '',
      pricePerCent = '',
      roadAccess = '',
      approvalStatus = '',
      approval = '',
      documents = [],
      images = [],
      gallery = [],
      image = '',
      videos = [],
      status = 'Available',
      description = '',
      hasLayoutMap = false,
      layoutSlug,
      layoutBackgroundUrl,
      facing = 'East',
      mapLocation = '',
      mapUrl = '',
      googleMapsUrl = '',
    } = req.body

    const finalName = (name || projectName || '').trim()
    if (!finalName) {
      return res.status(400).json({ success: false, error: 'Project name is required' })
    }

    const db = await getDb()
    const autoNumber = Math.floor(100000 + Math.random() * 900000)
    const finalProjectId = (projectId || `CE-${autoNumber}`).trim()
    const id = `ce-${Date.now()}`

    // Compose location string if not already formatted
    let finalLocation = location.trim()
    if (!finalLocation && (village || taluk || district)) {
      finalLocation = [village, taluk, district].filter(Boolean).join(', ')
    }

    // Compose plot dimensions string
    let finalDimensions = plotDimensions.trim()
    if (!finalDimensions && (length || width)) {
      finalDimensions = `${length || '-'} x ${width || '-'}`
    }

    // Images and cover
    const allImages = Array.isArray(images) && images.length > 0 ? images : Array.isArray(gallery) ? gallery : []
    const primaryImage = image || (allImages.length > 0 ? allImages[0] : '/images/hero-estate.jpg')

    const layoutPlots = Array.isArray(req.body.plots) ? req.body.plots : []
    const computedSlug =
      layoutSlug ||
      (layoutBackgroundUrl ? layoutBackgroundUrl.replace('/plots/', '').replace('-layout.svg', '') : null) ||
      finalName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')

    const newPlot = {
      id,
      projectId: finalProjectId,
      name: finalName,
      projectName: finalName,
      propertyType: propertyType || type || 'Residential',
      type: propertyType || type || 'Residential',
      location: finalLocation || 'Chennai, Tamil Nadu',
      district: district.trim(),
      taluk: taluk.trim(),
      village: village.trim(),
      surveyNumber: surveyNumber.trim(),
      totalLandArea: totalLandArea || '1200',
      totalLandAreaUnit: totalLandAreaUnit || 'Sq.ft.',
      availableArea: availableArea || totalLandArea || '1200',
      availableAreaUnit: availableAreaUnit || totalLandAreaUnit || 'Sq.ft.',
      plotNumber: (plotNumber || plotNo || '').trim(),
      plotNo: (plotNumber || plotNo || '').trim(),
      plotDimensions: finalDimensions,
      price: price ? Number(price) : 0,
      priceFormatted: formatPrice(price),
      pricePerSqft: pricePerSqft ? Number(pricePerSqft) : null,
      pricePerCent: pricePerCent ? Number(pricePerCent) : null,
      roadAccess: roadAccess.trim(),
      approvalStatus: approvalStatus || approval || 'Clear Title & Patta',
      approval: approvalStatus || approval || 'Clear Title & Patta',
      rera: approvalStatus || approval || 'Clear Title & Patta',
      documents: Array.isArray(documents) ? documents : [],
      images: allImages,
      gallery: allImages,
      image: primaryImage,
      videos: Array.isArray(videos) ? videos : [],
      status: status || 'Available',
      badge: status || 'Available',
      facing,
      description: description || '',
      mapLocation: (mapLocation || mapUrl || googleMapsUrl || '').trim(),
      mapUrl: (mapUrl || mapLocation || googleMapsUrl || '').trim(),
      googleMapsUrl: (googleMapsUrl || mapLocation || mapUrl || '').trim(),
      hasLayoutMap: Boolean(hasLayoutMap || layoutBackgroundUrl || layoutPlots.length > 0),
      layoutSlug: computedSlug,
      layoutBackgroundUrl: layoutBackgroundUrl || null,
      plots: layoutPlots,
      totalPlots: layoutPlots.length,
      availablePlots: layoutPlots.filter((p) => p.status === 'Available').length,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('featured_plots').insertOne(newPlot)

    // Synchronize layout collection in MongoDB if plots or layout are provided
    if (computedSlug) {
      const collectionName = `${computedSlug}_layout`
      if (layoutPlots.length > 0) {
        await db.collection(collectionName).deleteMany({})
        await db.collection(collectionName).insertMany(layoutPlots)
      }
      await db.collection('layout_metadata').updateOne(
        { slug: computedSlug },
        {
          $set: {
            slug: computedSlug,
            name: finalName,
            title: finalName,
            location: finalLocation,
            layoutBackgroundUrl: layoutBackgroundUrl || null,
            viewBox: req.body.viewBox || '0 0 1056 816',
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )
    }

    return res.status(201).json({
      success: true,
      message: 'Property created successfully with all 16 specifications',
      plot: newPlot,
    })
  } catch (err) {
    console.error('Error creating plot:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * PATCH /api/plots/:id
 * Update a featured plot in MongoDB
 */
const handlePatchPlot = async (req, res) => {
  try {
    const id = req.params.id || req.body.id
    if (!id) {
      return res.status(400).json({ success: false, error: 'Property ID is required' })
    }

    const updates = { ...req.body, updatedAt: new Date() }
    delete updates._id

    if (updates.price) {
      updates.priceFormatted = formatPrice(updates.price)
    }

    if (Array.isArray(updates.plots)) {
      updates.totalPlots = updates.plots.length
      updates.availablePlots = updates.plots.filter((p) => p.status === 'Available').length
      updates.hasLayoutMap = Boolean(updates.hasLayoutMap || updates.layoutBackgroundUrl || updates.plots.length > 0)
    }

    const db = await getDb()
    const result = await db.collection('featured_plots').updateOne(
      { $or: [{ id }, { projectId: id }] },
      { $set: updates },
      { upsert: true }
    )

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' })
    }

    // If plots are updated, sync to layout collection and layout_metadata
    if (Array.isArray(updates.plots)) {
      const existingDoc = await db.collection('featured_plots').findOne({ $or: [{ id }, { projectId: id }] })
      const slug =
        updates.layoutSlug ||
        existingDoc?.layoutSlug ||
        existingDoc?.slug ||
        (existingDoc?.name ? existingDoc.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') : id)

      if (slug) {
        const collectionName = `${slug}_layout`
        await db.collection(collectionName).deleteMany({})
        if (updates.plots.length > 0) {
          await db.collection(collectionName).insertMany(updates.plots)
        }
        await db.collection('layout_metadata').updateOne(
          { slug },
          {
            $set: {
              slug,
              name: existingDoc?.name || slug,
              title: existingDoc?.name || slug,
              location: existingDoc?.location || '',
              layoutBackgroundUrl: updates.layoutBackgroundUrl || existingDoc?.layoutBackgroundUrl || null,
              viewBox: updates.viewBox || existingDoc?.viewBox || '0 0 1056 816',
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        )
      }
    }

    return res.json({
      success: true,
      message: 'Property updated successfully',
    })
  } catch (err) {
    console.error('Error updating plot:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
}

router.patch('/:id', handlePatchPlot)
router.patch('/', handlePatchPlot)

/**
 * DELETE /api/plots/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDb()
    const result = await db.collection('featured_plots').deleteOne({ $or: [{ id }, { projectId: id }] })

    return res.json({
      success: true,
      message: `Property ${id} deleted`,
      deletedCount: result.deletedCount,
    })
  } catch (err) {
    console.error('Error deleting plot:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router
