import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  X,
  Layers,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Compass,
  DollarSign,
  Maximize2,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { computePathCentroid } from '../../lib/svgPathCentroid'
import { getClientUrl, getApiUrl } from '../../lib/api'

const FACING_OPTIONS = [
  'East',
  'North',
  'West',
  'South',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
]

const STATUS_OPTIONS = [
  { id: 'Available', label: 'Available', color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' },
  { id: 'Booked', label: 'Booked', color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0' },
  { id: 'Sold', label: 'Sold', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
  { id: 'Blocked', label: 'Blocked', color: '#EA580C', bg: '#FFEDD5', border: '#FED7AA' },
]

const PLOT_TYPES = [
  'Residential Plot',
  'Commercial Plot',
  'Corner Plot',
  'Villa Plot',
  'Farm Land',
  'Industrial Plot',
]

export default function PropertyPlotModal({
  isOpen,
  property,
  onClose,
  onPropertyUpdated,
  onShowToast,
}) {
  if (!isOpen || !property) return null

  // Check for multi-phase layout structure
  const layoutPhases = useMemo(() => {
    if (Array.isArray(property.layouts) && property.layouts.length > 0) {
      return property.layouts
    }
    if (Array.isArray(property.phases) && property.phases.length > 0) {
      return property.phases
    }
    return null
  }, [property.layouts, property.phases])

  const [activePhaseIndex, setActivePhaseIndex] = useState(0)
  const currentPhase = layoutPhases ? layoutPhases[activePhaseIndex] : null

  // Local plots state initialized from active phase or property
  const [plots, setPlots] = useState(() => {
    if (currentPhase) {
      const phaseName = (currentPhase.name || `Phase ${activePhaseIndex + 1}`).trim()
      let pList = Array.isArray(currentPhase.plots) ? currentPhase.plots : []
      if (pList.length > 0 && pList.some((p) => p.phase)) {
        return pList.filter(
          (p) => !p.phase || String(p.phase).trim().toLowerCase() === phaseName.toLowerCase()
        )
      } else if (pList.length === 0 && Array.isArray(property.plots) && property.plots.length > 0) {
        return property.plots.filter(
          (p) => p.phase && String(p.phase).trim().toLowerCase() === phaseName.toLowerCase()
        )
      }
      return pList
    }
    return Array.isArray(property.plots) ? property.plots : []
  })
  const [editingPlotNo, setEditingPlotNo] = useState(null)
  const [filter, setFilter] = useState('All')

  // Form inputs
  const [plotNo, setPlotNo] = useState('')
  const [status, setStatus] = useState('Available')
  const [facing, setFacing] = useState('East')
  const [area, setArea] = useState('1200 sq.ft')
  const [dimensions, setDimensions] = useState("30'0\" x 40'0\"")
  const [price, setPrice] = useState('')
  const [roadWidth, setRoadWidth] = useState('30 ft Road')
  const [plotType, setPlotType] = useState('Residential Plot')
  const [surveyNo, setSurveyNo] = useState('')
  const [svgPath, setSvgPath] = useState('')
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Map canvas zoom & pan
  const [zoom, setZoom] = useState(1)
  const [hoveredPlot, setHoveredPlot] = useState(null)

  // Sync state if property or phase changes
  useEffect(() => {
    if (layoutPhases && layoutPhases[activePhaseIndex]) {
      const curPhase = layoutPhases[activePhaseIndex]
      const phaseName = (curPhase.name || `Phase ${activePhaseIndex + 1}`).trim()
      let pList = Array.isArray(curPhase.plots) ? curPhase.plots : []
      if (pList.length > 0 && pList.some((p) => p.phase)) {
        pList = pList.filter(
          (p) => !p.phase || String(p.phase).trim().toLowerCase() === phaseName.toLowerCase()
        )
      } else if (pList.length === 0 && Array.isArray(property.plots) && property.plots.length > 0) {
        pList = property.plots.filter(
          (p) => p.phase && String(p.phase).trim().toLowerCase() === phaseName.toLowerCase()
        )
      }
      setPlots(pList)
    } else if (property) {
      setPlots(Array.isArray(property.plots) ? property.plots : [])
    }
    setEditingPlotNo(null)
    resetForm()
  }, [property, activePhaseIndex, layoutPhases])

  // Extract clean path from pasted input (strips <path ... d="..." /> if pasted)
  const cleanPathData = (raw) => {
    if (!raw) return ''
    const trimmed = raw.trim()
    const dMatch = trimmed.match(/d=["']([^"']+)["']/i)
    if (dMatch && dMatch[1]) return dMatch[1].trim()
    return trimmed.replace(/^d=/, '').replace(/^["']|["']$/g, '').trim()
  }

  const cleanedPath = cleanPathData(svgPath)
  const centroid = useMemo(() => computePathCentroid(cleanedPath), [cleanedPath])

  const resetForm = () => {
    setPlotNo('')
    setStatus('Available')
    setFacing('East')
    setArea('1200 sq.ft')
    setDimensions("30'0\" x 40'0\"")
    setPrice('')
    setRoadWidth('30 ft Road')
    setPlotType('Residential Plot')
    setSurveyNo('')
    setSvgPath('')
    setEditingPlotNo(null)
    setFormError(null)
  }

  // Load plot into form for editing
  const handleEditClick = (plot) => {
    setEditingPlotNo(plot.plotNo)
    setPlotNo(plot.plotNo || '')
    setStatus(plot.status || 'Available')
    setFacing(plot.facing || 'East')
    setArea(plot.area || '')
    setDimensions(plot.dimensions || '')
    setPrice(plot.price || '')
    setRoadWidth(plot.roadWidth || '30 ft Road')
    setPlotType(plot.type || 'Residential Plot')
    setSurveyNo(plot.surveyNo || '')
    setSvgPath(plot.svgPath || '')
    setFormError(null)
  }

  // Target Layout Link for "View Layout" button
  const fallbackSlug = property.name
    ? property.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    : (property.id || '')
  const slug = property.layoutSlug || property.slug || property.projectId || property.id || fallbackSlug
  const phaseParam = currentPhase ? `&phase=${encodeURIComponent(currentPhase.id || currentPhase.name)}` : ''
  const targetLayoutLink = getClientUrl(`/layout-viewer?slug=${encodeURIComponent(slug)}${phaseParam}`)

  const layoutBackgroundUrl =
    currentPhase?.layoutUrl ||
    currentPhase?.layoutBackgroundUrl ||
    property.layoutBackgroundUrl ||
    property.layoutUrl ||
    null
  const activeViewBox =
    currentPhase?.viewBox ||
    property.viewBox ||
    '0 0 1056 816'
  const [, , vbW, vbH] = activeViewBox.split(' ').map(Number)
  const mapWidth = vbW || 1056
  const mapHeight = vbH || 816

  // Status counts
  const counts = {
    All: plots.length,
    Available: plots.filter((p) => p.status === 'Available').length,
    Booked: plots.filter((p) => p.status === 'Booked').length,
    Sold: plots.filter((p) => p.status === 'Sold' || p.status === 'Registered').length,
    Blocked: plots.filter((p) => p.status === 'Blocked').length,
  }

  // Save changes to backend
  const persistPlots = async (updatedPlotsList) => {
    const propId = property.id || property.projectId
    const layoutSlugToUse = property.layoutSlug || slug

    let finalLayouts = null
    let allCombinedPlots = updatedPlotsList

    if (layoutPhases) {
      finalLayouts = layoutPhases.map((l, idx) => {
        if (idx === activePhaseIndex) {
          return {
            ...l,
            plots: updatedPlotsList,
            totalPlots: updatedPlotsList.length,
            availablePlots: updatedPlotsList.filter((p) => p.status === 'Available').length,
          }
        }
        return l
      })

      allCombinedPlots = finalLayouts.flatMap((l) =>
        (l.plots || []).map((p) => ({ ...p, phase: l.name }))
      )
    }

    const availableCount = allCombinedPlots.filter((p) => p.status === 'Available').length
    const bookedCount = allCombinedPlots.filter((p) => p.status === 'Booked').length
    const soldCount = allCombinedPlots.filter((p) => p.status === 'Sold' || p.status === 'Registered').length

    // 1. Update featured_plots document
    const patchPayload = {
      plots: allCombinedPlots,
      totalPlots: allCombinedPlots.length,
      availablePlots: availableCount,
      available: availableCount,
      booked: bookedCount,
      sold: soldCount,
      ...(finalLayouts ? { layouts: finalLayouts, phases: finalLayouts } : {}),
    }

    try {
      // Patch property
      await fetch(getApiUrl(`/api/plots/${propId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchPayload),
      })

      // Sync layout collection
      if (layoutSlugToUse) {
        await fetch(getApiUrl(`/api/plots/layout/${layoutSlugToUse}/plots`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plots: allCombinedPlots,
            layouts: finalLayouts,
            phases: finalLayouts,
          }),
        }).catch(() => {})
      }

      // Update parent component state
      if (onPropertyUpdated) {
        onPropertyUpdated({
          ...property,
          ...patchPayload,
        })
      }
    } catch (err) {
      console.error('Error persisting plots:', err)
      throw err
    }
  }

  // Handle Form Submit (Add or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!plotNo.trim()) {
      setFormError('Please enter a Plot Number.')
      return
    }

    if (!cleanedPath) {
      setFormError('Please provide the SVG Path Boundary data (d="...").')
      return
    }

    try {
      setIsSubmitting(true)

      const calculatedCentroid = computePathCentroid(cleanedPath)

      const plotRecord = {
        id: editingPlotNo || `plot-${plotNo.trim()}`,
        plotNo: plotNo.trim(),
        status,
        facing,
        area: area.trim(),
        dimensions: dimensions.trim(),
        width: dimensions.split('x')[0]?.trim() || '',
        length: dimensions.split('x')[1]?.trim() || '',
        price: price.trim(),
        roadWidth: roadWidth.trim(),
        type: plotType,
        surveyNo: surveyNo.trim(),
        svgPath: cleanedPath,
        textX: calculatedCentroid?.textX ?? null,
        textY: calculatedCentroid?.textY ?? null,
        phase: currentPhase?.name || undefined,
        updatedAt: new Date(),
      }

      let updatedPlotsList
      if (editingPlotNo) {
        updatedPlotsList = plots.map((p) =>
          String(p.plotNo).toLowerCase() === String(editingPlotNo).toLowerCase()
            ? { ...p, ...plotRecord }
            : p
        )
      } else {
        const existingIdx = plots.findIndex(
          (p) => String(p.plotNo).toLowerCase() === String(plotNo.trim()).toLowerCase()
        )
        if (existingIdx >= 0) {
          updatedPlotsList = [...plots]
          updatedPlotsList[existingIdx] = { ...updatedPlotsList[existingIdx], ...plotRecord }
        } else {
          updatedPlotsList = [...plots, plotRecord]
        }
      }

      await persistPlots(updatedPlotsList)
      setPlots(updatedPlotsList)

      if (onShowToast) {
        onShowToast(
          editingPlotNo
            ? `Plot ${plotNo.trim()} updated successfully!`
            : `Plot ${plotNo.trim()} added to ${property.name}!`,
          'success'
        )
      }

      resetForm()
    } catch (err) {
      setFormError(err.message || 'Failed to save plot.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Plot Delete
  const handleDeletePlot = async (targetPlotNo) => {
    if (!window.confirm(`Are you sure you want to delete Plot ${targetPlotNo}?`)) return

    try {
      const updatedPlotsList = plots.filter(
        (p) => String(p.plotNo).toLowerCase() !== String(targetPlotNo).toLowerCase()
      )
      await persistPlots(updatedPlotsList)
      setPlots(updatedPlotsList)

      if (editingPlotNo === targetPlotNo) {
        resetForm()
      }

      if (onShowToast) {
        onShowToast(`Plot ${targetPlotNo} deleted successfully!`, 'info')
      }
    } catch (err) {
      alert(`Failed to delete plot: ${err.message}`)
    }
  }

  // Filtered plots list
  const filteredPlots =
    filter === 'All' ? plots : plots.filter((p) => p.status === filter)

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden font-sans">
        {/* ── Top Header Bar ── */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B57D0] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                  Manage Plots — {property.name}
                </h3>
                {property.projectId && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {property.projectId}
                  </span>
                )}
                {property.type && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {property.type}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {property.location || 'Chennai, Tamil Nadu'} • Configure interactive boundaries & plot specs
              </p>
            </div>
          </div>

          {/* Right Action Buttons: View Layout & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={targetLayoutLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#0B57D0] font-bold text-xs rounded-xl border border-blue-200 shadow-2xs transition active:scale-[0.98]"
              title="Open full interactive layout in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Layout</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Phase Switcher Tabs (Phase-1, Phase-2, etc.) */}
        {layoutPhases && layoutPhases.length > 1 && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-xs font-bold text-slate-500 mr-1 shrink-0">Select Phase:</span>
            {layoutPhases.map((phase, idx) => {
              const isActive = idx === activePhaseIndex
              const count = (phase.plots || []).length
              return (
                <button
                  key={phase.id || idx}
                  type="button"
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                    isActive
                      ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{phase.name || `Phase ${idx + 1}`}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count} {count === 1 ? 'plot' : 'plots'}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Modal Body: 2 Columns on Desktop ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          {/* ════════ LEFT COLUMN (7 COLS): LAYOUT PREVIEW & CONFIGURED PLOTS ════════ */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* 1. Layout Map Viewport Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Plot Layout Blueprint
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Zoom controls */}
                  <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg text-slate-600">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
                      className="p-1 hover:text-slate-900 rounded"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono px-1.5 font-bold">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
                      className="p-1 hover:text-slate-900 rounded"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoom(1)}
                      className="p-1 hover:text-slate-900 rounded"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <a
                    href={targetLayoutLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#0B57D0] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Full Layout</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Layout Visual Frame */}
              <div className="relative w-full h-64 sm:h-80 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                {layoutBackgroundUrl ? (
                  <div
                    className="relative transition-transform duration-150 ease-out flex items-center justify-center"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {/* Background layout map */}
                    <img
                      src={layoutBackgroundUrl}
                      alt={property.name}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    />

                    {/* Interactive Plot Boundary Overlays */}
                    <svg
                      viewBox={activeViewBox}
                      className="absolute inset-0 w-full h-full pointer-events-auto"
                      style={{ overflow: 'visible' }}
                    >
                      {plots.map((p) => {
                        const statusCfg =
                          STATUS_OPTIONS.find((s) => s.id === p.status) || STATUS_OPTIONS[0]
                        const isHovered = hoveredPlot?.plotNo === p.plotNo
                        const isEditingThis = editingPlotNo === p.plotNo

                        return (
                          <g
                            key={p.plotNo || p.id}
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPlot(p)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            onClick={() => handleEditClick(p)}
                          >
                            <path
                              d={p.svgPath}
                              fill={statusCfg.bg}
                              fillOpacity={isHovered || isEditingThis ? 0.75 : 0.45}
                              stroke={statusCfg.color}
                              strokeWidth={isHovered || isEditingThis ? 2.5 : 1.5}
                            />
                            {/* Plot number pin */}
                            {p.textX != null && p.textY != null && (
                              <g transform={`translate(${p.textX}, ${p.textY})`}>
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="10"
                                  fill={statusCfg.color}
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                  className="shadow-sm"
                                />
                                <text
                                  x="0"
                                  y="0"
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill="#ffffff"
                                  fontSize="8"
                                  fontWeight="bold"
                                >
                                  {p.plotNo}
                                </text>
                              </g>
                            )}
                          </g>
                        )
                      })}
                    </svg>

                    {/* Hover Info Tooltip */}
                    {hoveredPlot && (
                      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg pointer-events-none animate-in fade-in duration-100 flex items-center gap-2 z-20">
                        <span className="font-bold">Plot {hoveredPlot.plotNo}</span>
                        <span>•</span>
                        <span>{hoveredPlot.area}</span>
                        <span>•</span>
                        <span className="text-emerald-300 font-bold">{hoveredPlot.status}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No layout blueprint uploaded yet</p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      You can still add plots with their boundary paths below. Upload an SVG blueprint via property edit.
                    </p>
                  </div>
                )}
              </div>

              {/* Status Breakdown Pills */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['All', 'Available', 'Booked', 'Sold', 'Blocked'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        filter === st
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {st} ({counts[st] || 0})
                    </button>
                  ))}
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  {plots.length} demarcated {plots.length === 1 ? 'plot' : 'plots'}
                </span>
              </div>
            </div>

            {/* 2. Existing Plots Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Configured Plots ({filteredPlots.length})
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">Click plot to edit</span>
              </div>

              {filteredPlots.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-600">No plots found</p>
                  <p className="text-[11px] text-slate-400">
                    Use the form on the right to add the first plot for this property.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-56 divide-y divide-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 z-5">
                      <tr>
                        <th className="py-2 px-3">Plot #</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Facing & Area</th>
                        <th className="py-2 px-3">Price</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPlots.map((p) => {
                        const statusCfg =
                          STATUS_OPTIONS.find((s) => s.id === p.status) || STATUS_OPTIONS[0]
                        const isCurrent = editingPlotNo === p.plotNo

                        return (
                          <tr
                            key={p.plotNo || p.id}
                            className={`transition cursor-pointer ${
                              isCurrent ? 'bg-blue-50/70' : 'hover:bg-slate-50/80'
                            }`}
                            onClick={() => handleEditClick(p)}
                          >
                            <td className="py-2 px-3 font-bold text-slate-900">
                              Plot {p.plotNo}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
                                style={{
                                  backgroundColor: statusCfg.bg,
                                  borderColor: statusCfg.border,
                                  color: statusCfg.color,
                                }}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-semibold text-slate-800">{p.facing || 'East'}</div>
                              <div className="text-[10px] text-slate-400">{p.area || p.dimensions}</div>
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {p.price || 'Price on Request'}
                            </td>
                            <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(p)}
                                  className="p-1.5 text-slate-500 hover:text-[#0B57D0] hover:bg-blue-100/60 rounded-lg transition"
                                  title="Edit plot"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePlot(p.plotNo)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Delete plot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ════════ RIGHT COLUMN (5 COLS): ADD / EDIT PLOT FORM ════════ */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              {/* Form Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                    {editingPlotNo ? `Edit Plot ${editingPlotNo}` : 'Add New Plot'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {editingPlotNo
                      ? 'Modify dimensions, pricing, facing, or path data'
                      : 'Define plot boundaries, dimensions, and facing'}
                  </p>
                </div>

                {editingPlotNo && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                  >
                    + New
                  </button>
                )}
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Fields */}
              <form id="plot-editor-form" onSubmit={handleFormSubmit} className="space-y-3.5">
                {/* Row 1: Plot Number & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plot Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={plotNo}
                      onChange={(e) => setPlotNo(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer transition"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Facing & Area */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Facing Direction
                    </label>
                    <select
                      value={facing}
                      onChange={(e) => setFacing(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer transition"
                    >
                      {FACING_OPTIONS.map((f) => (
                        <option key={f} value={f}>
                          {f} Facing
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Area (sq.ft)
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. 1200 sq.ft"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Row 3: Dimensions & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g. 30'0&quot; x 40'0&quot;"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Price
                    </label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. ₹ 42.00 Lakhs"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Row 4: Road Width & Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Road Width
                    </label>
                    <input
                      type="text"
                      value={roadWidth}
                      onChange={(e) => setRoadWidth(e.target.value)}
                      placeholder="e.g. 30 ft Road"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plot Type
                    </label>
                    <select
                      value={plotType}
                      onChange={(e) => setPlotType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer transition"
                    >
                      {PLOT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 5: SVG Path Data */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      SVG Path Boundary (<code className="font-mono text-blue-700 font-semibold">d="..."</code>) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Paste path or &lt;path&gt; tag</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={svgPath}
                    onChange={(e) => setSvgPath(e.target.value)}
                    placeholder='e.g. M 702.90862 324.75473 60.6439 -0.93659 v 46.36098 h -60.6439 l -0.23415 -45.19024 z'
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white resize-y transition"
                  />
                </div>

                {/* Path Centroid & Mini Preview */}
                {cleanedPath && centroid && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                      <svg
                        viewBox={`${centroid.minX - 10} ${centroid.minY - 10} ${Math.max(centroid.maxX - centroid.minX + 20, 30)} ${Math.max(centroid.maxY - centroid.minY + 20, 30)}`}
                        className="w-full h-full"
                      >
                        <path d={cleanedPath} fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                        <circle cx={centroid.textX} cy={centroid.textY} r="7" fill="#0284C7" />
                        <text
                          x={centroid.textX}
                          y={centroid.textY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                        >
                          {plotNo || '1'}
                        </text>
                      </svg>
                    </div>

                    <div className="text-[11px] text-slate-500 min-w-0">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Valid SVG Boundary Path</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        Centroid: X={centroid.textX}, Y={centroid.textY}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              {editingPlotNo && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                form="plot-editor-form"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Saving to Database...</span>
                ) : editingPlotNo ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Update Plot {editingPlotNo}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Plot to Property</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

