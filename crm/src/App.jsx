import React, { useState } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import PropertyGrid from './components/properties/PropertyGrid'
import AddEditPropertyPage from './components/properties/AddEditPropertyPage'
import DashboardView from './components/dashboard/DashboardView'
import LeadsPipelineView from './components/leads/LeadsPipelineView'
import PlaceholderView from './components/views/PlaceholderView'
import FollowUpsView from './components/followups/FollowUpsView'
import ScheduleFollowUpModal from './components/leads/ScheduleFollowUpModal'
import LoginPage from './components/auth/LoginPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Toast from './components/common/Toast'
import { useProperties } from './hooks/useProperties'
import { useLeads } from './hooks/useLeads'

/**
 * Wrapper to resolve property data for /properties/edit/:id route
 */
function EditPropertyRouteWrapper({ properties, onSave, onCancel }) {
  const { id } = useParams()
  const property = properties.find((p) => p.id === id || p.projectId === id)
  return (
    <AddEditPropertyPage
      initialData={property}
      onSave={onSave}
      onCancel={onCancel}
    />
  )
}

/**
 * Wrapper to resolve sectionId for placeholder routes like /followups, /visits, etc.
 */
function SectionPlaceholderRouteWrapper({ onBack }) {
  const { sectionId } = useParams()
  return <PlaceholderView sectionId={sectionId} onBack={onBack} />
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const [toast, setToast] = useState(null)
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
  const [isNewFollowUpModalOpen, setIsNewFollowUpModalOpen] = useState(false)
  const [isSimulatingLead, setIsSimulatingLead] = useState(false)

  // Centralized hook managing live MongoDB plots & actual portfolio
  const {
    properties,
    totalCount,
    searchTerm,
    setSearchTerm,
    addPlot,
    updatePlotState,
    deleteProperty,
  } = useProperties()

  // Centralized hook managing live MongoDB leads pipeline
  const leadsState = useLeads()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Derive activeNav and page state directly from URL pathname
  const getActiveNav = () => {
    const path = location.pathname
    if (path.startsWith('/properties')) return 'properties'
    if (path.startsWith('/leads')) return 'leads'
    if (path.startsWith('/dashboard')) return 'dashboard'
    if (path.startsWith('/followups')) return 'followups'
    if (path.startsWith('/visits')) return 'visits'
    if (path.startsWith('/management')) return 'management'
    if (path.startsWith('/reports')) return 'reports'
    if (path.startsWith('/payments')) return 'payments'
    if (path.startsWith('/documents')) return 'documents'
    if (path.startsWith('/whatsapp')) return 'whatsapp'
    if (path.startsWith('/vendors')) return 'vendors'
    if (path.startsWith('/landrecords')) return 'landrecords'
    if (path.startsWith('/team')) return 'team'
    if (path.startsWith('/settings')) return 'settings'
    return 'properties'
  }

  const activeNav = getActiveNav()
  const isAddOrEditPage =
    location.pathname === '/properties/add' ||
    location.pathname.startsWith('/properties/edit')

  // Handle Save / Update from AddEditPropertyPage
  const handleSaveProperty = (savedProperty, isEdit) => {
    if (isEdit) {
      updatePlotState(savedProperty)
      showToast(`Project "${savedProperty.name}" updated successfully!`)
    } else {
      addPlot(savedProperty)
      showToast(`Property "${savedProperty.name}" published to database!`)
    }
    navigate('/properties')
  }

  const handleDelete = async (id, name) => {
    const success = await deleteProperty(id, name)
    if (success) {
      showToast(`Property "${name}" deleted from database.`)
    }
  }

  // Simulate an incoming enquiry from website/WhatsApp directly from top header
  const handleSimulateEnquiry = async () => {
    try {
      setIsSimulatingLead(true)
      const simulated = await leadsState.simulateEnquiry(properties)
      showToast(`New lead enquiry simulated from ${simulated.source}!`, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsSimulatingLead(false)
    }
  }

  // Dynamic header titles based on URL pathname
  const getHeaderInfo = () => {
    if (location.pathname === '/properties/add') {
      return {
        title: 'Add New Property',
        subtitle: 'Upload complete land specifications, CAD/PDF blueprint & media',
      }
    }
    if (location.pathname.startsWith('/properties/edit')) {
      return {
        title: 'Edit Project',
        subtitle: 'Update project specifications, pricing, documents & drone media',
      }
    }

    switch (activeNav) {
      case 'dashboard':
        return {
          title: 'Workspace Dashboard',
          subtitle: 'Real-time overview of active listings, leads & conversions',
        }
      case 'properties':
        return {
          title: 'Properties',
          subtitle: 'Projects, RERA details and live unit inventory',
        }
      case 'leads':
        return {
          title: 'Leads pipeline',
          subtitle: 'Drag a card to move a lead between stages. Click a card to open it.',
        }
      case 'followups':
        return {
          title: 'Follow-ups',
          subtitle: 'Calls, WhatsApp and meetings your team has promised',
        }
      case 'visits':
        return {
          title: 'Site Visits',
          subtitle: 'Guided on-ground layout visits, transport & survey inspections',
        }
      case 'management':
        return {
          title: 'Management',
          subtitle: 'Executive operations, portfolio overview and sales targets',
        }
      case 'reports':
        return {
          title: 'Reports & Analytics',
          subtitle: 'Real estate revenue, pipeline velocity and conversion reports',
        }
      case 'payments':
        return {
          title: 'Payments & Accounts',
          subtitle: 'Track advances, token amounts, RTGS and installment records',
        }
      case 'documents':
        return {
          title: 'Documents & Registry',
          subtitle: 'Verified legal deeds, patta-chitta files and customer agreements',
        }
      case 'whatsapp':
        return {
          title: 'WhatsApp Automation',
          subtitle: 'Direct customer messaging, brochure dispatches and lead alerts',
        }
      case 'vendors':
        return {
          title: 'Vendors & Landowners',
          subtitle: 'Procurement network, survey agencies and landowner contracts',
        }
      case 'landrecords':
        return {
          title: 'Land Records',
          subtitle: 'Revenue cadastral maps, FMB sketches and village survey logs',
        }
      case 'team':
        return {
          title: 'Team & Roles',
          subtitle: 'Sales executive permissions, agent assignment and user roles',
        }
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'CRM company profile, notifications and system preferences',
        }
      default:
        return {
          title: activeNav.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
          subtitle: 'Connected to Crystal Estates secure management system',
        }
    }
  }

  const { title: headerTitle, subtitle: headerSubtitle } = getHeaderInfo()

  // Dynamic search value & handler based on active URL
  const currentSearchTerm = activeNav === 'leads' ? leadsState.searchQuery : searchTerm
  const handleCurrentSearchChange =
    isAddOrEditPage
      ? null
      : activeNav === 'properties'
      ? setSearchTerm
      : activeNav === 'leads'
      ? leadsState.setSearchQuery
      : null

  const currentSearchPlaceholder =
    activeNav === 'leads'
      ? 'Search name, phone, email...'
      : 'Search projects, location, type...'

  // Calculate real-time dynamic badges for sidebar navigation
  const totalLeadsCount = leadsState.allLeads?.length || 0
  const openFollowUpsCount = (leadsState.allLeads || []).reduce((acc, lead) => {
    if (lead.stage === 'won') return acc
    const count = (lead.upcomingFollowUps || []).filter(
      (fu) => !fu.completed && !String(fu.when || '').toLowerCase().includes('completed')
    ).length
    return acc + count
  }, 0)

  const dynamicBadges = {
    leads: String(totalLeadsCount),
    followups: String(openFollowUpsCount),
  }

  // Check if current URL is an auth route
  const isAuthRoute =
    location.pathname === '/login' || location.pathname === '/forgot-password'

  if (isAuthRoute) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    )
  }

  return (
    <ProtectedRoute>
      {/* ── Main Layout (Sidebar + Dynamic Top Navbar + Content Router) ── */}
      <MainLayout
        activeNav={activeNav}
        onSelectNav={(targetPath) => navigate(targetPath)}
        isAddOrEditPage={isAddOrEditPage}
        onOpenUpload={() => navigate('/properties/add')}
        onAddLead={() => setIsAddLeadModalOpen(true)}
        onNewFollowUp={() => setIsNewFollowUpModalOpen(true)}
        onSimulateEnquiry={handleSimulateEnquiry}
        isSimulating={isSimulatingLead}
        headerTitle={headerTitle}
        headerSubtitle={headerSubtitle}
        searchTerm={currentSearchTerm}
        onSearchChange={handleCurrentSearchChange}
        searchPlaceholder={currentSearchPlaceholder}
        dynamicBadges={dynamicBadges}
      >
        <Routes>
          {/* Default Route -> /properties */}
          <Route path="/" element={<Navigate to="/properties" replace />} />

          {/* Properties List */}
          <Route
            path="/properties"
            element={
              <PropertyGrid
                properties={properties}
                onEdit={(prop) => navigate(`/properties/edit/${prop.id}`)}
                onDelete={handleDelete}
                searchTerm={searchTerm}
                onClearSearch={() => setSearchTerm('')}
              />
            }
          />

          {/* Add Property Page */}
          <Route
            path="/properties/add"
            element={
              <AddEditPropertyPage
                initialData={null}
                onSave={handleSaveProperty}
                onCancel={() => navigate('/properties')}
              />
            }
          />

          {/* Edit Property Page */}
          <Route
            path="/properties/edit/:id"
            element={
              <EditPropertyRouteWrapper
                properties={properties}
                onSave={handleSaveProperty}
                onCancel={() => navigate('/properties')}
              />
            }
          />

          {/* Leads Pipeline */}
          <Route
            path="/leads"
            element={
              <LeadsPipelineView
                leadsState={leadsState}
                properties={properties}
                isAddModalOpen={isAddLeadModalOpen}
                setIsAddModalOpen={setIsAddLeadModalOpen}
                onShowToast={showToast}
              />
            }
          />

          {/* Follow-ups Workspace */}
          <Route
            path="/followups"
            element={
              <FollowUpsView
                leadsState={leadsState}
                onShowToast={showToast}
              />
            }
          />

          {/* Workspace Dashboard */}
          <Route
            path="/dashboard"
            element={
              <DashboardView
                totalProperties={totalCount}
                onNavigateToProperties={() => navigate('/properties')}
              />
            }
          />

          {/* Standalone Modules (Visits, Payments, etc.) */}
          <Route
            path="/:sectionId"
            element={<SectionPlaceholderRouteWrapper onBack={() => navigate('/properties')} />}
          />

          {/* Fallback unknown route */}
          <Route path="*" element={<Navigate to="/properties" replace />} />
        </Routes>
      </MainLayout>

      {/* ── Schedule Follow-up Modal for Workspace ── */}
      {isNewFollowUpModalOpen && (
        <ScheduleFollowUpModal
          isOpen={isNewFollowUpModalOpen}
          leads={leadsState.allLeads}
          onClose={() => setIsNewFollowUpModalOpen(false)}
          onSchedule={async ({ leadId, type, when, note }) => {
            await leadsState.scheduleFollowUp(leadId, { type, when, note })
            showToast('Follow-up scheduled successfully!')
          }}
        />
      )}

      {/* ── Toast Notifications ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ProtectedRoute>
  )
}
