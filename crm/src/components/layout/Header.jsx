import React from 'react'
import { Search, Bell, Plus, Sparkles, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Header({
  activeNav = 'properties',
  isAddOrEditPage = false,
  title = 'Properties',
  subtitle = 'Projects, RERA details and live unit inventory',
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search projects, location, type...',
  onOpenUpload,
  onAddLead,
  onNewFollowUp,
  onSimulateEnquiry,
  isSimulating = false,
  notificationCount = 3,
}) {
  const { user, logout } = useAuth()

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Dynamic Title & Subtitle based on active page */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Dynamic Controls based on active page */}
      <div className="flex items-center gap-3">
        {/* Dynamic Search Input */}
        {onSearchChange && !isAddOrEditPage && (
          <div className="relative w-64 hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-slate-50 focus:bg-white"
            />
          </div>
        )}

        {/* ── LEADS PIPELINE ACTIONS ── */}
        {!isAddOrEditPage && activeNav === 'leads' && (
          <>

            {onAddLead && (
              <button
                type="button"
                onClick={onAddLead}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B57D0] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add lead</span>
              </button>
            )}
          </>
        )}

        {/* ── FOLLOW-UPS ACTIONS ── */}
        {!isAddOrEditPage && activeNav === 'followups' && onNewFollowUp && (
          <button
            type="button"
            onClick={onNewFollowUp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B57D0] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New follow-up</span>
          </button>
        )}

        {/* ── PROPERTIES & DASHBOARD ACTIONS ── */}
        {!isAddOrEditPage && (activeNav === 'properties' || activeNav === 'dashboard') && onOpenUpload && (
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B57D0] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Profile & Logout Action */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
              style={{ backgroundColor: user.color || '#0B57D0' }}
              title={`${user.name} (${user.role || 'Admin'})`}
            >
              {user.initials || 'CA'}
            </div>

            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {user.role || 'Super Admin'}
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5"
              title="Sign Out of CRM"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-bold">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
