import React, { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

const SOURCE_OPTIONS = [
  'Walk-in',
  'Website',
  'Phone Call',
  'Referral',
  'WhatsApp',
  'Facebook',
  'Instagram',
  '99acres',
  'MagicBricks',
]

const STAGE_OPTIONS = [
  { id: 'new', label: 'New leads' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'followup', label: 'Follow-up' },
  { id: 'sitevisit', label: 'Site visit' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'won', label: 'Won - Booked' },
  { id: 'lost', label: 'Lost' },
]

export default function AddLeadModal({
  initialStage = 'new',
  properties = [],
  meta,
  onClose,
  onSubmit,
}) {
  const dynamicProjects =
    meta?.properties && meta.properties.length > 0
      ? meta.properties.map((p) => p.name)
      : properties && properties.length > 0
      ? properties.map((p) => p.name)
      : []

  const dynamicAgents = meta?.agents && meta.agents.length > 0 ? meta.agents : []
  const dynamicSources = meta?.sources && meta.sources.length > 0 ? meta.sources : SOURCE_OPTIONS
  const dynamicStages = meta?.stages && meta.stages.length > 0 ? meta.stages : STAGE_OPTIONS

  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [project, setProject] = useState(dynamicProjects[0] || '')
  const [source, setSource] = useState(dynamicSources[0] || 'Walk-in')
  const [budgetLakhs, setBudgetLakhs] = useState('')
  const [assignTo, setAssignTo] = useState(dynamicAgents[0]?.name || '')
  const [stage, setStage] = useState(initialStage || 'new')
  const [sendWhatsApp, setSendWhatsApp] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim() || !mobile.trim()) {
      setError('Please provide at least a full name and mobile number.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const numLakhs = Number(budgetLakhs) || 0
      const totalBudget = numLakhs * 100000

      const matchedAgent = dynamicAgents.find((a) => a.name === assignTo)
      const assignedAgentObj =
        matchedAgent ||
        (assignTo
          ? {
              name: assignTo,
              initials: assignTo
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
              color: '#0B57D0',
            }
          : { name: 'Unassigned', initials: 'UN', color: '#64748B' })

      const matchedProp = properties.find((p) => p.name === project)

      // Initial activities
      const initialActivities = []
      if (sendWhatsApp) {
        initialActivities.push({
          id: `act-${Date.now()}-1`,
          text: 'WhatsApp welcome message sent automatically',
          time: 'Just now',
        })
      }
      initialActivities.push({
        id: `act-${Date.now()}-2`,
        text: `Enquiry captured from ${source}${project ? ` for ${project}` : ''}`,
        time: 'Just now',
      })

      await onSubmit({
        name: fullName.trim(),
        phone: mobile.trim(),
        email: email.trim(),
        property: project || '',
        propertyId: matchedProp?.id || null,
        stage: stage.toLowerCase().replace(/\s+/g, ''),
        source,
        budget: totalBudget,
        budgetFormatted:
          numLakhs >= 100 ? `₹${(numLakhs / 100).toFixed(2)} Cr` : numLakhs > 0 ? `₹${numLakhs} L` : 'TBD',
        assignedAgent: assignedAgentObj,
        followUpDate: 'Today',
        notes: project
          ? `${source} enquiry for ${project}.${numLakhs > 0 ? ` Budget: ₹${numLakhs} Lakhs.` : ''}`
          : `${source} enquiry.${numLakhs > 0 ? ` Budget: ₹${numLakhs} Lakhs.` : ''}`,
        requirement: project ? `${project} - Plot/Unit` : 'Plot/Unit',
        unit: 'Not allotted',
        upcomingFollowUps: [
          {
            id: `fu-${Date.now()}`,
            type: 'Call',
            title: `First follow-up call with ${fullName.trim()}`,
            when: 'Tomorrow, 11:00 am',
            completed: false,
          },
        ],
        activity: initialActivities,
      })

      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add lead')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              Add a lead
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manual entry for walk-ins, calls and referrals
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Row 1: Full Name & Mobile */}
          <div className="grid grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mobile number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98400 12345"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Row 2: Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
            />
          </div>

          {/* Row 3: Project & Source */}
          <div className="grid grid-cols-2 gap-3">
            {/* Project */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Project
              </label>
              <div className="relative">
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  <option value="">Select project...</option>
                  {dynamicProjects.map((pName) => (
                    <option key={pName} value={pName}>
                      {pName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Source
              </label>
              <div className="relative">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  {dynamicSources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 4: Budget & Assign to */}
          <div className="grid grid-cols-2 gap-3">
            {/* Budget (₹ lakhs) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Budget (₹ lakhs)
              </label>
              <input
                type="number"
                value={budgetLakhs}
                onChange={(e) => setBudgetLakhs(e.target.value)}
                placeholder="e.g. 85"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
              />
            </div>

            {/* Assign to */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assign to
              </label>
              <div className="relative">
                <select
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
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
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 5: Stage */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Stage
            </label>
            <div className="relative">
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
              >
                {dynamicStages.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Row 6: Checkbox for WhatsApp welcome */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0B57D0] focus:ring-[#0B57D0]"
              />
              <span>Send automated WhatsApp welcome message</span>
            </label>
          </div>

          {/* Row 7: Buttons */}
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
              {submitting ? 'Saving...' : 'Add lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
