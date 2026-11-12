import React, { useState, useEffect } from 'react'
import {
  X,
  Phone,
  Mail,
  ChevronDown,
  Calendar,
  Check,
  CheckCircle2,
  DollarSign,
  Upload,
  Send,
  MessageCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import ScheduleFollowUpModal from './ScheduleFollowUpModal'
import RecordPaymentModal from './RecordPaymentModal'

const STAGE_OPTIONS = [
  { id: 'new', label: 'New leads' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'followup', label: 'Follow-up' },
  { id: 'sitevisit', label: 'Site visit' },
  { id: 'sitevisitdone', label: 'Site visit done' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'won', label: 'Won - Booked' },
  { id: 'lost', label: 'Lost' },
]



function getSourceBadge(source = 'Website') {
  switch (source.toLowerCase()) {
    case 'instagram':
      return { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' }
    case 'facebook':
      return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' }
    case 'whatsapp':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
    case '99acres':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' }
    case 'magicbricks':
      return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' }
    case 'referral':
      return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
    case 'walk-in':
      return { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' }
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
  }
}

export default function LeadDrawer({
  lead,
  meta,
  onClose,
  onUpdate,
  onDelete,
  onRecordPayment,
  onScheduleFollowUp,
  onToggleFollowUp,
  onAddNote,
}) {
  if (!lead) return null

  const dynamicAgents = meta?.agents && meta.agents.length > 0 ? meta.agents : []
  const dynamicStages = meta?.stages && meta.stages.length > 0 ? meta.stages : STAGE_OPTIONS

  // Local state initialized with lead data
  const [stage, setStage] = useState(lead.stage || 'new')
  const [assignedAgent, setAssignedAgent] = useState(
    lead.assignedAgent?.name || dynamicAgents[0]?.name || ''
  )
  const [noteInput, setNoteInput] = useState('')
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false)

  // Derive initial follow-ups & activity timeline with graceful dynamic defaults
  const createdDateStr = lead.createdAt
    ? new Date(lead.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  const [followUps, setFollowUps] = useState(() => {
    if (lead.upcomingFollowUps && lead.upcomingFollowUps.length > 0) {
      return lead.upcomingFollowUps.map((fu) => ({
        ...fu,
        when: (fu.when || 'Today, 5:00 pm').replace('Today · Today', 'Today, 5:00 pm'),
      }))
    }
    const defWhen = lead.followUpDate
      ? lead.followUpDate.toLowerCase().includes('tomorrow')
        ? 'Tomorrow, 11:00 am'
        : lead.followUpDate.toLowerCase().includes('yesterday')
        ? 'Yesterday, 4:00 pm'
        : `${lead.followUpDate}, 11:00 am`
      : 'Today, 5:00 pm'

    return [
      {
        id: `fu-${lead.id || Date.now()}`,
        type: 'Call',
        title: lead.notes || `Follow-up call with ${lead.name}`,
        when: defWhen,
        completed: lead.stage === 'won',
      },
    ]
  })

  const [activities, setActivities] = useState(() => {
    if (lead.activity && lead.activity.length > 0) {
      return lead.activity.map((act) => ({
        ...act,
        time: act.time && act.time.includes('15 Oct 2026') ? act.time.replace('15 Oct 2026', createdDateStr) : (act.time || 'Just now'),
      }))
    }

    return [
      {
        id: 'act-1',
        text: 'WhatsApp welcome message sent automatically',
        time: `${createdDateStr} · 9:25 am`,
      },
      {
        id: 'act-2',
        text: `Enquiry captured from ${lead.source || 'Website'}${lead.property ? ` for ${lead.property}` : ''}`,
        time: `${createdDateStr} · 9:15 am`,
      },
    ]
  })

  // Keep state updated if lead prop changes
  useEffect(() => {
    setStage(lead.stage || 'new')
    setAssignedAgent(lead.assignedAgent?.name || '')
    if (lead.upcomingFollowUps) {
      setFollowUps(
        lead.upcomingFollowUps.map((fu) => ({
          ...fu,
          when: (fu.when || 'Today, 5:00 pm').replace('Today · Today', 'Today, 5:00 pm'),
        }))
      )
    }
    if (lead.activity) {
      setActivities(
        lead.activity.map((act) => ({
          ...act,
          time: act.time && act.time.includes('15 Oct 2026') ? act.time.replace('15 Oct 2026', createdDateStr) : (act.time || 'Just now'),
        }))
      )
    }
  }, [lead])

  // Get initials for lead avatar
  const getInitials = (name) => {
    if (!name) return 'CE'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Handle Stage change
  const handleStageChange = async (newStage) => {
    setStage(newStage)
    try {
      await onUpdate(lead.id, { stage: newStage })
      // Add activity entry
      const stageName =
        STAGE_OPTIONS.find((s) => s.id === newStage)?.label || newStage
      const newAct = {
        id: `act-${Date.now()}`,
        text: `Pipeline stage moved to "${stageName}"`,
        time: 'Just now',
      }
      const updatedActs = [newAct, ...activities]
      setActivities(updatedActs)
      await onUpdate(lead.id, { activity: updatedActs })
    } catch (err) {
      console.error('Failed to update stage:', err)
    }
  }

  // Handle Assigned Agent change
  const handleAgentChange = async (agentName) => {
    setAssignedAgent(agentName)
    const agentObj = dynamicAgents.find((a) => a.name === agentName) || (agentName ? {
      name: agentName,
      initials: agentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      color: '#0B57D0',
    } : {
      name: 'Unassigned',
      initials: 'UN',
      color: '#64748B',
    })
    try {
      await onUpdate(lead.id, { assignedAgent: agentObj })
      const newAct = {
        id: `act-${Date.now()}`,
        text: `Lead assigned to ${agentName}`,
        time: 'Just now',
      }
      const updatedActs = [newAct, ...activities]
      setActivities(updatedActs)
      await onUpdate(lead.id, { activity: updatedActs })
    } catch (err) {
      console.error('Failed to update agent:', err)
    }
  }

  // Handle Add Note
  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteInput.trim()) return
    const noteText = noteInput.trim()
    setNoteInput('')

    try {
      if (onAddNote) {
        const updated = await onAddNote(lead.id, noteText)
        if (updated) {
          if (updated.activity) setActivities(updated.activity)
          if (onUpdate) await onUpdate(lead.id, updated)
          return
        }
      }

      const newAct = {
        id: `act-${Date.now()}`,
        text: `Note added: "${noteText}"`,
        time: 'Just now',
      }
      const updatedActs = [newAct, ...activities]
      const updatedNotes = lead.notes
        ? `${lead.notes}\n• ${noteText}`
        : noteText
      setActivities(updatedActs)

      await onUpdate(lead.id, {
        notes: updatedNotes,
        activity: updatedActs,
      })
    } catch (err) {
      console.error('Failed to add note:', err)
    }
  }

  // Handle Schedule Follow-up submit
  const handleScheduleFollowUp = async ({ type, when, note }) => {
    try {
      if (onScheduleFollowUp) {
        const updated = await onScheduleFollowUp(lead.id, { type, when, note })
        if (updated) {
          if (updated.upcomingFollowUps) setFollowUps(updated.upcomingFollowUps)
          if (updated.activity) setActivities(updated.activity)
          if (onUpdate) await onUpdate(lead.id, updated)
          return
        }
      }

      const newFollowUp = {
        id: `fu-${Date.now()}`,
        type,
        title: note,
        when,
        completed: false,
      }
      const updatedFollowUps = [newFollowUp, ...followUps]
      setFollowUps(updatedFollowUps)

      const newAct = {
        id: `act-${Date.now()}`,
        text: `Follow-up scheduled: ${type} for ${when}`,
        time: 'Just now',
      }
      const updatedActs = [newAct, ...activities]
      setActivities(updatedActs)

      await onUpdate(lead.id, {
        upcomingFollowUps: updatedFollowUps,
        followUpDate: when,
        activity: updatedActs,
      })
    } catch (err) {
      console.error('Failed to save follow-up:', err)
    }
  }

  // Toggle complete on follow-up
  const handleToggleFollowUp = async (fuId) => {
    try {
      if (onToggleFollowUp) {
        const updated = await onToggleFollowUp(lead.id, fuId)
        if (updated) {
          if (updated.upcomingFollowUps) setFollowUps(updated.upcomingFollowUps)
          if (onUpdate) await onUpdate(lead.id, updated)
          return
        }
      }

      const updated = followUps.map((fu) =>
        fu.id === fuId ? { ...fu, completed: !fu.completed } : fu
      )
      setFollowUps(updated)
      await onUpdate(lead.id, { upcomingFollowUps: updated })
    } catch (err) {
      console.error('Failed to update follow-up:', err)
    }
  }

  // Record Payment
  const handleSavePayment = async (paymentData) => {
    try {
      if (onRecordPayment) {
        const updated = await onRecordPayment(lead.id, paymentData)
        if (updated) {
          if (updated.activity) setActivities(updated.activity)
          if (updated.stage) setStage(updated.stage)
          if (onUpdate) await onUpdate(lead.id, updated)
          return
        }
      }

      const {
        paymentFor,
        amount,
        amountFormatted,
        mode,
        referenceNo,
        unitAllotted,
        moveLeadToWon,
      } = paymentData

      const newAct = {
        id: `act-${Date.now()}`,
        text: `${paymentFor} of ${amountFormatted} recorded via ${mode}${
          referenceNo ? ` (Ref: ${referenceNo})` : ''
        }`,
        time: 'Just now',
      }
      const updatedActs = [newAct, ...activities]
      setActivities(updatedActs)

      const updates = {
        advanceReceived: amountFormatted,
        unit: unitAllotted || lead.unit || 'Not allotted',
        activity: updatedActs,
      }

      if (moveLeadToWon) {
        updates.stage = 'won'
        setStage('won')
      }

      await onUpdate(lead.id, updates)
    } catch (err) {
      console.error('Failed to record payment:', err)
    }
  }

  // Send WhatsApp Direct
  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${lead.name}, regarding your enquiry${lead.property ? ` for ${lead.property}` : ''} with Crystal Estates...`
  )}`

  const sourceBadge = getSourceBadge(lead.source)
  const leadInitials = getInitials(lead.name)

  return (
    <div className="fixed inset-0 z-60 overflow-hidden">
      {/* ── Semi-transparent backdrop ── */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* ── Slide-over drawer container ── */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[460px] bg-white shadow-2xl flex flex-col h-full transform transition-all duration-300 ease-in-out border-l border-slate-200 animate-in slide-in-from-right duration-250 font-sans">
          {/* ── 1. DRAWER TOP HEADER ── */}
          <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Avatar circle with initials */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0"
                style={{
                  backgroundColor:
                    lead.assignedAgent?.color || '#0B57D0',
                }}
              >
                {leadInitials}
              </div>

              {/* Name & Subtitle */}
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  {lead.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sourceBadge.bg} ${sourceBadge.text}`}
                  >
                    {lead.source || 'Website'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium truncate">
                    Added {createdDateStr}{lead.property ? ` · ${lead.property}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Close X button */}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── 2. STAGE & ASSIGNED DROPDOWNS ── */}
          <div className="grid grid-cols-2 gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            {/* Stage Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Stage
              </label>
              <div className="relative">
                <select
                  value={stage}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="w-full appearance-none px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] shadow-2xs cursor-pointer pr-7"
                >
                  {dynamicStages.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>

            {/* Assigned to Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Assigned to
              </label>
              <div className="relative">
                <select
                  value={assignedAgent}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  className="w-full appearance-none px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] shadow-2xs cursor-pointer pr-7"
                >
                  {dynamicAgents.map((ag) => (
                    <option key={ag.name} value={ag.name}>
                      {ag.name}
                    </option>
                  ))}
                  {dynamicAgents.length === 0 && (
                    <option value="">Unassigned</option>
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── 3. ACTION BUTTONS GRID (2 rows x 3 columns) ── */}
          <div className="grid grid-cols-3 gap-2 px-5 py-3.5 border-b border-slate-100">
            {/* Call */}
            <a
              href={`tel:${lead.phone}`}
              className="py-2.5 px-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-700 transition shadow-2xs group no-underline"
            >
              <Phone className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition" />
              <span className="text-[11px] font-semibold text-slate-700">Call</span>
            </a>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-2 bg-white hover:bg-emerald-50/50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition shadow-2xs group no-underline"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] transition group-hover:scale-110" />
              <span className="text-[11px] font-bold text-[#16A34A]">WhatsApp</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${lead.email}`}
              className="py-2.5 px-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-700 transition shadow-2xs group no-underline"
            >
              <Mail className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition" />
              <span className="text-[11px] font-semibold text-slate-700">Email</span>
            </a>

            {/* Record Payment */}
            <button
              type="button"
              onClick={() => setIsRecordPaymentModalOpen(true)}
              className="py-2.5 px-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-700 transition shadow-2xs group"
            >
              <span className="w-4 h-4 text-xs font-bold flex items-center justify-center text-slate-600 group-hover:text-[#0B57D0]">
                ₹
              </span>
              <span className="text-[11px] font-semibold text-slate-700">Record payment</span>
            </button>

            {/* Send Document */}
            <button
              type="button"
              onClick={() => {
                alert(`Document sharing initiated for ${lead.email || lead.phone}`)
              }}
              className="py-2.5 px-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-700 transition shadow-2xs group"
            >
              <Upload className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition" />
              <span className="text-[11px] font-semibold text-slate-700">Send document</span>
            </button>

            {/* Follow-up (opens follow-up modal) */}
            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(true)}
              className="py-2.5 px-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-700 transition shadow-2xs group"
            >
              <Calendar className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition" />
              <span className="text-[11px] font-semibold text-slate-700">Follow-up</span>
            </button>
          </div>

          {/* ── 4. SCROLLABLE DETAILS BODY ── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* ── DETAILS SECTION ── */}
            <div>
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3">
                Details
              </div>
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Phone</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {lead.phone || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Email</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                    {lead.email || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Budget</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {lead.budgetFormatted || (lead.budget ? (lead.budget >= 10000000 ? `₹${(lead.budget / 10000000).toFixed(2)} Cr` : `₹${(lead.budget / 100000).toFixed(0)} L`) : '—')}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Requirement</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {lead.requirement || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Project</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {lead.property || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Unit</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {lead.unit || 'Not allotted'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── PAYMENTS SECTION ── */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Payments
                </span>
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentModalOpen(true)}
                  className="text-xs font-bold text-[#0B57D0] hover:text-blue-700 transition"
                >
                  + Record
                </button>
              </div>

              {lead.advanceReceived ? (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      ₹
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900">
                        Advance {lead.advanceReceived} received
                      </div>
                      <div className="text-[11px] text-emerald-600">
                        Booking advance confirmed &amp; verified
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                    ₹
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-700">
                      No advance yet
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Record the booking or token advance once paid
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── DOCUMENTS SECTION ── */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Documents
                </span>
                <button
                  type="button"
                  onClick={() => alert(`Share brochure with ${lead.email || lead.name}`)}
                  className="text-xs font-bold text-[#0B57D0] hover:text-blue-700 transition"
                >
                  + Send
                </button>
              </div>
              <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-2xl text-center">
                <p className="text-xs text-slate-400">
                  No documents shared yet.
                </p>
              </div>
            </div>

            {/* ── UPCOMING FOLLOW-UPS SECTION ── */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Upcoming Follow-ups
                </span>
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="text-xs font-bold text-[#0B57D0] hover:text-blue-700 transition"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-2">
                {followUps.length > 0 ? (
                  followUps.map((fu) => (
                    <div
                      key={fu.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        fu.completed
                          ? 'bg-slate-50/50 border-slate-100 opacity-60'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0B57D0] shrink-0 mt-0.5">
                          {fu.type || 'Call'}
                        </span>
                        <div>
                          <div
                            className={`text-xs font-bold leading-tight ${
                              fu.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {fu.title || `Follow-up ${fu.type || 'Call'}`}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {fu.when || 'Today · 5:00 pm'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleFollowUp(fu.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          fu.completed
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600'
                        }`}
                        title={fu.completed ? 'Completed' : 'Mark complete'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-2xl text-center">
                    <p className="text-xs text-slate-400">
                      No upcoming follow-ups scheduled.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── ADD A NOTE SECTION ── */}
            <div>
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                Add a Note
              </div>
              <form onSubmit={handleAddNote} className="flex items-center gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Prefers east-facing, needs 2 car parks"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-[0.98] shrink-0"
                >
                  Add
                </button>
              </form>
            </div>

            {/* ── ACTIVITY TIMELINE SECTION ── */}
            <div>
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3">
                Activity
              </div>
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
                {activities.map((act) => (
                  <div key={act.id} className="relative">
                    {/* Timeline bullet */}
                    <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-blue-500 absolute -left-5 top-1 shadow-2xs" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {act.text}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {act.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCHEDULE FOLLOW-UP MODAL POPUP ── */}
      <ScheduleFollowUpModal
        isOpen={isFollowUpModalOpen}
        lead={lead}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSchedule={handleScheduleFollowUp}
      />

      {/* ── RECORD ADVANCE PAYMENT MODAL POPUP ── */}
      <RecordPaymentModal
        isOpen={isRecordPaymentModalOpen}
        lead={lead}
        paymentForOptions={meta?.paymentForOptions}
        paymentModes={meta?.paymentModes}
        onClose={() => setIsRecordPaymentModalOpen(false)}
        onSavePayment={handleSavePayment}
      />
    </div>
  )
}

