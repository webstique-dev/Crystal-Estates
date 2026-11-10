import { useState, useEffect, useCallback } from 'react'
import {
  fetchLeads,
  createLead,
  updateLead,
  deleteLead,
  recordLeadPayment,
  scheduleLeadFollowUp,
  toggleLeadFollowUp,
  addLeadNote,
  fetchLeadsMeta,
} from '../lib/api'

export function useLeads() {
  const [leads, setLeads] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSource, setSelectedSource] = useState('All sources')
  const [selectedAgent, setSelectedAgent] = useState('All agents')
  const [searchQuery, setSearchQuery] = useState('')

  // Load leads from MongoDB
  const loadLeads = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      const data = await fetchLeads()
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads)
      }
      setError(null)
    } catch (err) {
      console.error('Failed to load leads from database:', err.message)
      if (!isSilent) setError(err.message)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [])

  // Load dynamic metadata (properties, agents, sources, stages) & auto-refresh
  useEffect(() => {
    loadLeads()
    fetchLeadsMeta()
      .then((data) => {
        if (data.success) {
          setMeta(data)
        }
      })
      .catch((err) => console.warn('Could not load leads meta:', err.message))

    // Automatically poll every 15s so new website enquiries arrive in real-time
    const interval = setInterval(() => {
      loadLeads(true)
    }, 15000)

    const handleFocus = () => loadLeads(true)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadLeads])

  // Move lead to a different stage (optimistic UI update + server sync)
  const moveLeadStage = async (leadId, newStage) => {
    const previous = [...leads]
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage, updatedAt: new Date() } : l))
    )

    try {
      const res = await updateLead(leadId, { stage: newStage })
      if (res.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? res.lead : l)))
      }
    } catch (err) {
      console.error('Error updating stage on server:', err)
      setLeads(previous) // rollback on error
      throw err
    }
  }

  // Add new lead to database
  const addNewLead = async (leadData) => {
    const res = await createLead(leadData)
    if (res.success && res.lead) {
      setLeads((prev) => [res.lead, ...prev])
      return res.lead
    }
    throw new Error(res.error || 'Failed to create lead')
  }

  // Update existing lead details
  const updateLeadDetails = async (id, updates) => {
    const res = await updateLead(id, updates)
    if (res.success && res.lead) {
      setLeads((prev) => prev.map((l) => (l.id === id ? res.lead : l)))
      return res.lead
    }
    throw new Error(res.error || 'Failed to update lead')
  }

  // Record an advance payment via backend API
  const recordPayment = async (id, paymentData) => {
    const res = await recordLeadPayment(id, paymentData)
    if (res.success && res.lead) {
      setLeads((prev) => prev.map((l) => (l.id === id ? res.lead : l)))
      return res.lead
    }
    throw new Error(res.error || 'Failed to record payment')
  }

  // Schedule a follow-up via backend API
  const scheduleFollowUp = async (id, followUpData) => {
    const res = await scheduleLeadFollowUp(id, followUpData)
    if (res.success && res.lead) {
      setLeads((prev) => prev.map((l) => (l.id === id ? res.lead : l)))
      return res.lead
    }
    throw new Error(res.error || 'Failed to schedule follow-up')
  }

  // Toggle follow-up completion via backend API
  const toggleFollowUp = async (id, fuId) => {
    const res = await toggleLeadFollowUp(id, fuId)
    if (res.success && res.lead) {
      setLeads((prev) => prev.map((l) => (l.id === id ? res.lead : l)))
      return res.lead
    }
    throw new Error(res.error || 'Failed to toggle follow-up')
  }

  // Add quick note via backend API
  const addNote = async (id, noteText) => {
    const res = await addLeadNote(id, noteText)
    if (res.success && res.lead) {
      setLeads((prev) => prev.map((l) => (l.id === id ? res.lead : l)))
      return res.lead
    }
    throw new Error(res.error || 'Failed to add note')
  }

  // Delete lead from database
  const removeLead = async (id) => {
    const res = await deleteLead(id)
    if (res.success) {
      setLeads((prev) => prev.filter((l) => l.id !== id))
      return true
    }
    throw new Error(res.error || 'Failed to delete lead')
  }

  // Simulate an incoming enquiry from website or WhatsApp
  const simulateEnquiry = async (propertiesList = []) => {
    const sampleNames = [
      'Ananya Krishnan',
      'Venkatesh Prasad',
      'Meera Sundaram',
      'Siddharth Nair',
      'Pooja Natarajan',
    ]
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)]
    const randomPhone = `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`
    const randomProp = propertiesList[Math.floor(Math.random() * propertiesList.length)] || {
      name: 'General Enquiry',
      price: 0,
    }

    return await addNewLead({
      name: randomName,
      phone: randomPhone,
      email: `${randomName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      property: randomProp.name,
      propertyId: randomProp.id,
      stage: 'new',
      source: Math.random() > 0.4 ? 'Website' : 'WhatsApp',
      budget: randomProp.price || 7800000,
      assignedAgent: { name: 'Arun Kumar', initials: 'AK', color: '#DC2626' },
      followUpDate: 'Today',
      notes: `Simulated fresh lead enquiry for ${randomProp.name}. Interested in CMDA approved plot.`,
    })
  }

  // Filtered leads based on source, agent, and search query
  const filteredLeads = leads.filter((lead) => {
    // 1. Source filter
    if (selectedSource !== 'All sources' && lead.source !== selectedSource) {
      return false
    }

    // 2. Agent filter
    if (selectedAgent !== 'All agents') {
      const agentName = lead.assignedAgent?.name || ''
      if (!agentName.toLowerCase().includes(selectedAgent.toLowerCase())) {
        return false
      }
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchName = (lead.name || '').toLowerCase().includes(q)
      const matchPhone = (lead.phone || '').toLowerCase().includes(q)
      const matchEmail = (lead.email || '').toLowerCase().includes(q)
      const matchProperty = (lead.property || '').toLowerCase().includes(q)
      if (!matchName && !matchPhone && !matchEmail && !matchProperty) {
        return false
      }
    }

    return true
  })

  return {
    leads: filteredLeads,
    allLeads: leads,
    totalCount: leads.length,
    loading,
    error,
    meta,
    refreshLeads: loadLeads,
    moveLeadStage,
    addNewLead,
    updateLeadDetails,
    recordPayment,
    scheduleFollowUp,
    toggleFollowUp,
    addNote,
    removeLead,
    simulateEnquiry,
    selectedSource,
    setSelectedSource,
    selectedAgent,
    setSelectedAgent,
    searchQuery,
    setSearchQuery,
  }
}
