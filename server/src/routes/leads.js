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

/**
 * Initial real seed leads based on actual Crystal Estates database properties
 */
const initialSeedLeads = [
  {
    id: 'lead-001',
    name: 'Suresh Babu',
    phone: '+91 98843 20517',
    email: 'sureshbabu.k@gmail.com',
    property: 'Crystal Bay Residences',
    propertyId: 'ce-001',
    stage: 'followup',
    source: 'Website',
    budget: 12500000,
    budgetFormatted: '₹1.25 Cr',
    requirement: '3 BHK',
    unit: 'Not allotted',
    assignedAgent: { name: 'Divya S', initials: 'DS', color: '#0B57D0' },
    followUpDate: 'Yesterday',
    notes: 'Share revised cost sheet with car park.',
    advanceReceived: null,
    upcomingFollowUps: [
      {
        id: 'fu-001',
        type: 'Call',
        title: 'Share revised cost sheet with car park',
        when: 'Yesterday, 4:00 pm',
        completed: false,
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
    ],
    activity: [
      {
        id: 'act-001',
        text: 'Enquiry captured from Website for Crystal Bay Residences',
        time: 'Yesterday · 2:00 pm',
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 30),
    updatedAt: new Date(),
  },
  {
    id: 'lead-002',
    name: 'Rajesh Kannan',
    phone: '+91 98400 31876',
    email: 'rajesh.kannan@hotmail.com',
    property: 'Crystal Bay Residences',
    propertyId: 'ce-001',
    stage: 'contacted',
    source: 'Facebook',
    budget: 8500000,
    budgetFormatted: '₹85 L',
    requirement: '2 BHK',
    unit: 'Not allotted',
    assignedAgent: { name: 'Arun Kumar', initials: 'AK', color: '#DC2626' },
    followUpDate: 'Today',
    notes: 'Confirm budget and loan pre-approval.',
    advanceReceived: null,
    upcomingFollowUps: [
      {
        id: 'fu-002',
        type: 'Call',
        title: 'Confirm budget and loan pre-approval',
        when: 'Today, 11:30 am',
        completed: false,
        createdAt: new Date(),
      },
    ],
    activity: [
      {
        id: 'act-002',
        text: 'Follow-up call scheduled for Today 11:30 am',
        time: 'Today · 9:00 am',
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 18),
    updatedAt: new Date(),
  },
  {
    id: 'lead-003',
    name: 'Fathima Begum',
    phone: '+91 90940 56631',
    email: 'fathima.b@gmail.com',
    property: 'Crystal Meadows',
    propertyId: 'ce-002',
    stage: 'followup',
    source: 'Instagram',
    budget: 3800000,
    budgetFormatted: '₹38 L',
    requirement: '1,200 sq ft plot',
    unit: 'Plot #08',
    assignedAgent: { name: 'Meera R', initials: 'MR', color: '#7C3AED' },
    followUpDate: 'Today',
    notes: 'Send Oragadam plot layout and DTCP approval.',
    advanceReceived: null,
    upcomingFollowUps: [
      {
        id: 'fu-003',
        type: 'WhatsApp',
        title: 'Send Oragadam plot layout and DTCP approval',
        when: 'Today, 3:00 pm',
        completed: false,
        createdAt: new Date(),
      },
    ],
    activity: [
      {
        id: 'act-003',
        text: 'WhatsApp brochure dispatch scheduled for 3:00 pm',
        time: 'Today · 10:00 am',
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 12),
    updatedAt: new Date(),
  },
  {
    id: 'lead-004',
    name: 'Priya Venkatesh',
    phone: '+91 99620 41538',
    email: 'priya.v@outlook.com',
    property: 'Crystal Greens Villas',
    propertyId: 'ce-003',
    stage: 'new',
    source: 'Instagram',
    budget: 30000000,
    budgetFormatted: '₹3 Cr',
    requirement: '4 BHK Villa',
    unit: 'Not allotted',
    assignedAgent: { name: 'Meera R', initials: 'MR', color: '#7C3AED' },
    followUpDate: 'Today',
    notes: 'First call, Instagram villa ad enquiry.',
    advanceReceived: null,
    upcomingFollowUps: [
      {
        id: 'fu-004',
        type: 'Call',
        title: 'First call, Instagram villa ad enquiry',
        when: 'Today, 5:00 pm',
        completed: false,
        createdAt: new Date(),
      },
    ],
    activity: [
      {
        id: 'act-004-1',
        text: 'WhatsApp welcome message sent automatically',
        time: '15 Oct 2026 · 9:25 am',
        createdAt: new Date(),
      },
      {
        id: 'act-004-2',
        text: 'Enquiry captured from Instagram for Crystal Greens Villas',
        time: '15 Oct 2026 · 9:15 am',
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(),
  },
  {
    id: 'lead-005',
    name: 'Mohammed Irfan',
    phone: '+91 90030 77412',
    email: 'irfan.m@yahoo.com',
    property: 'Crystal Meadows',
    propertyId: 'ce-002',
    stage: 'new',
    source: 'Facebook',
    budget: 4500000,
    budgetFormatted: '₹45 L',
    requirement: '1,500 sq ft plot',
    unit: 'Plot #18',
    assignedAgent: { name: 'Rahul V', initials: 'RV', color: '#EA580C' },
    followUpDate: 'Today',
    notes: 'First call, Facebook lead form.',
    advanceReceived: null,
    upcomingFollowUps: [
      {
        id: 'fu-005',
        type: 'Call',
        title: 'First call, Facebook lead form',
        when: 'Today, 6:00 pm',
        completed: false,
        createdAt: new Date(),
      },
    ],
    activity: [
      {
        id: 'act-005',
        text: 'Enquiry captured from Facebook for Crystal Meadows',
        time: 'Today · 8:30 am',
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 6),
    updatedAt: new Date(),
  },
  {
    id: 'lead-006',
    name: 'Lakshmi Narayanan',
    phone: '+91 94440 65219',
    email: 'lnarayanan@gmail.com',
    property: 'Crystal Heights',
    propertyId: 'ce-005',
    stage: 'contacted',
    source: '99acres',
    budget: 19000000,
    budgetFormatted: '₹1.9 Cr',
    requirement: '3 BHK',
    unit: 'Not allotted',
    assignedAgent: { name: 'Divya S', initials: 'DS', color: '#0B57D0' },
    followUpDate: 'Tomorrow',
    notes: 'Office meeting with family to discuss 3 BHK options.',
    advanceReceived: null,
    upcomingFollowUps: [
      {
        id: 'fu-006',
        type: 'Meeting',
        title: 'Office meeting with family to discuss 3 BHK options',
        when: 'Tomorrow, 11:00 am',
        completed: false,
        createdAt: new Date(),
      },
    ],
    activity: [
      {
        id: 'act-006',
        text: 'Office meeting scheduled for Tomorrow 11:00 am',
        time: 'Yesterday · 5:00 pm',
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 40),
    updatedAt: new Date(),
  },
  {
    id: 'lead-007',
    name: 'Vignesh Iyer',
    phone: '+91 98840 12345',
    email: 'vignesh.iyer@gmail.com',
    property: 'Crystal Bay Residences',
    propertyId: 'ce-001',
    stage: 'negotiation',
    source: 'Walk-in',
    budget: 9500000,
    budgetFormatted: '₹95 L',
    requirement: '2 BHK',
    unit: 'A-0504',
    assignedAgent: { name: 'Divya S', initials: 'DS', color: '#0B57D0' },
    followUpDate: '17 Oct',
    notes: 'Negotiation: floor rise charges waiver.',
    advanceReceived: null,
    upcomingFollowUps: [
      {
        id: 'fu-007',
        type: 'Call',
        title: 'Negotiation: floor rise charges waiver',
        when: '17 Oct, 11:00 am',
        completed: false,
        createdAt: new Date(),
      },
    ],
    activity: [
      {
        id: 'act-007',
        text: 'Negotiation follow-up set for 17 Oct',
        time: 'Yesterday · 6:00 pm',
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 48),
    updatedAt: new Date(),
  },
  {
    id: 'lead-008',
    name: 'Karthik Raman',
    phone: '+91 98410 22871',
    email: 'karthik.raman@gmail.com',
    property: 'Crystal Bay Residences',
    propertyId: 'ce-001',
    stage: 'won',
    source: 'Website',
    budget: 11000000,
    budgetFormatted: '₹1.1 Cr',
    requirement: 'B-1204',
    unit: 'B-1204',
    assignedAgent: { name: 'Deepak Sharma', initials: 'DS', color: '#0D9488' },
    followUpDate: 'Completed',
    advanceReceived: '₹5 L',
    notes: 'Advance ₹5 L received via RTGS. Spot registration scheduled.',
    upcomingFollowUps: [
      {
        id: 'fu-008',
        type: 'Call',
        title: 'Spot registration documentation verification',
        when: 'Yesterday, 10:00 am',
        completed: true,
        createdAt: new Date(),
      },
    ],
    activity: [
      {
        id: 'act-008',
        text: 'Booking advance ₹5 L received via RTGS',
        time: 'Yesterday · 11:00 am',
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 72),
    updatedAt: new Date(),
  },
]

/**
 * GET /api/leads/meta
 * Dynamic metadata for forms (projects, agents, sources, stages, payment options)
 */
router.get('/meta', async (req, res) => {
  try {
    const db = await getDb()

    // 1. Dynamic Projects from plots collection
    let plots = await db
      .collection('plots')
      .find({}, { projection: { name: 1, id: 1, projectId: 1, price: 1, priceFormatted: 1, type: 1 } })
      .toArray()

    const properties =
      plots && plots.length > 0
        ? plots.map((p) => ({
            id: p.id || p.projectId,
            name: p.name,
            priceFormatted: p.priceFormatted,
          }))
        : [
            { id: 'p-1', name: 'Crystal Bay Residences' },
            { id: 'p-2', name: 'Crystal Greens Villas' },
            { id: 'p-3', name: 'Crystal Heights' },
            { id: 'p-4', name: 'Crystal Meadows' },
            { id: 'p-5', name: 'Kolapakkam' },
            { id: 'p-6', name: 'Somamangalam' },
          ]

    // 2. Dynamic Agents from users collection
    let users = await db
      .collection('users')
      .find({}, { projection: { name: 1, role: 1, color: 1, initials: 1 } })
      .toArray()

    const defaultAgents = [
      { name: 'Divya S', initials: 'DS', color: '#0B57D0' },
      { name: 'Meera R', initials: 'MR', color: '#7C3AED' },
      { name: 'Arun Kumar', initials: 'AK', color: '#DC2626' },
      { name: 'Deepak Sharma', initials: 'DS', color: '#0D9488' },
      { name: 'Manoj Raghavan', initials: 'MR', color: '#2563EB' },
      { name: 'Priya Natarajan', initials: 'PN', color: '#E11D48' },
    ]

    const agents = users && users.length > 0 ? users : defaultAgents

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

    // If database collection is empty, seed with initial actual leads
    if (!leads || leads.length === 0) {
      await db.collection('leads').insertMany(initialSeedLeads)
      leads = await db
        .collection('leads')
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray()
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
        requirement: l.requirement || (l.budget > 20000000 ? '4 BHK Villa' : '1,500 sq ft plot'),
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
    return res.status(500).json({ success: false, error: err.message, leads: initialSeedLeads })
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

    const newLead = {
      id,
      name: name.trim(),
      phone: (phone || '').trim(),
      email: (email || '').trim(),
      property: (property || 'Crystal Bay Residences').trim(),
      propertyId: propertyId || null,
      stage: stage.toLowerCase().replace(/\s+/g, ''),
      source: source || 'Walk-in',
      budget: numBudget,
      budgetFormatted: budgetFormatted || formatCurrency(numBudget),
      assignedAgent: assignedAgent || {
        name: 'Divya S',
        initials: 'DS',
        color: '#0B57D0',
      },
      requirement: requirement || (numBudget >= 15000000 ? '4 BHK Villa' : '1,500 sq ft plot'),
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
      unit: unitAllotted ? unitAllotted.trim() : (lead.unit !== 'Not allotted' ? lead.unit : 'A-0907'),
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


