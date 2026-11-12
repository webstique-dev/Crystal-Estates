import React, { useState } from 'react'
import {
  Building2,
  MapPin,
  User,
  Car,
  MessageCircle,
  Calendar,
  Plus,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import ScheduleSiteVisitModal from './ScheduleSiteVisitModal'
import LeadDrawer from '../leads/LeadDrawer'

function getStatusPillStyle(status) {
  switch (status) {
    case 'Pending':
      return {
        selectClass: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/80',
        dotClass: 'bg-amber-500',
        label: 'Pending',
      }
    case 'Scheduled':
    case 'Confirmed':
      return {
        selectClass: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100/80',
        dotClass: 'bg-blue-500',
        label: 'Scheduled',
      }
    case 'Cancelled':
      return {
        selectClass: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100/80',
        dotClass: 'bg-rose-500',
        label: 'Cancelled',
      }
    case 'Completed':
    default:
      return {
        selectClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/80',
        dotClass: 'bg-emerald-600',
        label: 'Completed',
      }
  }
}

export default function SiteVisitsView({
  visitsState,
  leadsState,
  properties = [],
  isScheduleModalOpen = false,
  setIsScheduleModalOpen,
  onShowToast,
}) {
  const { visits = [], loading, updateVisit, scheduleVisit } = visitsState
  const {
    allLeads = [],
    updateLeadDetails,
    recordPayment,
    scheduleFollowUp,
    toggleFollowUp,
    addNote,
    removeLead,
    meta,
    refreshLeads,
  } = leadsState

  const [selectedLead, setSelectedLead] = useState(null)
  const [isCompletedOpen, setIsCompletedOpen] = useState(false)
  const [isCancelledOpen, setIsCancelledOpen] = useState(false)

  const upcomingVisits = visits.filter(
    (v) =>
      v.status === 'Pending' ||
      v.status === 'Scheduled' ||
      v.status === 'Confirmed' ||
      v.status === 'Tentative' ||
      (!v.status && v.status !== 'Completed' && v.status !== 'Cancelled')
  )
  const completedVisits = visits.filter((v) => v.status === 'Completed')
  const cancelledVisits = visits.filter((v) => v.status === 'Cancelled')

  const handleStatusChange = async (visit, newStatus) => {
    if (visit.status === newStatus) return
    try {
      await updateVisit(visit.id, { status: newStatus })
      if (refreshLeads) refreshLeads()
      if (onShowToast) onShowToast(`Status updated to "${newStatus}" for ${visit.leadName}`)
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error')
    }
  }

  const handleConfirmVisit = async (visit) => {
    try {
      await updateVisit(visit.id, { status: 'Scheduled' })
      if (refreshLeads) refreshLeads()
      if (onShowToast) onShowToast(`Visit scheduled for ${visit.leadName}`)
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error')
    }
  }

  const handleMarkVisited = async (visit) => {
    try {
      await updateVisit(visit.id, { status: 'Completed' })
      if (refreshLeads) refreshLeads()
      if (onShowToast) onShowToast(`Marked ${visit.leadName} as visited!`)
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error')
    }
  }

  const handleOpenLeadDrawer = (visit) => {
    const matchedLead =
      allLeads.find((l) => l.id === visit.leadId) || visit.lead
    if (matchedLead) {
      setSelectedLead(matchedLead)
    }
  }

  const renderVisitCard = (visit) => {
    const pill = getStatusPillStyle(visit.status || 'Pending')
    const cleanPhone = (visit.leadPhone || '').replace(/[^0-9]/g, '')
    const whatsappMsg = `Hello ${visit.leadName}, reminder for your Crystal Estates site visit at ${visit.property} (${visit.location}) on ${visit.dateLabel} at ${visit.visitTime}.${
      visit.cabPickup ? ' Cab pickup has been arranged.' : ''
    }`
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      whatsappMsg
    )}`

    const isPending = visit.status === 'Pending'
    const isCompleted = visit.status === 'Completed'
    const isCancelled = visit.status === 'Cancelled'

    return (
      <div
        key={visit.id}
        className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow"
      >
        <div>
          {/* Top Row: Date + Weekday/Time + Status Dropdown */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-slate-900 leading-tight">
                {visit.dateLabel}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {visit.weekdayLabel} · {visit.visitTime}
              </div>
            </div>

            {/* Interactive Status Dropdown */}
            <div className="relative inline-flex items-center shrink-0">
              <select
                value={visit.status || 'Pending'}
                onChange={(e) => handleStatusChange(visit, e.target.value)}
                className={`appearance-none text-[11px] font-bold pl-5 pr-6 py-1 rounded-full cursor-pointer transition border shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-offset-1 ${pill.selectClass}`}
                aria-label="Change site visit status"
              >
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <span className={`absolute left-2 w-1.5 h-1.5 rounded-full pointer-events-none ${pill.dotClass}`} />
              <ChevronDown className="absolute right-1.5 w-3 h-3 pointer-events-none opacity-60" />
            </div>
          </div>

          <div className="border-t border-slate-100 my-3.5" />

          {/* Lead Avatar + Name + Phone */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs"
              style={{
                backgroundColor: visit.assignedAgent?.color || '#0B57D0',
              }}
            >
              {visit.leadInitials || 'CE'}
            </div>
            <div className="min-w-0">
              <div
                onClick={() => handleOpenLeadDrawer(visit)}
                className="text-sm font-bold text-slate-900 hover:text-[#0B57D0] cursor-pointer transition-colors truncate leading-tight"
              >
                {visit.leadName}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {visit.leadPhone || 'No phone'}
              </div>
            </div>
          </div>

          {/* Property, Location, Agent + Cab Pickup */}
          <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-slate-700 font-semibold">
                {visit.property}
              </span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{visit.location || 'Chennai'}</span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {visit.assignedAgent?.name || 'Crystal Admin'}
              </span>
              {visit.cabPickup && (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <span>·</span>
                  <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Cab pickup</span>
                </span>
              )}
            </div>
          </div>

          {/* Customer Message / Notes */}
          {visit.notes && (
            <div className="mt-3.5 p-2.5 bg-slate-50/90 rounded-xl border border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider mb-0.5">
                Notes / Customer Request
              </span>
              <p className="line-clamp-3 leading-relaxed text-slate-600">{visit.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-4 pt-2 flex items-center flex-wrap gap-2">
          {!isCompleted && !isCancelled && (
            <>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-2xs transition no-underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Send reminder</span>
              </a>

              {isPending && (
                <button
                  type="button"
                  onClick={() => handleConfirmVisit(visit)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs transition"
                >
                  Schedule
                </button>
              )}

              <button
                type="button"
                onClick={() => handleMarkVisited(visit)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold shadow-2xs transition"
              >
                Mark visited
              </button>
            </>
          )}

          {isCompleted && (
            <button
              type="button"
              onClick={() => handleStatusChange(visit, 'Scheduled')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-600 text-xs font-bold shadow-2xs transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reopen visit</span>
            </button>
          )}

          {isCancelled && (
            <button
              type="button"
              onClick={() => handleStatusChange(visit, 'Scheduled')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-600 text-xs font-bold shadow-2xs transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reschedule visit</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7 pb-8 font-sans">
      {/* Loading state */}
      {loading && visits.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-56 bg-white rounded-2xl border border-slate-200 animate-pulse p-5"
            />
          ))}
        </div>
      ) : (
        <>
          {/* ── UPCOMING SECTION ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                UPCOMING · {upcomingVisits.length}
              </div>

              {setIsScheduleModalOpen && (
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="inline-flex md:hidden items-center gap-1.5 px-3 py-1.5 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule visit</span>
                </button>
              )}
            </div>

            {upcomingVisits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingVisits.map((visit) => renderVisitCard(visit))}
              </div>
            ) : (
              <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0B57D0] flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  No upcoming site visits scheduled
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Drag any lead card into the Site visit column or click Schedule visit to arrange a cab pickup and guided layout tour.
                </p>
                {setIsScheduleModalOpen && (
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-[#0B57D0] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                  >
                    + Schedule visit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── COMPLETED SECTION (Dropdown / Collapsible) ── */}
          {completedVisits.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsCompletedOpen(!isCompletedOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl shadow-2xs transition group cursor-pointer text-left"
                aria-expanded={isCompletedOpen}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                    Completed Visits
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {completedVisits.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold group-hover:text-slate-600 transition">
                  <span>{isCompletedOpen ? 'Hide' : 'View'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isCompletedOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {isCompletedOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                  {completedVisits.map((visit) => renderVisitCard(visit))}
                </div>
              )}
            </div>
          )}

          {/* ── CANCELLED SECTION (Dropdown / Collapsible) ── */}
          {cancelledVisits.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsCancelledOpen(!isCancelledOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl shadow-2xs transition group cursor-pointer text-left"
                aria-expanded={isCancelledOpen}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                    Cancelled Visits
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {cancelledVisits.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold group-hover:text-slate-600 transition">
                  <span>{isCancelledOpen ? 'Hide' : 'View'}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isCancelledOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {isCancelledOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                  {cancelledVisits.map((visit) => renderVisitCard(visit))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── SCHEDULE SITE VISIT MODAL ── */}
      {isScheduleModalOpen && (
        <ScheduleSiteVisitModal
          isOpen={isScheduleModalOpen}
          leads={allLeads}
          properties={properties}
          meta={meta}
          onClose={() => setIsScheduleModalOpen && setIsScheduleModalOpen(false)}
          onSchedule={async (visitData) => {
            await scheduleVisit(visitData)
            if (refreshLeads) refreshLeads()
            if (onShowToast) onShowToast('Site visit scheduled successfully!')
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

