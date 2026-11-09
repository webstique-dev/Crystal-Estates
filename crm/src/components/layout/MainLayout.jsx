import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout({
  activeNav,
  onSelectNav,
  isAddOrEditPage = false,
  onOpenUpload,
  onAddLead,
  onNewFollowUp,
  onSimulateEnquiry,
  isSimulating = false,
  headerTitle,
  headerSubtitle,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  notificationCount = 3,
  dynamicBadges = {},
  children,
}) {
  return (
    <div className="flex min-h-screen bg-[#F4F6F9] font-sans antialiased">
      {/* ── Fixed Sidebar ── */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={onSelectNav}
        onOpenUpload={onOpenUpload}
        dynamicBadges={dynamicBadges}
      />

      {/* ── Main Scrollable Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeNav={activeNav}
          isAddOrEditPage={isAddOrEditPage}
          title={headerTitle}
          subtitle={headerSubtitle}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          onOpenUpload={onOpenUpload}
          onAddLead={onAddLead}
          onNewFollowUp={onNewFollowUp}
          onSimulateEnquiry={onSimulateEnquiry}
          isSimulating={isSimulating}
          notificationCount={notificationCount}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
