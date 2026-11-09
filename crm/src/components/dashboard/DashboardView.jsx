import React from 'react'
import { Building2, Layers, MapPin, ArrowRight } from 'lucide-react'

export default function DashboardView({ totalProperties = 0, onNavigateToProperties }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Executive Workspace Overview
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics from Crystal Estates MongoDB database
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Database Projects
            </span>
            <span className="p-2 rounded-xl text-blue-600 bg-blue-50">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{totalProperties}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">
              Live in MongoDB
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Layout Maps
            </span>
            <span className="p-2 rounded-xl text-emerald-600 bg-emerald-50">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">Active</div>
            <div className="text-[11px] font-medium text-emerald-600 mt-1">
              Interactive SVG enabled
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verification Status
            </span>
            <span className="p-2 rounded-xl text-purple-600 bg-purple-50">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">Verified</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">
              Direct Patta & Clear Titles
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Banner */}
      <div className="bg-gradient-to-r from-[#0B57D0] to-[#1C68E8] text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold">Manage Live Plot Inventory</h4>
          <p className="text-xs text-blue-100 mt-1 max-w-lg">
            Review actual properties, update prices, RERA numbers, or upload new CAD/PDF layout drawings.
          </p>
        </div>
        {onNavigateToProperties && (
          <button
            type="button"
            onClick={onNavigateToProperties}
            className="px-4 py-2 bg-white text-[#0B57D0] font-bold text-xs rounded-xl shadow-sm hover:bg-blue-50 transition flex items-center gap-2 shrink-0"
          >
            <span>View All Properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
