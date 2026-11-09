import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import LeadColumn from './LeadColumn'
import AddLeadModal from './AddLeadModal'
import LeadDrawer from './LeadDrawer'

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

const SOURCE_TABS = [
  'All sources',
  'Website',
  'Facebook',
  'Instagram',
  '99acres',
  'MagicBricks',
  'Walk-in',
  'Referral',
  'WhatsApp',
]

const AGENTS_LIST = [
  'All agents',
  'Arun Kumar',
  'Deepak Sharma',
  'Manoj Raghavan',
  'Priya Natarajan',
]

export default function LeadsPipelineView({
  leadsState,
  properties = [],
  isAddModalOpen = false,
  setIsAddModalOpen,
  onShowToast,
}) {
  const {
    leads,
    moveLeadStage,
    addNewLead,
    updateLeadDetails,
    removeLead,
    selectedSource,
    setSelectedSource,
    selectedAgent,
    setSelectedAgent,
  } = leadsState

  const [addModalStage, setAddModalStage] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)

  // Drag and drop handler
  const handleDropLead = async (targetStageId, leadId) => {
    try {
      await moveLeadStage(leadId, targetStageId)
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
      {/* ── Filter Bar: Sources Pills + Agent Dropdown (Second header removed) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        {/* Source Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-semibold scrollbar-none">
          {SOURCE_TABS.map((src) => {
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
            {AGENTS_LIST.map((ag) => (
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
            if (onShowToast) onShowToast('Lead details updated!')
          }}
          onRecordPayment={async (id, paymentData) => {
            const updated = await leadsState.recordPayment(id, paymentData)
            if (updated) setSelectedLead(updated)
            if (onShowToast) onShowToast('Advance payment recorded successfully!')
            return updated
          }}
          onScheduleFollowUp={async (id, fuData) => {
            const updated = await leadsState.scheduleFollowUp(id, fuData)
            if (updated) setSelectedLead(updated)
            if (onShowToast) onShowToast('Follow-up scheduled!')
            return updated
          }}
          onToggleFollowUp={async (id, fuId) => {
            const updated = await leadsState.toggleFollowUp(id, fuId)
            if (updated) setSelectedLead(updated)
            return updated
          }}
          onAddNote={async (id, noteText) => {
            const updated = await leadsState.addNote(id, noteText)
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
