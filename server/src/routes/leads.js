import { Router } from 'express'
import { getDb } from '../config/db.js'

const router = Router()

/**
 * Helper to format Indian currency
 */
function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return '₹0'
  const num = Number(amount)
  if (num >= 10000000) {
    const cr = num / 10000000
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`
  }
  if (num >= 100000) {
    const lk = num / 100000
    return `₹${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)} L`
  }
  return `₹${num.toLocaleString('en-IN')}`
}

router.get('/meta', async (req, res) => {
  try {
    const db = await getDb()

    // 1. Dynamic Projects from featured_plots collection
    let plots = await db
      .collection('featured_plots')
      .find({}, { projection: { name: 1, id: 1, projectId: 1, price: 1, priceFormatted: 1, type: 1 } })
      .toArray()

    const properties =
      plots && plots.length > 0
        ? plots.map((p) => ({
            id: p.id || p.projectId,
            name: p.name,
            priceFormatted: p.priceFormatted,
          }))
        : []

    // 2. Dynamic Agents from users collection + active leads
    let users = await db
      .collection('users')
      .find({}, { projection: { name: 1, role: 1, color: 1, initials: 1 } })
      .toArray()

    const agentMap = new Map()

    if (users && users.length > 0) {
      users.forEach((u) => {
        if (u.name) {
          agentMap.set(u.name, {
            name: u.name,
            initials: u.initials || u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
            color: u.color || '#0B57D0',
          })
        }
      })
    }

    const leadsWithAgents = await db
      .collection('leads')
      .find({ 'assignedAgent.name': { $exists: true, $ne: null } }, { projection: { assignedAgent: 1 } })
      .toArray()

    leadsWithAgents.forEach((l) => {
      if (l.assignedAgent?.name && !agentMap.has(l.assignedAgent.name)) {
        agentMap.set(l.assignedAgent.name, {
          name: l.assignedAgent.name,
          initials: l.assignedAgent.initials || l.assignedAgent.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
          color: l.assignedAgent.color || '#0B57D0',
        })
      }
    })

    const agents = agentMap.size > 0
      ? Array.from(agentMap.values())
      : [{ name: 'Unassigned', initials: 'UN', color: '#64748B' }]

    return res.json({
      success: true,
      properties,
      agents,
      sources: [
        'Walk-in',
        'Website',
        'Phone Call',
        'Referral',
        'WhatsApp',
        'Facebook',
        'Instagram',
        '99acres',
        'MagicBricks',
      ],
      stages: [
        { id: 'new', label: 'New leads' },
        { id: 'contacted', label: 'Contacted' },
        { id: 'followup', label: 'Follow-up' },
        { id: 'sitevisit', label: 'Site visit' },
        { id: 'negotiation', label: 'Negotiation' },
        { id: 'won', label: 'Won - Booked' },
        { id: 'lost', label: 'Lost' },
      ],
      paymentForOptions: [
        'Token advance',
        'Booking advance',
        'Part payment',
        'Full payment',
        'Registration advance',
      ],
      paymentModes: [
        'UPI',
        'Bank Transfer / RTGS / NEFT',
        'Cheque',
        'Cash',
        'Credit / Debit Card',
      ],
    })
  } catch (err) {
    console.error('Error fetching leads metadata:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/leads
 * Fetch all leads from MongoDB collection `leads`
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDb()
    let leads = await db
      .collection('leads')
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    if (!leads) {
      leads = []
    }

    // Ensure all leads have required fields for the detail drawer
    leads = leads.map((l) => {
      const isWon = l.stage === 'won' || String(l.followUpDate || '').toLowerCase().includes('completed')
      
      // Clean fallback for upcomingFollowUps if missing or empty
      let followUps = Array.isArray(l.upcomingFollowUps) && l.upcomingFollowUps.length > 0
        ? l.upcomingFollowUps.map((fu) => {
            // Clean up any corrupted "Today · Today" strings in existing data
            let cleanWhen = fu.when || 'Today, 5:00 pm'
            if (cleanWhen.includes('Today · Today')) cleanWhen = 'Today, 5:00 pm'
            else if (cleanWhen.includes('Today · Yesterday')) cleanWhen = 'Yesterday, 4:00 pm'
            else if (cleanWhen.includes('Today · Tomorrow')) cleanWhen = 'Tomorrow, 11:00 am'
            else if (cleanWhen.includes('Today · Completed')) cleanWhen = 'Yesterday, 10:00 am'
            else if (cleanWhen.includes('Today · 18 Oct')) cleanWhen = '18 Oct, 11:00 am'
            else if (cleanWhen.includes('Today · 17 Oct')) cleanWhen = '17 Oct, 11:00 am'
            return {
              ...fu,
              when: cleanWhen,
              completed: isWon ? true : Boolean(fu.completed),
            }
          })
        : [
            {
              id: `fu-${l.id || Date.now()}`,
              type: 'Call',
              title: l.notes || `Follow-up call with ${l.name}`,
              when: isWon
                ? 'Yesterday, 10:00 am'
                : String(l.followUpDate || '').toLowerCase().includes('yesterday')
                ? 'Yesterday, 4:00 pm'
                : String(l.followUpDate || '').toLowerCase().includes('tomorrow')
                ? 'Tomorrow, 11:00 am'
                : l.followUpDate && !['today', 'completed'].includes(l.followUpDate.toLowerCase())
                ? `${l.followUpDate}, 11:00 am`
                : 'Today, 5:00 pm',
              completed: isWon,
            },
          ]

      // Format clean activity timestamps based on lead.createdAt
      const createdDate = l.createdAt ? new Date(l.createdAt) : new Date()
      const createdDayStr = createdDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      const createdTimeStr = createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
      const activityTime = `${createdDayStr} · ${createdTimeStr}`

      const activities = Array.isArray(l.activity) && l.activity.length > 0
        ? l.activity.map((act) => ({
            ...act,
            // Replace any hardcoded 15 Oct 2026 with real relative timestamp
            time: act.time && act.time.includes('15 Oct 2026') ? activityTime : (act.time || activityTime),
          }))
        : [
            {
              id: `act-1-${l.id || Date.now()}`,
              text: 'WhatsApp welcome message sent automatically',
              time: activityTime,
            },
            {
              id: `act-2-${l.id || Date.now()}`,
              text: `Enquiry captured from ${l.source || 'Website'} for ${l.property || 'Crystal Estates'}`,
              time: activityTime,
            },
          ]

      return {
        ...l,
        requirement: l.requirement || (l.property ? `${l.property} - Plot/Unit` : 'Plot/Unit'),
        unit: l.unit || 'Not allotted',
        upcomingFollowUps: followUps,
        activity: activities,
        payments: l.payments || [],
      }
    })

    return res.json({
      success: true,
      source: 'database',
      total: leads.length,
      leads,
    })
  } catch (err) {
    console.error('Error fetching leads:', err.message)
    return res.status(500).json({ success: false, error: err.message, leads: [] })
  }
})

/**
 * GET /api/leads/payments/all
 * Fetch all payments recorded across all leads
 */
router.get('/payments/all', async (req, res) => {
  try {
    const db = await getDb()
    const payments = await db
      .collection('payments')
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    return res.json({
      success: true,
      total: payments.length,
      payments,
    })
  } catch (err) {
    console.error('Error fetching payments:', err.message)
    return res.status(500).json({ success: false, error: err.message, payments: [] })
  }
})

/**
 * POST /api/leads
 * Dynamic lead creation
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      property,
      propertyId,
      stage = 'new',
      source = 'Website',
      budget = 0,
      budgetFormatted,
      assignedAgent,
      requirement,
      unit,
      followUpDate = 'Today',
      advanceReceived = null,
      notes = '',
      sendWhatsApp = false,
      upcomingFollowUps,
      activity,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Lead full name is required' })
    }

    const db = await getDb()
    const id = `lead-${Date.now()}`
    const numBudget = Number(budget) || 0

    // Build initial activity logs
    const initialActivities = Array.isArray(activity) && activity.length > 0
      ? activity
      : []

    if (initialActivities.length === 0) {
      if (sendWhatsApp) {
        initialActivities.push({
          id: `act-${Date.now()}-1`,
          text: 'WhatsApp welcome message sent automatically',
          time: 'Just now',
          createdAt: new Date(),
        })
      }
      initialActivities.push({
        id: `act-${Date.now()}-2`,
        text: `Enquiry captured from ${source || 'Walk-in'} for ${property || 'Crystal Estates'}`,
        time: 'Just now',
        createdAt: new Date(),
      })
    }

    // Build initial follow-up
    const initialFollowUps = Array.isArray(upcomingFollowUps) && upcomingFollowUps.length > 0
      ? upcomingFollowUps
      : [
          {
            id: `fu-${Date.now()}`,
            type: 'Call',
            title: `First follow-up call with ${name.trim()}`,
            when: followUpDate || 'Tomorrow, 11:00 am',
            completed: false,
            createdAt: new Date(),
          },
        ]

    // Dynamic default agent
    let leadAgent = assignedAgent
    if (!leadAgent || !leadAgent.name) {
      const defaultUser = await db.collection('users').findOne({}, { projection: { name: 1, color: 1, initials: 1 } })
      if (defaultUser) {
        leadAgent = {
          name: defaultUser.name,
          initials: defaultUser.initials || defaultUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
          color: defaultUser.color || '#0B57D0',
        }
      } else {
        leadAgent = {
          name: 'Unassigned',
          initials: 'UN',
          color: '#64748B',
        }
      }
    }

    const leadProperty = (property || '').trim() || 'General Enquiry'

    const newLead = {
      id,
      name: name.trim(),
      phone: (phone || '').trim(),
      email: (email || '').trim(),
      property: leadProperty,
      propertyId: propertyId || null,
      stage: stage.toLowerCase().replace(/\s+/g, ''),
      source: source || 'Walk-in',
      budget: numBudget,
      budgetFormatted: budgetFormatted || formatCurrency(numBudget),
      assignedAgent: leadAgent,
      requirement: requirement || (leadProperty !== 'General Enquiry' ? `${leadProperty} - Plot/Unit` : 'Plot/Unit'),
      unit: unit || 'Not allotted',
      followUpDate: followUpDate || 'Today',
      advanceReceived: advanceReceived || null,
      notes: notes || '',
      upcomingFollowUps: initialFollowUps,
      activity: initialActivities,
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('leads').insertOne(newLead)

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead: newLead,
    })
  } catch (err) {
    console.error('Error creating lead:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/leads/:id/payments
 * Dynamic Record Advance Payment
 */
router.post('/:id/payments', async (req, res) => {
  try {
    const { id } = req.params
    const {
      paymentFor = 'Token advance',
      amount,
      amountFormatted,
      mode = 'UPI',
      referenceNo = '',
      unitAllotted = '',
      sendWhatsApp = true,
      sendEmail = true,
      moveLeadToWon = true,
    } = req.body

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'A valid payment amount is required' })
    }

    const db = await getDb()
    const lead = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }

    const formatted = amountFormatted || formatCurrency(numAmount)
    const paymentId = `pay-${Date.now()}`

    const paymentRecord = {
      id: paymentId,
      leadId: id,
      leadName: lead.name,
      property: lead.property,
      paymentFor,
      amount: numAmount,
      amountFormatted: formatted,
      mode,
      referenceNo: (referenceNo || '').trim(),
      unitAllotted: (unitAllotted || lead.unit || 'Not allotted').trim(),
      receiptSentWhatsApp: Boolean(sendWhatsApp),
      receiptSentEmail: Boolean(sendEmail),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: new Date(),
    }

    // 1. Save to dedicated payments collection for CRM accounts
    await db.collection('payments').insertOne(paymentRecord)

    // 2. Build activity log
    const actEntry = {
      id: `act-${Date.now()}`,
      text: `${paymentFor} of ${formatted} recorded via ${mode}${
        referenceNo ? ` (Ref: ${referenceNo})` : ''
      }`,
      time: 'Just now',
      createdAt: new Date(),
    }

    // 3. Update lead document
    const setUpdates = {
      advanceReceived: formatted,
      unit: unitAllotted ? unitAllotted.trim() : (lead.unit || 'Not allotted'),
      updatedAt: new Date(),
    }

    if (moveLeadToWon) {
      setUpdates.stage = 'won'
    }

    await db.collection('leads').updateOne(
      { id },
      {
        $set: setUpdates,
        $push: {
          payments: paymentRecord,
          activity: { $each: [actEntry], $position: 0 },
        },
      }
    )

    const updatedLead = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })

    return res.json({
      success: true,
      message: 'Advance payment recorded successfully',
      payment: paymentRecord,
      lead: updatedLead,
    })
  } catch (err) {
    console.error('Error recording advance payment:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/leads/:id/followups
 * Dynamic Schedule Follow-up
 */
router.post('/:id/followups', async (req, res) => {
  try {
    const { id } = req.params
    const { type = 'Call', when = 'Tomorrow, 11:00 am', note = '' } = req.body

    const db = await getDb()
    const lead = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }

    const followUp = {
      id: `fu-${Date.now()}`,
      type,
      title: note.trim() || `Follow-up ${type} with ${lead.name}`,
      when,
      completed: false,
      createdAt: new Date(),
    }

    const actEntry = {
      id: `act-${Date.now()}`,
      text: `Follow-up scheduled: ${type} for ${when}`,
      time: 'Just now',
      createdAt: new Date(),
    }

    await db.collection('leads').updateOne(
      { id },
      {
        $set: { followUpDate: when, updatedAt: new Date() },
        $push: {
          upcomingFollowUps: { $each: [followUp], $position: 0 },
          activity: { $each: [actEntry], $position: 0 },
        },
      }
    )

    const updatedLead = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })

    return res.json({
      success: true,
      message: 'Follow-up scheduled successfully',
      followUp,
      lead: updatedLead,
    })
  } catch (err) {
    console.error('Error scheduling follow-up:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * PATCH /api/leads/:id/followups/:fuId/toggle
 * Toggle follow-up completion status
 */
router.patch('/:id/followups/:fuId/toggle', async (req, res) => {
  try {
    const { id, fuId } = req.params
    const db = await getDb()
    const lead = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }

    const followUps = (lead.upcomingFollowUps || []).map((fu) =>
      fu.id === fuId ? { ...fu, completed: !fu.completed } : fu
    )

    await db.collection('leads').updateOne(
      { id },
      { $set: { upcomingFollowUps: followUps, updatedAt: new Date() } }
    )

    const updatedLead = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })

    return res.json({
      success: true,
      lead: updatedLead,
    })
  } catch (err) {
    console.error('Error toggling follow-up:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/leads/:id/notes
 * Add note to lead and record in activity
 */
router.post('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params
    const { note } = req.body

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'Note text is required' })
    }

    const db = await getDb()
    const lead = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }

    const noteText = note.trim()
    const updatedNotes = lead.notes ? `${lead.notes}\n• ${noteText}` : noteText

    const actEntry = {
      id: `act-${Date.now()}`,
      text: `Note added: "${noteText}"`,
      time: 'Just now',
      createdAt: new Date(),
    }

    await db.collection('leads').updateOne(
      { id },
      {
        $set: { notes: updatedNotes, updatedAt: new Date() },
        $push: {
          activity: { $each: [actEntry], $position: 0 },
        },
      }
    )

    const updatedLead = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })

    return res.json({
      success: true,
      message: 'Note added successfully',
      lead: updatedLead,
    })
  } catch (err) {
    console.error('Error adding note:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * PATCH /api/leads/:id
 * Dynamic update for lead details (stage, agent, budget, etc.)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDb()

    const existing = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }

    const updates = { ...req.body, updatedAt: new Date() }
    delete updates._id
    delete updates.id

    const activitiesToPush = []

    // Stage change tracking
    if (updates.stage && updates.stage !== existing.stage) {
      updates.stage = updates.stage.toLowerCase().replace(/\s+/g, '')
      const stageLabels = {
        new: 'New leads',
        contacted: 'Contacted',
        followup: 'Follow-up',
        sitevisit: 'Site visit',
        negotiation: 'Negotiation',
        won: 'Won - Booked',
        lost: 'Lost',
      }
      activitiesToPush.push({
        id: `act-${Date.now()}-stage`,
        text: `Pipeline stage moved to "${stageLabels[updates.stage] || updates.stage}"`,
        time: 'Just now',
        createdAt: new Date(),
      })
    }

    // Assigned Agent tracking
    if (
      updates.assignedAgent &&
      updates.assignedAgent.name &&
      updates.assignedAgent.name !== existing.assignedAgent?.name
    ) {
      activitiesToPush.push({
        id: `act-${Date.now()}-agent`,
        text: `Lead assigned to ${updates.assignedAgent.name}`,
        time: 'Just now',
        createdAt: new Date(),
      })
    }

    if (updates.budget !== undefined) {
      updates.budget = Number(updates.budget) || 0
      updates.budgetFormatted = formatCurrency(updates.budget)
    }

    const updateOps = { $set: updates }
    if (activitiesToPush.length > 0) {
      updateOps.$push = {
        activity: { $each: activitiesToPush, $position: 0 },
      }
    }

    await db.collection('leads').updateOne({ id }, updateOps)

    const updatedLead = await db.collection('leads').findOne({ id }, { projection: { _id: 0 } })

    return res.json({
      success: true,
      message: 'Lead updated successfully',
      lead: updatedLead,
    })
  } catch (err) {
    console.error('Error updating lead:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * DELETE /api/leads/:id
 * Remove a lead
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDb()
    const result = await db.collection('leads').deleteOne({ id })

    return res.json({
      success: true,
      message: 'Lead deleted successfully',
      deletedCount: result.deletedCount,
    })
  } catch (err) {
    console.error('Error deleting lead:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router


