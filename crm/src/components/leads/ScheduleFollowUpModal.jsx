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
  'Custom Date & Time',
]

const CUSTOM_TIME_SLOTS = [
  '08:00 AM',
  '08:30 AM',
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
  '07:30 PM',
  '08:00 PM',
]

const getTodayDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTomorrowDateString = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatCustomDateTime(dateStr, timeStr) {
  if (!dateStr) return 'Tomorrow, 11:00 am'

  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1
  const day = parseInt(dayStr, 10)
  const dateObj = new Date(year, month, day)

  const now = new Date()
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetOnly = new Date(year, month, day)

  const diffMs = targetOnly.getTime() - todayOnly.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  let formattedTime = '11:00 am'
  if (timeStr) {
    const [hStr, mStr] = timeStr.split(':')
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr || '0', 10)
    const period = h >= 12 ? 'pm' : 'am'
    const displayH = h % 12 === 0 ? 12 : h % 12
    const displayM = String(m).padStart(2, '0')
    formattedTime = `${displayH}:${displayM} ${period}`
  }

  if (diffDays === 0) {
    return `Today, ${formattedTime}`
  }
  if (diffDays === 1) {
    return `Tomorrow, ${formattedTime}`
  }
  if (diffDays === 2) {
    return `In 2 days, ${formattedTime}`
  }

  const monthShort = dateObj.toLocaleDateString('en-GB', { month: 'short' })
  if (year === now.getFullYear()) {
    return `${day} ${monthShort}, ${formattedTime}`
  }
  return `${day} ${monthShort} ${year}, ${formattedTime}`
}

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
  const [customDate, setCustomDate] = useState(getTomorrowDateString())
  const [customTime, setCustomTime] = useState('11:00 AM')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const dateInputRef = React.useRef(null)

  React.useEffect(() => {
    if (lead?.id) {
      setSelectedLeadId(lead.id)
    } else if (leads && leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id)
    }
  }, [lead, leads, selectedLeadId])

  React.useEffect(() => {
    if (isOpen) {
      setWhen('Tomorrow, 11:00 am')
      setCustomDate(getTomorrowDateString())
      setCustomTime('11:00 AM')
    }
  }, [isOpen])

  if (!isOpen) return null

  const activeLead = lead || leads.find((l) => l.id === selectedLeadId) || leads[0]
  if (!activeLead) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const scheduledWhen =
        when === 'Custom Date & Time'
          ? formatCustomDateTime(customDate, customTime)
          : when

      await onSchedule({
        leadId: activeLead.id,
        type,
        when: scheduledWhen,
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
                      {l.name}{l.property ? ` · ${l.property}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={`${activeLead.name}${activeLead.property ? ` · ${activeLead.property}` : ''}`}
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

          {/* Custom Date & Time Row */}
          {when === 'Custom Date & Time' && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Date Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Select date</span>
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
                    value={customDate}
                    min={getTodayDateString()}
                    onChange={(e) => setCustomDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.()
                      } catch {}
                    }}
                    className="custom-date-input w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                    required
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Time Dropdown Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Select time</span>
                </label>
                <div className="relative">
                  <select
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                  >
                    {CUSTOM_TIME_SLOTS.map((tm) => (
                      <option key={tm} value={tm}>
                        {tm}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Note Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Note
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter follow-up agenda or notes..."
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

