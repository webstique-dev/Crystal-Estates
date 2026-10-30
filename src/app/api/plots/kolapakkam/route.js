import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { KOLAPAKKAM_METADATA } from '@/data/kolapakkamPlots'
import { computePathCentroid } from '@/lib/svgPathCentroid'

// GET /api/plots/kolapakkam - Fetch layout metadata and plots dynamically from MongoDB
export async function GET() {
  try {
    const db = await getDb()

    const [plots, metadataDoc] = await Promise.all([
      db.collection('kolapakkam_layout').find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray(),
      db.collection('layout_metadata').findOne({ slug: 'kolapakkam' }, { projection: { _id: 0 } }),
    ])

    return NextResponse.json({
      success: true,
      source: 'database',
      metadata: metadataDoc || KOLAPAKKAM_METADATA,
      plots: plots || [],
    })
  } catch (err) {
    console.error('MongoDB fetch error for /api/plots/kolapakkam:', err.message)
    return NextResponse.json({
      success: false,
      error: err.message,
      metadata: KOLAPAKKAM_METADATA,
      plots: [],
    }, { status: 500 })
  }
}

// POST /api/plots/kolapakkam - Create and add a new plot to MongoDB
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      plotNo,
      status = 'Available',
      facing = 'East',
      width = '40\'0"',
      length = '30\'0"',
      area = '1200 sq.ft',
      price = '₹ 42.00 Lakhs',
      svgPath,
      textX,
      textY,
    } = body

    if (!plotNo) {
      return NextResponse.json({ success: false, error: 'plotNo is required' }, { status: 400 })
    }

    const db = await getDb()
    const collection = db.collection('kolapakkam_layout')

    // Find next numeric ID
    const highestPlot = await collection.find({}).sort({ id: -1 }).limit(1).toArray()
    const nextId = highestPlot.length > 0 && typeof highestPlot[0].id === 'number'
      ? highestPlot[0].id + 1
      : Date.now()

    // Default SVG Path if not provided (e.g., an accessible plot block)
    const finalSvgPath = svgPath || 'M 685,320 L 760,320 L 760,360 L 685,360 Z'
    
    // Automatically compute label centroid from the SVG boundary path
    const calculatedCentroid = computePathCentroid(finalSvgPath)
    let finalTextX = calculatedCentroid?.textX ?? 722
    let finalTextY = calculatedCentroid?.textY ?? 340

    // If explicit coordinates were passed, verify they sit within or near the plot bounds
    if (textX !== undefined && textY !== undefined && calculatedCentroid) {
      const parsedX = Number(textX)
      const parsedY = Number(textY)
      const inBounds =
        parsedX >= calculatedCentroid.minX - 40 &&
        parsedX <= calculatedCentroid.maxX + 40 &&
        parsedY >= calculatedCentroid.minY - 40 &&
        parsedY <= calculatedCentroid.maxY + 40
      if (inBounds) {
        finalTextX = parsedX
        finalTextY = parsedY
      }
    } else if (textX !== undefined) {
      finalTextX = Number(textX)
    } else if (textY !== undefined) {
      finalTextY = Number(textY)
    }

    const newPlot = {
      id: nextId,
      plotNo: String(plotNo),
      status,
      facing,
      width,
      length,
      area: typeof area === 'number' ? `${area} sq.ft` : area,
      price,
      svgPath: finalSvgPath,
      textX: finalTextX,
      textY: finalTextY,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert or update if plotNo already exists
    const existing = await collection.findOne({ plotNo: String(plotNo) })
    if (existing) {
      await collection.updateOne({ plotNo: String(plotNo) }, { $set: newPlot })
    } else {
      await collection.insertOne(newPlot)
    }

    // Return the newly added plot without _id
    const { _id: _unused, ...createdPlot } = newPlot

    return NextResponse.json({
      success: true,
      plot: createdPlot,
      message: `Plot ${plotNo} added successfully!`,
    }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PATCH /api/plots/kolapakkam - Update a plot in Kolapakkam layout (e.g. mark Available/Booked/Sold)
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { plotNo, id, status, price, facing, width, length, area, svgPath, textX, textY } = body

    if (!plotNo && id === undefined) {
      return NextResponse.json({ success: false, error: 'plotNo or id is required' }, { status: 400 })
    }

    const query = plotNo ? { plotNo: String(plotNo) } : { id: Number(id) }

    const updateData = {}
    if (status) updateData.status = status
    if (price !== undefined) updateData.price = price
    if (facing) updateData.facing = facing
    if (width) updateData.width = width
    if (length) updateData.length = length
    if (area) updateData.area = area
    if (svgPath) {
      updateData.svgPath = svgPath
      // Auto-compute centroid if coordinates aren't explicitly provided or if path changed
      const centroid = computePathCentroid(svgPath)
      if (centroid) {
        if (textX === undefined && textY === undefined) {
          updateData.textX = centroid.textX
          updateData.textY = centroid.textY
        }
      }
    }
    if (textX !== undefined) updateData.textX = Number(textX)
    if (textY !== undefined) updateData.textY = Number(textY)
    updateData.updatedAt = new Date()

    const db = await getDb()
    const result = await db.collection('kolapakkam_layout').updateOne(query, { $set: updateData })

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      updated: updateData,
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/plots/kolapakkam - Delete a plot from MongoDB
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const plotNo = searchParams.get('plotNo')

    if (!id && !plotNo) {
      return NextResponse.json({ success: false, error: 'id or plotNo query parameter is required' }, { status: 400 })
    }

    const query = plotNo ? { plotNo: String(plotNo) } : { id: Number(id) }

    const db = await getDb()
    const result = await db.collection('kolapakkam_layout').deleteOne(query)

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Plot ${plotNo || id} deleted successfully`,
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
