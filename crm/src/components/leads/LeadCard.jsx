import React from 'react'
import {
  Phone,
  Mail,
  Building2,
  Clock,
  MoreVertical,
  CheckCircle2,
  GripVertical,
} from 'lucide-react'

// Source pill badge styling
function getSourceBadgeClass(source) {
  switch (source) {
    case 'Website':
      return 'bg-blue-50 text-blue-600 border border-blue-100'
    case 'WhatsApp':
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    case 'Facebook':
      return 'bg-indigo-50 text-indigo-600 border border-indigo-100'
    case 'Instagram':
      return 'bg-pink-50 text-pink-600 border border-pink-100'
    case '99acres':
      return 'bg-amber-50 text-amber-700 border border-amber-100'
    case 'MagicBricks':
      return 'bg-red-50 text-red-600 border border-red-100'
    case 'Walk-in':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    case 'Referral':
      return 'bg-purple-50 text-purple-600 border border-purple-100'
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-100'
  }
}

export default function LeadCard({ lead, onClick, onDragStart }) {
  const isYesterday = (lead.followUpDate || '').toLowerCase().includes('yesterday')
  const isWon = lead.stage === 'won' || lead.advanceReceived

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', lead.id)
        if (onDragStart) onDragStart(lead)
      }}
      onClick={() => onClick(lead)}
      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group relative"
    >
      {/* Top Header: Source Pill + 3-dots */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getSourceBadgeClass(
            lead.source
          )}`}
        >
          {lead.source || 'Website'}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClick(lead)
          }}
          className="text-slate-300 hover:text-slate-600 p-1 rounded transition"
          title="Lead options"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Customer Name */}
      <h4 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-[#0B57D0] transition-colors leading-tight">
        {lead.name}
      </h4>

      {/* Contact Details */}
      <div className="space-y-1 mb-3 text-slate-500 text-[11px]">
        {lead.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-medium">{lead.phone}</span>
          </div>
        )}

        {lead.email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}

        {lead.property && (
          <div className="flex items-center gap-1.5 pt-0.5 text-slate-700 font-medium">
            <Building2 className="w-3 h-3 text-[#0B57D0] shrink-0" />
            <span className="truncate">{lead.property}</span>
          </div>
        )}
      </div>

      {/* Advance Received Badge (Won cards) */}
      {lead.advanceReceived && (
        <div className="mb-3 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Advance {lead.advanceReceived} received</span>
        </div>
      )}

      {/* Footer: Price + Follow-up date + Assigned Agent Avatar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-1">
        {/* Budget / Price */}
        <span className="text-xs font-bold text-slate-900">
          {lead.budgetFormatted || (lead.budget ? `₹${(lead.budget / 100000).toFixed(1)} L` : 'TBD')}
        </span>

        <div className="flex items-center gap-2">
          {/* Follow-up Time */}
          {lead.followUpDate && (
            <div
              className={`flex items-center gap-1 text-[10px] font-medium ${
                isYesterday ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{lead.followUpDate}</span>
            </div>
          )}

          {/* Agent Avatar */}
          {lead.assignedAgent && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs shrink-0"
              style={{
                backgroundColor: lead.assignedAgent.color || '#0B57D0',
              }}
              title={`Assigned to ${lead.assignedAgent.name}`}
            >
              {lead.assignedAgent.initials || lead.assignedAgent.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

