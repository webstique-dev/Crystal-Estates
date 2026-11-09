import React, { useState } from 'react'
import {
  Clock,
  Phone,
  MessageCircle,
  Calendar,
  Check,
  Plus,
  Users,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import ScheduleFollowUpModal from '../leads/ScheduleFollowUpModal'
import LeadDrawer from '../leads/LeadDrawer'

function getTypeBadge(type = 'Call') {
  switch (type.toLowerCase()) {
    case 'whatsapp':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        dot: 'bg-emerald-500',
        label: 'WhatsApp',
      }
    case 'meeting':
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-100',
        dot: 'bg-purple-500',
        label: 'Meeting',
      }
    case 'site visit':
    case 'sitevisit':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-100',
        dot: 'bg-amber-500',
        label: 'Site visit',
      }
    default:
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-100',
        dot: 'bg-blue-500',
        label: 'Call',
      }
  }
}

function parseDueDisplay(whenStr = '') {
  const raw = String(whenStr || '').trim()
  const lower = raw.toLowerCase()

  // Completed check
  if (lower.includes('completed')) {
    return {
      status: 'completed',
      day: 'Completed',
      time: 'Done',
    }
  }

  // Extract time if present (e.g. "4:00 pm", "11:30 am", "5:00 pm")
  const timeRegex = /\b(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))\b/i
  const timeMatch = raw.match(timeRegex)
  let time = timeMatch ? timeMatch[0].trim().toLowerCase() : ''

  // Determine day and status
  if (lower.includes('yesterday')) {
    return {
      status: 'overdue',
      day: 'Yesterday',
      time: time || '4:00 pm',
    }
  }

  if (lower.includes('tomorrow')) {
    return {
      status: 'upcoming',
      day: 'Tomorrow',
      time: time || '11:00 am',
    }
  }

  if (lower.includes('today')) {
    return {
      status: 'today',
      day: 'Today',
      time: time || '5:00 pm',
    }
  }

  // Look for dates like "17 Oct", "18 Oct", "25 Nov"
  const dateRegex = /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\b/i
  const dateMatch = raw.match(dateRegex)
  if (dateMatch) {
    return {
      status: 'upcoming',
      day: dateMatch[0],
      time: time || '11:00 am',
    }
  }

  // Fallback
  const parts = raw.split(/[,·-]/).map((s) => s.trim()).filter(Boolean)
  const day = parts[0] || 'Today'
  return {
    status: 'today',
    day,
    time: time || '5:00 pm',
  }
}

export default function FollowUpsView({
  leadsState,
  onShowToast,
}) {
  const {
    allLeads = [],
    scheduleFollowUp,
    toggleFollowUp,
    updateLeadDetails,
    recordPayment,
    addNote,
    removeLead,
    meta,
  } = leadsState

  const [activeTab, setActiveTab] = useState('open') // 'open' | 'completed'
  const [selectedLead, setSelectedLead] = useState(null)
  const [isNewFollowUpModalOpen, setIsNewFollowUpModalOpen] = useState(false)

  // Flatten all follow-ups across all leads in the database
  const allFollowUps = allLeads.flatMap((lead) =>
    (lead.upcomingFollowUps || []).map((fu) => ({
      ...fu,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      leadEmail: lead.email,
      leadProperty: lead.property,
      assignedAgent: lead.assignedAgent || {
        name: 'Divya S',
        initials: 'DS',
        color: '#0B57D0',
      },
      fullLead: lead,
    }))
  )

  // Filter based on active tab
  const openFollowUps = allFollowUps.filter((f) => {
    if (f.completed) return false
    if (f.fullLead?.stage === 'won') return false
    const due = parseDueDisplay(f.when)
    if (due.status === 'completed') return false
    return true
  })

  const completedFollowUps = allFollowUps.filter((f) => {
    if (f.completed) return true
    if (f.fullLead?.stage === 'won') return true
    const due = parseDueDisplay(f.when)
    if (due.status === 'completed') return true
    return false
  })

  // Categorize open follow-ups
  const overdueList = openFollowUps.filter((f) => {
    const due = parseDueDisplay(f.when)
    return due.status === 'overdue'
  })

  const todayList = openFollowUps.filter((f) => {
    const due = parseDueDisplay(f.when)
    return due.status === 'today'
  })

  const upcomingList = openFollowUps.filter((f) => {
    const due = parseDueDisplay(f.when)
    return due.status === 'upcoming'
  })

  // Handle Mark Done
  const handleMarkDone = async (leadId, fuId) => {
    try {
      await toggleFollowUp(leadId, fuId)
      if (onShowToast) onShowToast('Follow-up marked as completed!')
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error')
    }
  }

  // Handle Snooze +1 day
  const handleSnooze = async (leadId, fuId, currentWhen) => {
    try {
      const lower = (currentWhen || '').toLowerCase()
      let newWhen = 'Tomorrow, 11:00 am'
      if (lower.includes('yesterday')) {
        newWhen = 'Today, 5:00 pm'
      } else if (lower.includes('today')) {
        newWhen = 'Tomorrow, 11:00 am'
      } else if (lower.includes('tomorrow')) {
        newWhen = 'In 2 days, 11:00 am'
      } else {
        newWhen = 'Next week, 10:00 am'
      }

      const lead = allLeads.find((l) => l.id === leadId)
      if (!lead) return

      const updatedFollowUps = (lead.upcomingFollowUps || []).map((fu) =>
        fu.id === fuId ? { ...fu, when: newWhen } : fu
      )

      await updateLeadDetails(leadId, {
        upcomingFollowUps: updatedFollowUps,
        followUpDate: newWhen,
      })

      if (onShowToast) onShowToast(`Rescheduled to ${newWhen}`)
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error')
    }
  }

  // Render Table Section
  const renderSection = (title, count, items) => {
    if (items.length === 0) return null

    return (
      <div key={title} className="space-y-2.5">
        {/* Section Heading */}
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          <span>{title}</span>
          <span>·</span>
          <span>{count}</span>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                <th className="py-2.5 px-4 w-[200px]">Lead</th>
                <th className="py-2.5 px-4 w-[130px]">Type</th>
                <th className="py-2.5 px-4">Note</th>
                <th className="py-2.5 px-4 w-[130px]">Due</th>
                <th className="py-2.5 px-4 w-[160px]">Agent</th>
                <th className="py-2.5 px-4 w-[170px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {items.map((item) => {
                const badge = getTypeBadge(item.type)
                const due = parseDueDisplay(item.when)
                const cleanPhone = (item.leadPhone || '').replace(/[^0-9]/g, '')
                const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hello ${item.leadName}, regarding your follow-up discussion for ${
                    item.leadProperty || 'Crystal Estates'
                  }...`
                )}`

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Lead */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => setSelectedLead(item.fullLead)}
                        className="font-bold text-slate-900 group-hover:text-[#0B57D0] cursor-pointer leading-tight transition-colors"
                      >
                        {item.leadName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {item.leadPhone}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Note */}
                    <td className="py-3 px-4">
                      <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                        {item.title}
                      </p>
                    </td>

                    {/* Due */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div
                        className={`font-bold leading-tight ${
                          due.status === 'overdue'
                            ? 'text-rose-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {due.day}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {due.time}
                      </div>
                    </td>

                    {/* Agent */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs shrink-0"
                          style={{
                            backgroundColor:
                              item.assignedAgent?.color || '#0B57D0',
                          }}
                        >
                          {item.assignedAgent?.initials || 'DS'}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          {item.assignedAgent?.name || 'Divya S'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* WhatsApp */}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-white hover:bg-emerald-50 border border-slate-200/90 hover:border-emerald-200 rounded-lg text-emerald-600 transition shadow-2xs"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        </a>

                        {/* +1 day snooze */}
                        {!item.completed && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSnooze(item.leadId, item.id, item.when)
                            }
                            className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-600 hover:text-slate-900 rounded-lg text-[11px] font-bold transition shadow-2xs"
                            title="Snooze 1 day"
                          >
                            +1 day
                          </button>
                        )}

                        {/* Done toggle */}
                        <button
                          type="button"
                          onClick={() => handleMarkDone(item.leadId, item.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition shadow-2xs active:scale-[0.98] ${
                            item.completed
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-[#0B57D0] hover:bg-blue-700 text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{item.completed ? 'Reopen' : 'Done'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-8 font-sans">
      {/* ── Top Tabs: Open / Completed ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('open')}
            className={`px-4 py-1.5 rounded-xl text-xs transition font-bold ${
              activeTab === 'open'
                ? 'bg-blue-50 text-[#0B57D0] border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Open ({openFollowUps.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-1.5 rounded-xl text-xs transition font-bold ${
              activeTab === 'completed'
                ? 'bg-blue-50 text-[#0B57D0] border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed ({completedFollowUps.length})
          </button>
        </div>

        {/* Quick button to schedule a follow-up */}
        <button
          type="button"
          onClick={() => setIsNewFollowUpModalOpen(true)}
          className="inline-flex md:hidden items-center gap-1.5 px-3 py-1.5 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New follow-up</span>
        </button>
      </div>

      {/* ── Main Follow-up Tables Grouped by DUE timeframe ── */}
      {activeTab === 'open' ? (
        <div className="space-y-6">
          {renderSection('OVERDUE', overdueList.length, overdueList)}
          {renderSection('TODAY', todayList.length, todayList)}
          {renderSection('UPCOMING', upcomingList.length, upcomingList)}

          {openFollowUps.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                All caught up!
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No open follow-ups remaining. Schedule new calls or site visit
                promises to keep your sales pipeline moving forward.
              </p>
              <button
                type="button"
                onClick={() => setIsNewFollowUpModalOpen(true)}
                className="mt-4 px-4 py-2 bg-[#0B57D0] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
              >
                + Schedule Follow-up
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {completedFollowUps.length > 0 ? (
            renderSection('COMPLETED', completedFollowUps.length, completedFollowUps)
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-xs text-slate-400">
                No completed follow-ups yet. Marked items will be archived here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── SCHEDULE NEW FOLLOW-UP MODAL ── */}
      {isNewFollowUpModalOpen && (
        <ScheduleFollowUpModal
          isOpen={isNewFollowUpModalOpen}
          leads={allLeads}
          onClose={() => setIsNewFollowUpModalOpen(false)}
          onSchedule={async ({ leadId, type, when, note }) => {
            await scheduleFollowUp(leadId, { type, when, note })
            if (onShowToast) onShowToast('Follow-up scheduled successfully!')
          }}
        />
      )}

      {/* ── LEAD DRAWER ── */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          meta={meta}
          onClose={() => setSelectedLead(null)}
          onUpdate={async (id, updates) => {
            const updated = await updateLeadDetails(id, updates)
            if (updated) setSelectedLead(updated)
            if (onShowToast) onShowToast('Lead details updated!')
          }}
          onRecordPayment={async (id, paymentData) => {
            const updated = await recordPayment(id, paymentData)
            if (updated) setSelectedLead(updated)
            if (onShowToast) onShowToast('Advance payment recorded successfully!')
            return updated
          }}
          onScheduleFollowUp={async (id, fuData) => {
            const updated = await scheduleFollowUp(id, fuData)
            if (updated) setSelectedLead(updated)
            if (onShowToast) onShowToast('Follow-up scheduled!')
            return updated
          }}
          onToggleFollowUp={async (id, fuId) => {
            const updated = await toggleFollowUp(id, fuId)
            if (updated) setSelectedLead(updated)
            return updated
          }}
          onAddNote={async (id, noteText) => {
            const updated = await addNote(id, noteText)
            if (updated) setSelectedLead(updated)
            if (onShowToast) onShowToast('Note added!')
            return updated
          }}
          onDelete={async (id) => {
            await removeLead(id)
            setSelectedLead(null)
            if (onShowToast) onShowToast('Lead removed from pipeline.')
          }}
        />
      )}
    </div>
  )
}

