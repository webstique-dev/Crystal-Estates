import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { plots as fallbackPlots } from '@/data/site'

// GET /api/plots - Retrieve all featured plots from MongoDB
export async function GET() {
  try {
    const db = await getDb()
    const plots = await db.collection('featured_plots').find({}, { projection: { _id: 0 } }).toArray()

    if (plots && plots.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'database',
        plots,
      })
    }
  } catch (err) {
    console.error('MongoDB fetch error for /api/plots, using fallback:', err.message)
  }

  // Graceful fallback to static site data if DB is temporarily unreachable
  return NextResponse.json({
    success: true,
    source: 'fallback',
    plots: fallbackPlots.map((p) => ({
      ...p,
      hasLayoutMap: p.name === 'Kolapakkam',
      layoutSlug: p.name === 'Kolapakkam' ? 'kolapakkam' : null,
    })),
  })
}

// PATCH /api/plots - Update a featured plot in MongoDB
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, status, price, area, facing } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Plot id is required' }, { status: 400 })
    }

    const db = await getDb()
    const updateData = {}
    if (status) updateData.status = status
    if (price !== undefined) updateData.price = Number(price)
    if (area !== undefined) updateData.area = Number(area)
    if (facing) updateData.facing = facing
    updateData.updatedAt = new Date()

    const result = await db.collection('featured_plots').updateOne(
      { id },
      { $set: updateData }
    )

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      updated: updateData,
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
