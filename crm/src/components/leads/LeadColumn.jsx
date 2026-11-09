import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import LeadCard from './LeadCard'

export default function LeadColumn({
  stage,
  leads = [],
  onLeadClick,
  onAddLeadClick,
  onDropLead,
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  // Calculate sum of stage budget
  const stageTotalValue = leads.reduce((sum, lead) => sum + (Number(lead.budget) || 0), 0)

  const formatStageTotal = (amount) => {
    if (!amount) return '₹0'
    if (amount >= 10000000) {
      const cr = amount / 10000000
      return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`
    }
    if (amount >= 100000) {
      const lk = amount / 100000
      return `₹${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)} L`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const leadId = e.dataTransfer.getData('text/plain')
    if (leadId) {
      onDropLead(stage.id, leadId)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-[290px] shrink-0 bg-[#F8FAFC] rounded-2xl flex flex-col border transition-all ${
        isDragOver
          ? 'border-[#0B57D0] bg-blue-50/40 ring-2 ring-blue-100'
          : 'border-slate-200/80 shadow-xs'
      }`}
      style={{
        borderTopWidth: '3.5px',
        borderTopColor: stage.color || '#3B82F6',
      }}
    >
      {/* Column Header */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          {/* Stage colored dot */}
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: stage.color }}
          />

          {/* Stage Title */}
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            {stage.label}
          </span>

          {/* Count Badge */}
          <span
            className="text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center"
            style={{
              backgroundColor: stage.badgeBg || '#E2E8F0',
              color: stage.badgeColor || '#334155',
            }}
          >
            {leads.length}
          </span>
        </div>

        {/* Total Stage Value */}
        <span className="text-[11px] font-bold text-slate-400">
          {leads.length > 0 ? formatStageTotal(stageTotalValue) : '₹0'}
        </span>
      </div>

      {/* Cards Area */}
      <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto min-h-[460px] max-h-[calc(100vh-270px)]">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
        ))}

        {leads.length === 0 && (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-300 text-[11px] font-medium">
            No leads in this stage
          </div>
        )}
      </div>

      {/* Bottom "+ Add lead" button */}
      <div className="p-2.5 pt-1 border-t border-slate-200/40">
        <button
          type="button"
          onClick={() => onAddLeadClick(stage.id)}
          className="w-full py-2 px-3 border border-dashed border-slate-200 hover:border-blue-400 hover:bg-white text-slate-500 hover:text-[#0B57D0] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add lead</span>
        </button>
      </div>
    </div>
  )
}

