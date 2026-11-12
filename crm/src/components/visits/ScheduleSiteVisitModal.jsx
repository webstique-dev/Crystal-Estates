import React, { useState, useEffect, useRef } from 'react'
import { X, Calendar, Clock, ChevronDown, MapPin, Building2, Car } from 'lucide-react'

const VISIT_TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
]

const getTodayDateString = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`
}

const getTomorrowDateString = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

export default function ScheduleSiteVisitModal({
  isOpen,
  lead,
  leads = [],
  properties = [],
  meta,
  onClose,
  onSchedule,
}) {
  const [selectedLeadId, setSelectedLeadId] = useState(lead?.id || leads[0]?.id || '')
  const activeLead = lead || leads.find((l) => l.id === selectedLeadId) || leads[0]

  const resolvePropertyLocation = (propName) => {
    if (!propName) return ''
    const match = properties.find(
      (p) => (p.name || '').toLowerCase().trim() === propName.toLowerCase().trim()
    )
    return match?.location || ''
  }

  const [property, setProperty] = useState(activeLead?.property || properties[0]?.name || '')
  const [location, setLocation] = useState(
    resolvePropertyLocation(activeLead?.property) || ''
  )
  const [visitDate, setVisitDate] = useState(getTomorrowDateString())
  const [visitTime, setVisitTime] = useState('11:00 AM')
  const [status, setStatus] = useState('Confirmed')
  const [cabPickup, setCabPickup] = useState(true)
  const [agentName, setAgentName] = useState(
    activeLead?.assignedAgent?.name || meta?.agents?.[0]?.name || 'Crystal Admin'
  )
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const dateInputRef = useRef(null)

  const agentOptions =
    meta?.agents && meta.agents.length > 0
      ? meta.agents
      : [
          { name: 'Arun Kumar', initials: 'AK', color: '#DC2626' },
          { name: 'Meera R', initials: 'MR', color: '#7C3AED' },
          { name: 'Divya S', initials: 'DS', color: '#0B57D0' },
          { name: 'Deepak Sharma', initials: 'DS', color: '#0D9488' },
          { name: 'Crystal Admin', initials: 'CA', color: '#0B57D0' },
        ]

  useEffect(() => {
    if (isOpen) {
      const targetLead = lead || leads.find((l) => l.id === selectedLeadId) || leads[0]
      if (targetLead) {
        if (lead?.id) setSelectedLeadId(lead.id)
        const prop = targetLead.property || properties[0]?.name || ''
        setProperty(prop)
        setLocation(resolvePropertyLocation(prop) || 'Chennai')
        setAgentName(targetLead.assignedAgent?.name || agentOptions[0]?.name || 'Crystal Admin')
      }
      setVisitDate(getTomorrowDateString())
      setVisitTime('11:00 AM')
      setStatus('Confirmed')
      setCabPickup(true)
      setNotes('')
      setError(null)
    }
  }, [isOpen, lead])

  // Sync property & location when lead dropdown changes
  const handleLeadChange = (newId) => {
    setSelectedLeadId(newId)
    const found = leads.find((l) => l.id === newId)
    if (found) {
      const prop = found.property || properties[0]?.name || ''
      setProperty(prop)
      setLocation(resolvePropertyLocation(prop) || 'Chennai')
      if (found.assignedAgent?.name) {
        setAgentName(found.assignedAgent.name)
      }
    }
  }

  const handlePropertyChange = (newProp) => {
    setProperty(newProp)
    const loc = resolvePropertyLocation(newProp)
    if (loc) setLocation(loc)
  }

  if (!isOpen || !activeLead) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      setSubmitting(true)
      const matchedAgent = agentOptions.find((a) => a.name === agentName) || {
        name: agentName,
        initials: agentName.slice(0, 2).toUpperCase(),
        color: '#0B57D0',
      }

      await onSchedule({
        leadId: activeLead.id,
        property: property.trim() || activeLead.property || 'Crystal Estates',
        location: location.trim() || 'Chennai',
        date: visitDate,
        time: visitTime,
        status,
        cabPickup,
        assignedAgent: matchedAgent,
        notes: notes.trim(),
        moveToSiteVisit: true,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to schedule site visit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Schedule site visit
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Set visit date, time, cab pickup &amp; confirmation status
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Lead Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lead
            </label>
            <div className="relative">
              {leads && leads.length > 0 && !lead ? (
                <>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => handleLeadChange(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                        {l.phone ? ` · ${l.phone}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={`${activeLead.name}${activeLead.phone ? ` · ${activeLead.phone}` : ''}`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-default focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Project & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Property</span>
              </label>
              <input
                type="text"
                value={property}
                onChange={(e) => handlePropertyChange(e.target.value)}
                list="visit-property-list"
                placeholder="Project name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white"
                required
              />
              <datalist id="visit-property-list">
                {properties.map((p) => (
                  <option key={p.id || p.name} value={p.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Porur, ECR"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white"
              />
            </div>
          </div>

          {/* Visit Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Visit date</span>
              </label>
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker?.()
                  } catch {}
                }}
              >
                <input
                  ref={dateInputRef}
                  type="date"
                  value={visitDate}
                  min={getTodayDateString()}
                  onChange={(e) => setVisitDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.()
                    } catch {}
                  }}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Visit time</span>
              </label>
              <div className="relative">
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  {VISIT_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Status & Assigned Agent */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Visit status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Tentative">Tentative</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assigned agent
              </label>
              <div className="relative">
                <select
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  {agentOptions.map((ag) => (
                    <option key={ag.name} value={ag.name}>
                      {ag.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Cab pickup toggle */}
          <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-blue-50/40 transition">
            <input
              type="checkbox"
              checked={cabPickup}
              onChange={(e) => setCabPickup(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#0B57D0] focus:ring-[#0B57D0]"
            />
            <Car className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">
              Arrange cab pickup for customer
            </span>
          </label>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Visit notes (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pickup from Porur junction, show east-facing plots..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Schedule visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

