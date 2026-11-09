import React from 'react'
import {
  GitBranch,
  Clock,
  Compass,
  TrendingUp,
  BarChart2,
  CreditCard,
  FileText,
  MessageSquare,
  Briefcase,
  Map,
  UserCheck,
  Settings,
  ArrowLeft,
} from 'lucide-react'

const ICON_MAP = {
  leads: GitBranch,
  followups: Clock,
  visits: Compass,
  management: TrendingUp,
  reports: BarChart2,
  payments: CreditCard,
  documents: FileText,
  whatsapp: MessageSquare,
  vendors: Briefcase,
  landrecords: Map,
  team: UserCheck,
  settings: Settings,
}

export default function PlaceholderView({ sectionId, onBack }) {
  const Icon = ICON_MAP[sectionId] || Settings
  const title = sectionId.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-10 text-center max-w-lg mx-auto mt-10">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0B57D0] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title} Workspace</h3>
      <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
        This module is securely connected to the Crystal Estates backend. Real-time updates and active entries will be synced here.
      </p>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#0B57D0] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Properties</span>
        </button>
      )}
    </div>
  )
}

