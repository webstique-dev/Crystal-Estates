import { Router } from 'express'
import { getDb } from '../config/db.js'

const router = Router()

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'CE'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatVisitDateParts(dateStr, timeStr) {
  let d = new Date()
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, day] = dateStr.split('-').map(Number)
    d = new Date(y, m - 1, day)
  } else {
    d.setDate(d.getDate() + 1)
  }

  const dateLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const weekdayLabel = d.toLocaleDateString('en-US', { weekday: 'long' })

  let timeLabel = '11:00 am'
  if (timeStr) {
    const trimmed = String(timeStr).trim()
    if (/\b(am|pm)\b/i.test(trimmed)) {
      timeLabel = trimmed.replace(/^0/, '').toLowerCase()
    } else {
      const [hStr, mStr] = trimmed.split(':')
      const h = parseInt(hStr, 10)
      const m = parseInt(mStr || '0', 10)
      const period = h >= 12 ? 'pm' : 'am'
      const displayH = h % 12 === 0 ? 12 : h % 12
      const displayM = String(m).padStart(2, '0')
      timeLabel = `${displayH}:${displayM} ${period}`
    }
  }

  const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`

  return { isoDate, dateLabel, weekdayLabel, timeLabel }
}

function parseFallbackDateParts(followUpStr = '') {
  const now = new Date()
  const lower = String(followUpStr || '').toLowerCase()
  const d = new Date(now)
  if (lower.includes('tomorrow')) {
    d.setDate(d.getDate() + 1)
  } else if (/\d{1,2}\s+[a-z]{3}/i.test(followUpStr)) {
    const match = followUpStr.match(/(\d{1,2})\s+([a-z]{3})/i)
    if (match) {
      const parsed = new Date(`${match[1]} ${match[2]} ${now.getFullYear()}`)
      if (!isNaN(parsed.getTime())) {
        return {
          isoDate: `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(
            parsed.getDate()
          ).padStart(2, '0')}`,
          dateLabel: `${match[1]} ${match[2]}`,
          weekdayLabel: parsed.toLocaleDateString('en-US', { weekday: 'long' }),
          timeLabel: '11:00 am',
        }
      }
    }
  }
  return formatVisitDateParts(null, '11:00 AM')
}

/**
 * GET /api/visits
 * Returns all site visits from MongoDB, enriched with lead & property details
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDb()
    const [rawVisits, leads, plots] = await Promise.all([
      db.collection('site_visits').find({}, { projection: { _id: 0 } }).sort({ visitDate: 1, createdAt: -1 }).toArray(),
      db.collection('leads').find({}, { projection: { _id: 0 } }).toArray(),
      db.collection('plots').find({}, { projection: { _id: 0, id: 1, name: 1, location: 1 } }).toArray(),
    ])

    const leadMap = new Map(leads.map((l) => [l.id, l]))
    const plotByName = new Map(plots.map((p) => [(p.name || '').toLowerCase().trim(), p]))

    // Enrich stored visits with latest lead/plot details
    const visits = rawVisits.map((v) => {
      const lead = leadMap.get(v.leadId)
      const propName = v.property || lead?.property || 'Crystal Estates'
      const matchedPlot = plotByName.get(propName.toLowerCase().trim())
      return {
        ...v,
        leadName: v.leadName || lead?.name || 'Lead',
        leadPhone: v.leadPhone || lead?.phone || '',
        leadEmail: v.leadEmail || lead?.email || '',
        leadInitials: v.leadInitials || getInitials(v.leadName || lead?.name),
        property: propName,
        location: v.location || matchedPlot?.location || 'Chennai',
        assignedAgent: v.assignedAgent || lead?.assignedAgent || {
          name: 'Crystal Admin',
          initials: 'CA',
          color: '#0B57D0',
        },
        lead: lead || null,
      }
    })

    // Sync any leads currently in "sitevisit" stage that have no visit record at all yet
    const anyVisitLeadIds = new Set(visits.map((v) => v.leadId))
    for (const lead of leads) {
      const stage = (lead.stage || '').toLowerCase().replace(/\s+/g, '')
      if (stage === 'sitevisit' && !anyVisitLeadIds.has(lead.id)) {
        const matchedPlot = plotByName.get((lead.property || '').toLowerCase().trim())
        const parts = parseFallbackDateParts(lead.followUpDate)
        visits.push({
          id: `visit-lead-${lead.id}`,
          leadId: lead.id,
          leadName: lead.name,
          leadPhone: lead.phone || '',
          leadEmail: lead.email || '',
          leadInitials: getInitials(lead.name),
          property: lead.property || 'Crystal Estates',
          location: matchedPlot?.location || 'Chennai',
          visitDate: parts.isoDate,
          dateLabel: parts.dateLabel,
          weekdayLabel: parts.weekdayLabel,
          visitTime: parts.timeLabel,
          status: 'Confirmed',
          cabPickup: false,
          assignedAgent: lead.assignedAgent || {
            name: 'Crystal Admin',
            initials: 'CA',
            color: '#0B57D0',
          },
          notes: lead.notes || '',
          lead,
        })
      }
    }

    return res.json({
      success: true,
      total: visits.length,
      visits,
    })
  } catch (err) {
    console.error('Error fetching site visits:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/visits
 * Schedule a new site visit and sync lead stage/activity
 */
router.post('/', async (req, res) => {
  try {
    const {
      leadId,
      date,
      time = '11:00 AM',
      status = 'Confirmed',
      cabPickup = false,
      location,
      property,
      assignedAgent,
      notes = '',
      moveToSiteVisit = true,
    } = req.body

    if (!leadId) {
      return res.status(400).json({ success: false, error: 'leadId is required' })
    }

    const db = await getDb()
    const lead = await db.collection('leads').findOne({ id: leadId }, { projection: { _id: 0 } })
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }

    const propName = (property || lead.property || 'Crystal Estates').trim()
    const matchedPlot = await db.collection('plots').findOne(
      { name: { $regex: `^${propName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
      { projection: { _id: 0, location: 1 } }
    )

    const { isoDate, dateLabel, weekdayLabel, timeLabel } = formatVisitDateParts(date, time)
    const resolvedLocation = (location || matchedPlot?.location || 'Chennai').trim()
    const resolvedAgent = assignedAgent || lead.assignedAgent || {
      name: 'Crystal Admin',
      initials: 'CA',
      color: '#0B57D0',
    }
    const cleanStatus = status === 'Tentative' ? 'Tentative' : 'Confirmed'

    const newVisit = {
      id: `visit-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone || '',
      leadEmail: lead.email || '',
      leadInitials: getInitials(lead.name),
      property: propName,
      location: resolvedLocation,
      visitDate: isoDate,
      dateLabel,
      weekdayLabel,
      visitTime: timeLabel,
      status: cleanStatus,
      cabPickup: Boolean(cabPickup),
      assignedAgent: resolvedAgent,
      notes: (notes || '').trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('site_visits').insertOne({ ...newVisit })

    // Sync lead stage, followUpDate & activity timeline
    const activitiesToPush = [
      {
        id: `act-${Date.now()}-visit`,
        text: `Site visit scheduled (${cleanStatus}) for ${dateLabel} · ${timeLabel}${
          cabPickup ? ' with Cab pickup' : ''
        }`,
        time: 'Just now',
        createdAt: new Date(),
      },
    ]

    const updateSet = {
      followUpDate: `${dateLabel}, ${timeLabel}`,
      updatedAt: new Date(),
    }

    const currentStage = (lead.stage || '').toLowerCase().replace(/\s+/g, '')
    if (moveToSiteVisit && currentStage !== 'sitevisit') {
      updateSet.stage = 'sitevisit'
      activitiesToPush.unshift({
        id: `act-${Date.now()}-stage`,
        text: 'Pipeline stage moved to "Site visit"',
        time: 'Just now',
        createdAt: new Date(),
      })
    }

    await db.collection('leads').updateOne(
      { id: lead.id },
      {
        $set: updateSet,
        $push: {
          activity: { $each: activitiesToPush, $position: 0 },
        },
      }
    )

    const updatedLead = await db.collection('leads').findOne({ id: lead.id }, { projection: { _id: 0 } })

    return res.status(201).json({
      success: true,
      message: 'Site visit scheduled successfully',
      visit: { ...newVisit, lead: updatedLead },
      lead: updatedLead,
    })
  } catch (err) {
    console.error('Error scheduling site visit:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * PATCH /api/visits/:id
 * Update visit status (Confirmed / Tentative / Completed), cab pickup, or date/time
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = { ...req.body }
    delete updates._id
    delete updates.id

    const db = await getDb()
    let existing = await db.collection('site_visits').findOne({ id }, { projection: { _id: 0 } })

    // If updating a synthesized visit-lead-<leadId> entry, materialize it into site_visits first
    if (!existing && id.startsWith('visit-lead-')) {
      const leadId = id.replace('visit-lead-', '')
      const lead = await db.collection('leads').findOne({ id: leadId }, { projection: { _id: 0 } })
      if (!lead) {
        return res.status(404).json({ success: false, error: 'Visit not found' })
      }
      const matchedPlot = await db.collection('plots').findOne(
        { name: { $regex: `^${(lead.property || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
        { projection: { _id: 0, location: 1 } }
      )
      const parts = parseFallbackDateParts(lead.followUpDate)
      existing = {
        id,
        leadId: lead.id,
        leadName: lead.name,
        leadPhone: lead.phone || '',
        leadEmail: lead.email || '',
        leadInitials: getInitials(lead.name),
        property: lead.property || 'Crystal Estates',
        location: matchedPlot?.location || 'Chennai',
        visitDate: parts.isoDate,
        dateLabel: parts.dateLabel,
        weekdayLabel: parts.weekdayLabel,
        visitTime: parts.timeLabel,
        status: 'Confirmed',
        cabPickup: false,
        assignedAgent: lead.assignedAgent || {
          name: 'Crystal Admin',
          initials: 'CA',
          color: '#0B57D0',
        },
        notes: lead.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await db.collection('site_visits').insertOne({ ...existing })
    }

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Site visit not found' })
    }

    if (updates.date || updates.time) {
      const parts = formatVisitDateParts(
        updates.date || existing.visitDate,
        updates.time || existing.visitTime
      )
      updates.visitDate = parts.isoDate
      updates.dateLabel = parts.dateLabel
      updates.weekdayLabel = parts.weekdayLabel
      updates.visitTime = parts.timeLabel
      delete updates.date
      delete updates.time
    }

    updates.updatedAt = new Date()

    await db.collection('site_visits').updateOne({ id }, { $set: updates })
    const updatedVisit = await db.collection('site_visits').findOne({ id }, { projection: { _id: 0 } })

    // Log status transition on the lead's activity timeline and advance stage to "Site visit done" when visited
    if (updates.status && existing.leadId && updates.status !== existing.status) {
      const targetLead = await db
        .collection('leads')
        .findOne({ id: existing.leadId }, { projection: { _id: 0 } })
      const leadUpdateSet = { updatedAt: new Date() }
      const newActivities = [
        {
          id: `act-${Date.now()}-visit-upd`,
          text:
            updates.status === 'Completed'
              ? `Site visit marked as visited for ${updatedVisit.property}`
              : `Site visit status updated to ${updates.status}`,
          time: 'Just now',
          createdAt: new Date(),
        },
      ]

      if (
        updates.status === 'Completed' &&
        targetLead &&
        ['new', 'contacted', 'followup', 'sitevisit'].includes(
          (targetLead.stage || '').toLowerCase().replace(/\s+/g, '')
        )
      ) {
        leadUpdateSet.stage = 'sitevisitdone'
        leadUpdateSet.followUpDate = 'Visited'
        newActivities.unshift({
          id: `act-${Date.now()}-stage-done`,
          text: 'Pipeline stage moved to "Site visit done"',
          time: 'Just now',
          createdAt: new Date(),
        })
      }

      await db.collection('leads').updateOne(
        { id: existing.leadId },
        {
          $set: leadUpdateSet,
          $push: {
            activity: {
              $each: newActivities,
              $position: 0,
            },
          },
        }
      )
    }

    const lead = updatedVisit.leadId
      ? await db.collection('leads').findOne({ id: updatedVisit.leadId }, { projection: { _id: 0 } })
      : null

    return res.json({
      success: true,
      visit: { ...updatedVisit, lead },
    })
  } catch (err) {
    console.error('Error updating site visit:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * DELETE /api/visits/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDb()
    await db.collection('site_visits').deleteOne({ id })
    return res.json({ success: true, message: 'Site visit deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router

