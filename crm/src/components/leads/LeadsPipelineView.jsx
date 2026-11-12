import React, { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import LeadColumn from './LeadColumn'
import AddLeadModal from './AddLeadModal'
import LeadDrawer from './LeadDrawer'
import ScheduleFollowUpModal from './ScheduleFollowUpModal'
import ScheduleSiteVisitModal from '../visits/ScheduleSiteVisitModal'
import { createSiteVisit } from '../../lib/api'

const PIPELINE_STAGES = [
  {
    id: 'new',
    label: 'New leads',
    color: '#3B82F6',
    badgeBg: '#DBEAFE',
    badgeColor: '#1D4ED8',
  },
  {
    id: 'contacted',
    label: 'Contacted',
    color: '#0D9488',
    badgeBg: '#CCFBF1',
    badgeColor: '#0F766E',
  },
  {
    id: 'followup',
    label: 'Follow-up',
    color: '#D97706',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
  },
  {
    id: 'sitevisit',
    label: 'Site visit',
    color: '#7C3AED',
    badgeBg: '#EDE9FE',
    badgeColor: '#6D28D9',
  },
  {
    id: 'sitevisitdone',
    label: 'Site visit done',
    color: '#0891B2',
    badgeBg: '#CFFAFE',
    badgeColor: '#0E7490',
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    color: '#EA580C',
    badgeBg: '#FFEDD5',
    badgeColor: '#C2410C',
  },
  {
    id: 'won',
    label: 'Won - Booked',
    color: '#10B981',
    badgeBg: '#D1FAE5',
    badgeColor: '#047857',
  },
  {
    id: 'lost',
    label: 'Lost',
    color: '#64748B',
    badgeBg: '#F1F5F9',
    badgeColor: '#475569',
  },
]

const DEFAULT_SOURCES = [
  'All sources',
  'Website',
  'WhatsApp',
  'Walk-in',
  'Phone Call',
  'Referral',
  'Facebook',
  'Instagram',
  '99acres',
  'MagicBricks',
]

export default function LeadsPipelineView({
  leadsState,
  visitsState,
  properties = [],
  isAddModalOpen = false,
  setIsAddModalOpen,
  onShowToast,
}) {
  const {
    leads,
    allLeads = leads,
    moveLeadStage,
    addNewLead,
    updateLeadDetails,
    removeLead,
    refreshLeads,
    selectedSource,
    setSelectedSource,
    selectedAgent,
    setSelectedAgent,
    meta,
  } = leadsState

  const [addModalStage, setAddModalStage] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [followUpDropLead, setFollowUpDropLead] = useState(null)
  const [siteVisitDropLead, setSiteVisitDropLead] = useState(null)

  // Dynamic source tabs
  const sourceTabs = useMemo(() => {
    if (meta?.sources && meta.sources.length > 0) {
      return ['All sources', ...meta.sources]
    }
    return DEFAULT_SOURCES
  }, [meta?.sources])

  // Dynamic agents list derived from meta and active leads
  const dynamicAgentList = useMemo(() => {
    const set = new Set()
    if (meta?.agents && meta.agents.length > 0) {
      meta.agents.forEach((ag) => {
        if (ag.name) set.add(ag.name)
      })
    }
    if (allLeads && allLeads.length > 0) {
      allLeads.forEach((l) => {
        if (l.assignedAgent?.name) set.add(l.assignedAgent.name)
      })
    }
    return ['All agents', ...Array.from(set)]
  }, [meta?.agents, allLeads])

  // Drag and drop handler
  const handleDropLead = async (targetStageId, leadId) => {
    try {
      const lead = allLeads.find((l) => l.id === leadId)
      const currentStage = (lead?.stage || '').toLowerCase().replace(/\s+/g, '')

      if (currentStage === targetStageId) return

      // When dropped into Follow-up column, open the Schedule Follow-up modal first.
      // Only move the card to Follow-up if the user actually schedules the follow-up.
      if (targetStageId === 'followup' && lead) {
        setFollowUpDropLead(lead)
        return
      }

      // When dropped into Site visit column, open the Schedule Site Visit modal first.
      // Only move the card to Site visit if the user actually schedules the visit.
      if (targetStageId === 'sitevisit' && lead) {
        setSiteVisitDropLead(lead)
        return
      }

      await moveLeadStage(leadId, targetStageId)

      if (targetStageId === 'sitevisitdone' && visitsState?.refreshVisits) {
        await visitsState.refreshVisits()
      }

      const stageLabel =
        PIPELINE_STAGES.find((s) => s.id === targetStageId)?.label || targetStageId
      if (onShowToast) {
        onShowToast(`Lead moved to "${stageLabel}"`, 'success')
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error')
    }
  }

  // Open add modal from specific column "+ Add lead" button
  const handleAddClickFromColumn = (stageId) => {
    setAddModalStage(stageId)
    if (setIsAddModalOpen) {
      setIsAddModalOpen(true)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ── Filter Bar: Sources Pills + Agent Dropdown ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        {/* Source Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-semibold scrollbar-none">
          {sourceTabs.map((src) => {
            const isActive = selectedSource === src
            return (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedSource(src)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-50 text-[#0B57D0] font-bold border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {src}
              </button>
            )
          })}
        </div>

        {/* Agent Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 pr-8 rounded-xl shadow-2xs focus:outline-none focus:border-[#0B57D0] cursor-pointer"
          >
            {dynamicAgentList.map((ag) => (
              <option key={ag} value={ag}>
                {ag}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* ── Main Kanban Columns (Horizontally Scrollable) ── */}
      <div className="flex-1 overflow-x-auto pb-6">
        <div className="flex items-start gap-3.5 min-w-max pb-2">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter(
              (l) => (l.stage || '').toLowerCase().replace(/\s+/g, '') === stage.id
            )
            return (
              <LeadColumn
                key={stage.id}
                stage={stage}
                leads={stageLeads}
                onLeadClick={(lead) => setSelectedLead(lead)}
                onAddLeadClick={handleAddClickFromColumn}
                onDropLead={handleDropLead}
              />
            )
          })}
        </div>
      </div>

      {/* ── Modals ── */}
      {isAddModalOpen && (
        <AddLeadModal
          initialStage={addModalStage}
          properties={properties}
          meta={leadsState.meta}
          onClose={() => setIsAddModalOpen && setIsAddModalOpen(false)}
          onSubmit={async (data) => {
            const created = await addNewLead(data)
            if (onShowToast) onShowToast(`Lead for "${created.name}" added to pipeline!`)
          }}
        />
      )}

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          meta={leadsState.meta}
          onClose={() => setSelectedLead(null)}
          onUpdate={async (id, updates) => {
            const updated = await updateLeadDetails(id, updates)
            if (updated) setSelectedLead(updated)
          }}
          onDelete={async (id) => {
            await removeLead(id)
            setSelectedLead(null)
            if (onShowToast) onShowToast('Lead deleted successfully')
          }}
          onRecordPayment={leadsState.recordPayment}
          onScheduleFollowUp={leadsState.scheduleFollowUp}
          onToggleFollowUp={leadsState.toggleFollowUp}
          onAddNote={leadsState.addNote}
        />
      )}

      {followUpDropLead && (
        <ScheduleFollowUpModal
          isOpen={Boolean(followUpDropLead)}
          lead={followUpDropLead}
          defaultWhen="Custom Date & Time"
          onClose={() => setFollowUpDropLead(null)}
          onSchedule={async ({ leadId, type, when, note }) => {
            try {
              await moveLeadStage(leadId, 'followup')
              await leadsState.scheduleFollowUp(leadId, { type, when, note })
              if (onShowToast) {
                onShowToast(
                  `Lead moved to "Follow-up" & scheduled for ${when}`,
                  'success'
                )
              }
            } catch (err) {
              if (onShowToast) onShowToast(err.message, 'error')
              throw err
            }
          }}
        />
      )}

      {siteVisitDropLead && (
        <ScheduleSiteVisitModal
          isOpen={Boolean(siteVisitDropLead)}
          lead={siteVisitDropLead}
          properties={properties}
          meta={meta}
          onClose={() => setSiteVisitDropLead(null)}
          onSchedule={async (visitData) => {
            try {
              const res = visitsState?.scheduleVisit
                ? await visitsState.scheduleVisit(visitData)
                : await createSiteVisit(visitData)
              if (refreshLeads) await refreshLeads()
              const dateLabel = res?.visit?.dateLabel || visitData.date
              const timeLabel = res?.visit?.visitTime || visitData.time
              if (onShowToast) {
                onShowToast(
                  `Lead moved to "Site visit" & scheduled for ${dateLabel}, ${timeLabel}`,
                  'success'
                )
              }
            } catch (err) {
              if (onShowToast) onShowToast(err.message, 'error')
              throw err
            }
          }}
        />
      )}
    </div>
  )
}
