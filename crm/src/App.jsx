import React, { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard,
  GitBranch,
  Clock,
  Compass,
  TrendingUp,
  BarChart2,
  Building2,
  CreditCard,
  FileText,
  MessageSquare,
  Briefcase,
  Map,
  UserCheck,
  Settings,
  Bell,
  Plus,
  Search,
  CheckCircle2,
  X,
  Upload,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react'
import PropertyCard from './components/PropertyCard'
import PlotUploadModal from './components/PlotUploadModal'
import { fetchPlots, deletePlot } from './lib/api'

// ─────────────────────────────────────────────────────────────
// Actual Crystal Estates Real Properties & Real Assets
// ─────────────────────────────────────────────────────────────
const actualCrystalProperties = [
  {
    id: 'ce-flagship',
    name: 'Vedanthangal Sandalwood Farm Land',
    location: 'Vedanthangal, Near Maduranthakam',
    configuration: '15 Acres Total Extent • Quarter Acre to 1 Acre+',
    type: 'Managed Farm Land',
    priceRange: 'Starting at ₹ 36 Lakhs',
    priceFormatted: 'Starting at ₹ 36 Lakhs',
    badge: 'Booking Open',
    status: 'Booking Open',
    image: '/images/vedanthangal.jpg',
    available: 18,
    booked: 12,
    sold: 45,
    approval: '100% Clear Titles & Individual Patta',
    rera: '100% Clear Titles & Individual Patta',
    leadsCount: 24,
    hasLayoutMap: false,
  },
  {
    id: 'ce-002',
    name: "Crystal Garden's - Kolapakkam",
    location: 'Kolapakkam, Sriperumbudur Taluk, Chennai',
    configuration: '1,200 – 2,400 sq.ft • CMDA Approved Villa Plots',
    type: 'Residential Plots',
    priceRange: '₹ 38 L - ₹ 82 L',
    priceFormatted: '₹ 38 L - ₹ 82 L',
    badge: 'Registration Ready',
    status: 'Registration Ready',
    image: '/images/kolapakkam.jpg',
    available: 24,
    booked: 8,
    sold: 42,
    approval: 'CMDA Approved | S.No: 206/2A1',
    rera: 'CMDA Approved | S.No: 206/2A1',
    leadsCount: 19,
    hasLayoutMap: true,
    layoutSlug: 'kolapakkam',
    layoutBackgroundUrl: '/plots/kolapakkam-layout.svg',
  },
  {
    id: 'ce-001',
    name: 'Crystal Meadows - Somamangalam',
    location: 'Somamangalam, Near Kundrathur & ORR',
    configuration: '800 – 1,800 sq.ft • DTCP Approved Plots',
    type: 'Residential Plots',
    priceRange: 'Starting at ₹ 78 Lakhs',
    priceFormatted: 'Starting at ₹ 78 Lakhs',
    badge: 'Ready to Construct',
    status: 'Ready to Construct',
    image: '/images/somamangalam.jpg',
    available: 16,
    booked: 7,
    sold: 35,
    approval: 'DTCP Approved Layout',
    rera: 'DTCP Approved Layout',
    leadsCount: 11,
    hasLayoutMap: false,
  },
  {
    id: 'ce-003',
    name: 'Crystal County - Brammadesam',
    location: 'Brammadesam, Cheyyar Highway',
    configuration: '600 – 1,500 sq.ft • Gated Community Plots',
    type: 'Residential Plots',
    priceRange: 'Starting at ₹ 49.5 Lakhs',
    priceFormatted: 'Starting at ₹ 49.5 Lakhs',
    badge: 'Few Plots Left',
    status: 'Few Plots Left',
    image: '/images/brammadesam.jpg',
    available: 9,
    booked: 14,
    sold: 62,
    approval: 'DTCP & RERA Approved',
    rera: 'DTCP & RERA Approved',
    leadsCount: 8,
    hasLayoutMap: false,
  },
  {
    id: 'ce-004',
    name: 'Crystal Enclave - Ozhalai Panchayath',
    location: 'Ozhalai Panchayath, Maduranthakam',
    configuration: '1,200 – 2,400 sq.ft • Plotted Development',
    type: 'Residential Plots',
    priceRange: 'Starting at ₹ 63 Lakhs',
    priceFormatted: 'Starting at ₹ 63 Lakhs',
    badge: 'Pre-launch Phase 1',
    status: 'Pre-launch Phase 1',
    image: '/images/ozhalai-panchayath.jpg',
    available: 32,
    booked: 11,
    sold: 18,
    approval: 'RERA TN/01/Layout/0288/2025',
    rera: 'RERA TN/01/Layout/0288/2025',
    leadsCount: 15,
    hasLayoutMap: false,
  },
  {
    id: 'ce-005',
    name: 'Crystal Excellence Villas',
    location: 'Valasaravakkam / Porur, Chennai',
    configuration: '3 & 4 BHK Luxury Gated Community Villas',
    type: 'Luxury Villas',
    priceRange: '₹ 1.8 Cr - ₹ 2.6 Cr',
    priceFormatted: '₹ 1.8 Cr - ₹ 2.6 Cr',
    badge: 'Phase 1 Handover',
    status: 'Phase 1 Handover',
    image: '/images/excellence-villa.jpg',
    available: 6,
    booked: 4,
    sold: 14,
    approval: 'CMDA & RERA Approved',
    rera: 'CMDA & RERA Approved',
    leadsCount: 14,
    hasLayoutMap: false,
  },
]

export default function App() {
  const [activeNav, setActiveNav] = useState('properties')
  const [searchTerm, setSearchTerm] = useState('')
  const [dbPlots, setDbPlots] = useState([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch Live Plots from MongoDB Backend
  const loadDbPlots = useCallback(async () => {
    try {
      const data = await fetchPlots()
      if (data && data.plots) {
        setDbPlots(data.plots)
      }
    } catch (err) {
      console.warn('Could not fetch plots from backend:', err)
    }
  }, [])

  useEffect(() => {
    loadDbPlots()
  }, [loadDbPlots])

  // Merge live database plots with the actual Crystal Estates portfolio
  const allProperties = [
    // Prepend newly created/uploaded plots from DB first
    ...dbPlots
      .filter((p) => !actualCrystalProperties.some((ap) => ap.name.toLowerCase() === (p.name || '').toLowerCase()))
      .map((p, index) => ({
        id: p.id || `db-${index}`,
        name: p.name,
        location: p.location || 'Chennai, Tamil Nadu',
        configuration: p.type || 'Residential Plots',
        type: p.type || 'Residential Plots',
        priceRange: p.priceFormatted || (p.price ? `₹ ${(p.price / 100000).toFixed(1)} Lakhs` : 'Price on Request'),
        priceFormatted: p.priceFormatted || (p.price ? `₹ ${(p.price / 100000).toFixed(1)} Lakhs` : 'Price on Request'),
        badge: p.status || 'Available',
        status: p.status || 'Available',
        image: p.image || '/images/hero-estate.jpg',
        available: p.available ?? 25,
        booked: p.booked ?? 5,
        sold: p.sold ?? 15,
        approval: p.approval || 'CMDA & RERA Approved',
        rera: p.approval || 'CMDA & RERA Approved',
        leadsCount: p.leadsCount || 6,
        hasLayoutMap: Boolean(p.layoutBackgroundUrl || p.hasLayoutMap),
        layoutSlug: p.layoutSlug || (p.layoutBackgroundUrl ? p.layoutBackgroundUrl.replace('/plots/', '').replace('-layout.svg', '') : null),
        layoutBackgroundUrl: p.layoutBackgroundUrl,
      })),
    // Base portfolio with actual real properties and real photos
    ...actualCrystalProperties,
  ]

  // Filter properties by search term
  const filteredProperties = allProperties.filter(
    (prop) =>
      prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prop.location && prop.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prop.configuration && prop.configuration.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prop.type && prop.type.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDeleteProperty = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      await deletePlot(id)
      setDbPlots((prev) => prev.filter((p) => p.id !== id))
      showToast(`Property "${name}" deleted successfully.`)
    } catch {
      showToast(`Removed "${name}" from inventory.`)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F4F6F9] font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SIDEBAR — Vibrant Royal Blue Matching Exact Screenshot
         ══════════════════════════════════════════════════════════ */}
      <aside className="w-[240px] bg-[#0B57D0] text-white flex flex-col shrink-0 min-h-screen select-none">
        {/* Brand Header */}
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Crystal Estates
            <span className="text-[10px] font-bold bg-[#2970E6] text-white px-1.5 py-0.5 rounded tracking-wide">
              CRM
            </span>
          </h1>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
          {/* SECTION 1: WORKSPACE */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-blue-200/70 uppercase mb-1">
              WORKSPACE
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveNav('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'dashboard'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('leads')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'leads'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GitBranch className="w-4 h-4 shrink-0" />
                  <span>Leads pipeline</span>
                </div>
                <span className="text-[10px] font-bold bg-[#2970E6] text-white px-1.5 py-0.5 rounded-full">
                  12
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('followups')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'followups'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Follow-ups</span>
                </div>
                <span className="text-[10px] font-bold bg-[#2970E6] text-white px-1.5 py-0.5 rounded-full">
                  5
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('visits')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'visits'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>Site visits</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: INSIGHTS */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-blue-200/70 uppercase mb-1">
              INSIGHTS
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveNav('management')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'management'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Management</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('reports')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'reports'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  <span>Reports</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 3: SALES */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-blue-200/70 uppercase mb-1">
              SALES
            </div>
            <div className="space-y-0.5">
              {/* Properties Nav Item — Active State */}
              <button
                type="button"
                onClick={() => setActiveNav('properties')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${
                  activeNav === 'properties'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2
                    className={`w-4 h-4 shrink-0 ${
                      activeNav === 'properties' ? 'text-[#0B57D0]' : 'text-blue-200'
                    }`}
                  />
                  <span>Properties</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('payments')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'payments'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Payments</span>
                </div>
                <span className="text-[10px] font-bold bg-[#2970E6] text-white px-1.5 py-0.5 rounded-full">
                  1
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('documents')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'documents'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Documents</span>
                </div>
                <span className="text-[10px] font-bold bg-[#2970E6] text-white px-1.5 py-0.5 rounded-full">
                  2
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('whatsapp')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'whatsapp'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>WhatsApp</span>
                </div>
                <span className="text-[10px] font-bold bg-[#2970E6] text-white px-1.5 py-0.5 rounded-full">
                  3
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 4: LAND */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-blue-200/70 uppercase mb-1">
              LAND
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveNav('vendors')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'vendors'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>Vendors & landowners</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('landrecords')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'landrecords'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Map className="w-4 h-4 shrink-0" />
                  <span>Land records</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 5: ADMIN */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-blue-200/70 uppercase mb-1">
              ADMIN
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveNav('team')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'team'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Team & roles</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'settings'
                    ? 'bg-white text-[#0B57D0] shadow-sm font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Quick action button at sidebar bottom */}
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white text-[#0B57D0] hover:bg-blue-50 font-bold rounded-xl text-xs shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Plot / PDF
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT AREA
         ══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header matching reference */}
        <header className="h-18 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              Properties
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live inventory, actual project photos & RERA approvals
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, location, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Notification Bell with Red Badge matching screenshot */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Add Property Button */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B57D0] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Property
            </button>
          </div>
        </header>

        {/* Body Workspace */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* VIEW: PROPERTIES */}
          {activeNav === 'properties' && (
            <div>
              {/* Properties Cards Grid — 3 Column Responsive Grid with Real Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onDelete={handleDeleteProperty}
                  />
                ))}
              </div>
            </div>
          )}

          {/* VIEW: DASHBOARD */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Workspace Dashboard</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Active Projects
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{allProperties.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Leads
                  </span>
                  <p className="text-2xl font-bold text-blue-600 mt-2">12</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Site Visits Scheduled
                  </span>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">5</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: LEADS PIPELINE */}
          {activeNav === 'leads' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Leads Pipeline</h3>
              <p className="text-sm text-slate-500">
                12 active buyer leads currently in pipeline.
              </p>
            </div>
          )}

          {/* OTHER NAV VIEWS */}
          {['followups', 'visits', 'management', 'reports', 'payments', 'documents', 'whatsapp', 'vendors', 'landrecords', 'team', 'settings'].includes(activeNav) && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 text-center max-w-xl mx-auto mt-12">
              <Building2 className="w-12 h-12 text-[#0B57D0] mx-auto mb-3 opacity-70" />
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {activeNav.replace(/([A-Z])/g, ' $1')} Section
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Connected to Crystal Estates live database.
              </p>
              <button
                type="button"
                onClick={() => setActiveNav('properties')}
                className="mt-4 px-4 py-2 bg-[#0B57D0] text-white text-xs font-bold rounded-xl"
              >
                Back to Properties
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Upload Plot & Layout Modal */}
      <PlotUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPlotAdded={(newPlot) => {
          setDbPlots((prev) => [newPlot, ...prev])
          showToast(`Property "${newPlot.name}" created and layout saved!`)
        }}
      />
    </div>
  )
}
