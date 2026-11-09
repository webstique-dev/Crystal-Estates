import React, { useState } from 'react'
import { X, Calendar, Clock, ChevronDown } from 'lucide-react'

const FOLLOWUP_TYPES = ['Call', 'WhatsApp', 'Email', 'Site visit', 'Meeting']

const TIME_OPTIONS = [
  'Today, 5:00 pm',
  'Tomorrow, 11:00 am',
  'Tomorrow, 3:00 pm',
  'In 2 days, 10:00 am',
  'Weekend, 11:00 am',
  'Next week, 10:00 am',
]

export default function ScheduleFollowUpModal({
  isOpen,
  lead,
  leads = [],
  onClose,
  onSchedule,
}) {
  const [selectedLeadId, setSelectedLeadId] = useState(lead?.id || leads[0]?.id || '')
  const [type, setType] = useState('Call')
  const [when, setWhen] = useState('Tomorrow, 11:00 am')
  const [note, setNote] = useState('Discuss home loan options and share bank tie-ups')
  const [submitting, setSubmitting] = useState(false)

  React.useEffect(() => {
    if (lead?.id) {
      setSelectedLeadId(lead.id)
    } else if (leads && leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id)
    }
  }, [lead, leads, selectedLeadId])

  if (!isOpen) return null

  const activeLead = lead || leads.find((l) => l.id === selectedLeadId) || leads[0]
  if (!activeLead) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await onSchedule({
        leadId: activeLead.id,
        type,
        when,
        note: note.trim() || `Follow-up ${type} with ${activeLead.name}`,
      })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Schedule a follow-up
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Lead Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lead
            </label>
            <div className="relative">
              {leads && leads.length > 0 && !lead ? (
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} · {l.property || 'Crystal Greens Villas'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={`${activeLead.name} · ${activeLead.property || 'Crystal Greens Villas'}`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-default focus:outline-none pr-8"
                />
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Type & When Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Type
              </label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  {FOLLOWUP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* When */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                When
              </label>
              <div className="relative">
                <select
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  {TIME_OPTIONS.map((tm) => (
                    <option key={tm} value={tm}>
                      {tm}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Note Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Note
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Discuss home loan options and share bank tie-ups"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition resize-none"
            />
          </div>

          {/* Footer Actions */}
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
              {submitting ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

