import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { NAVIGATION_SECTIONS } from '../../data/navigation'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar({ onOpenUpload, dynamicBadges = {} }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="w-[240px] bg-[#0B57D0] text-white flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
        <Link
          to="/properties"
          className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 no-underline"
        >
          Crystal Estates
          <span className="text-[10px] font-bold bg-[#2970E6] text-white px-1.5 py-0.5 rounded tracking-wide">
            CRM
          </span>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
        {NAVIGATION_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-3 text-[10px] font-bold tracking-wider text-blue-200/70 uppercase mb-1">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const targetPath = item.path || `/${item.id}`
                const isActive =
                  location.pathname === targetPath ||
                  (targetPath !== '/' && location.pathname.startsWith(`${targetPath}/`))

                return (
                  <Link
                    key={item.id}
                    to={targetPath}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition no-underline ${
                      isActive
                        ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                        : 'text-blue-100 hover:text-white hover:bg-white/10 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#0B57D0]' : 'text-blue-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {(() => {
                      const badge =
                        dynamicBadges[item.id] !== undefined
                          ? dynamicBadges[item.id]
                          : item.badge
                      if (!badge) return null
                      return (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-[#0B57D0] text-white'
                              : 'bg-[#2970E6] text-white'
                          }`}
                        >
                          {badge}
                        </span>
                      )
                    })()}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User profile & Quick Action Button at Sidebar Bottom */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {user && (
          <div className="p-2 bg-white/10 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-inner"
                style={{ backgroundColor: user.color || '#2563EB' }}
              >
                {user.initials || 'CA'}
              </div>
              <div className="truncate text-left leading-tight">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-blue-200 truncate">{user.role || 'Super Admin'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Logout from CRM"
              className="p-1.5 text-blue-200 hover:text-rose-300 hover:bg-white/10 rounded-lg transition shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
