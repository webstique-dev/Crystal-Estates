'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Info,
  ArrowLeft,
} from 'lucide-react'
import { WhatsAppIcon } from '../ui'
import { computePathCentroid } from '@/lib/svgPathCentroid'
import './PlotViewer.css'

/**
 * React Interactive Plot Viewer Component
 * Displays a real estate layout map with dynamic plots loaded from API/Database,
 * pan & zoom, hover tooltips, status filters, and pre-filled WhatsApp inquiry.
 * All plot boundaries and layouts are loaded dynamically from the database.
 */
export default function PlotViewer({
  initialPlots = null,
  fetchUrl = null,
  backgroundUrl = null,
  viewBox = null,
  metadata = null,
  phases = null,
  activePhase = 0,
  onPhaseChange = null,
  whatsappNumber = '919444000000',
  className = '',
  onPlotSelect = null,
  backHref = null,
}) {
  // Data state loaded purely from API or passed props
  const [plots, setPlots] = useState(() => (Array.isArray(initialPlots) ? initialPlots : []))
  const [meta, setMeta] = useState(metadata || {})
  const [loading, setLoading] = useState(Boolean(!Array.isArray(initialPlots) && fetchUrl))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (metadata) setMeta(metadata)
  }, [metadata])

  useEffect(() => {
    if (Array.isArray(initialPlots)) {
      setPlots(initialPlots)
    }
  }, [initialPlots])

  // Multi-Phase Layout Support
  const layoutPhases = React.useMemo(() => {
    if (Array.isArray(phases) && phases.length > 0) return phases
    if (Array.isArray(metadata?.layouts) && metadata.layouts.length > 0) return metadata.layouts
    if (Array.isArray(metadata?.phases) && metadata.phases.length > 0) return metadata.phases
    if (Array.isArray(meta?.layouts) && meta.layouts.length > 0) return meta.layouts
    if (Array.isArray(meta?.phases) && meta.phases.length > 0) return meta.phases
    return null
  }, [phases, metadata, meta])

  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(activePhase || 0)

  useEffect(() => {
    if (typeof activePhase === 'number' && activePhase >= 0) {
      setCurrentPhaseIdx(activePhase)
    }
  }, [activePhase])

  const currentPhase = layoutPhases && layoutPhases[currentPhaseIdx] ? layoutPhases[currentPhaseIdx] : null

  const activeBackgroundUrl =
    currentPhase?.layoutUrl ||
    currentPhase?.layoutBackgroundUrl ||
    backgroundUrl ||
    meta?.layoutBackgroundUrl ||
    meta?.layoutUrl ||
    null

  const activeViewBox =
    currentPhase?.viewBox ||
    viewBox ||
    meta?.viewBox ||
    '0 0 1056 816'

  // Status Filter state: 'All' | 'Available' | 'Booked' | 'Sold' | 'Blocked'
  const [activeFilter, setActiveFilter] = useState('All')

  // Pan & Zoom state
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const panStartRef = useRef({ x: 0, y: 0 })

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef(null)
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)

  // Hover Tooltip state
  const [hoveredPlot, setHoveredPlot] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, flipBelow: false })

  // Selected Plot Modal state
  const [selectedPlot, setSelectedPlot] = useState(null)

  // Touch pinch zoom state
  const touchDistRef = useRef(null)

  // 1. Dynamic Data Fetching from Database API (only when initialPlots is not passed)
  useEffect(() => {
    if (!fetchUrl || Array.isArray(initialPlots)) return
    let isMounted = true

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (isMounted) {
          if (data.metadata) setMeta(data.metadata)
          if (data.layouts || data.phases) {
            setMeta((prev) => ({
              ...prev,
              layouts: data.layouts || data.phases,
              phases: data.layouts || data.phases,
            }))
          }
          setPlots(data.plots || [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [fetchUrl, initialPlots])

  // Active display plots (phase-specific if phases exist, else fallback to props or fetched state)
  const displayPlots = React.useMemo(() => {
    if (currentPhase) {
      const phaseName = (currentPhase.name || `Phase ${currentPhaseIdx + 1}`).trim()
      let pList = Array.isArray(currentPhase.plots) ? currentPhase.plots : []
      if (pList.length > 0 && pList.some((p) => p.phase)) {
        return pList.filter(
          (p) => !p.phase || String(p.phase).trim().toLowerCase() === phaseName.toLowerCase()
        )
      }
      if (pList.length === 0 && Array.isArray(initialPlots) && initialPlots.length > 0) {
        return initialPlots.filter(
          (p) => p.phase && String(p.phase).trim().toLowerCase() === phaseName.toLowerCase()
        )
      }
      if (pList.length === 0 && Array.isArray(plots) && plots.length > 0) {
        return plots.filter(
          (p) => p.phase && String(p.phase).trim().toLowerCase() === phaseName.toLowerCase()
        )
      }
      return pList
    }
    return Array.isArray(initialPlots) ? initialPlots : plots
  }, [currentPhase, currentPhaseIdx, initialPlots, plots])

  const handlePhaseSelect = (idx) => {
    setCurrentPhaseIdx(idx)
    setSelectedPlot(null)
    setHoveredPlot(null)
    if (onPhaseChange) {
      onPhaseChange(idx)
    }
  }

  // Center & Fit Layout automatically when container mounts or phase changes
  const handleResetZoom = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    const [, , vbW, vbH] = (activeViewBox || '0 0 1056 816').split(' ').map(Number)

    const scaleX = (containerWidth - 40) / (vbW || 1056)
    const scaleY = (containerHeight - 40) / (vbH || 816)
    const initialScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.7), 1.3)

    const initialPanX = (containerWidth - (vbW || 1056) * initialScale) / 2
    const initialPanY = (containerHeight - (vbH || 816) * initialScale) / 2

    setScale(initialScale)
    setPan({ x: initialPanX, y: initialPanY })
  }, [activeViewBox])

  useEffect(() => {
    handleResetZoom()
  }, [currentPhaseIdx, activeViewBox, activeBackgroundUrl, handleResetZoom])

  useEffect(() => {
    handleResetZoom()
    window.addEventListener('resize', handleResetZoom)
    return () => window.removeEventListener('resize', handleResetZoom)
  }, [handleResetZoom])

  // Zoom In / Out Handlers
  const handleZoom = (factor) => {
    if (!containerRef.current) return
    const newScale = Math.min(Math.max(scale * factor, 0.6), 4.0)

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2

    const newPanX = centerX - ((centerX - pan.x) / scale) * newScale
    const newPanY = centerY - ((centerY - pan.y) / scale) * newScale

    setScale(newScale)
    setPan({ x: newPanX, y: newPanY })
  }

  // Mouse Wheel Zoom centered on cursor with non-passive listener to prevent browser warnings
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      e.preventDefault()

      const rect = container.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85

      setScale((prevScale) => {
        const newScale = Math.min(Math.max(prevScale * zoomFactor, 0.6), 4.0)
        setPan((prevPan) => {
          const newPanX = cursorX - ((cursorX - prevPan.x) / prevScale) * newScale
          const newPanY = cursorY - ((cursorY - prevPan.y) / prevScale) * newScale
          return { x: newPanX, y: newPanY }
        })
        return newScale
      })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    panStartRef.current = { ...pan }
  }

  // Smart tooltip positioning: clamps inside canvas bounds & flips below when near top
  const updateTooltipPosition = (clientX, clientY) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = clientX - rect.left
    const mouseY = clientY - rect.top

    const tipW = tooltipRef.current?.offsetWidth || 210
    const tipH = tooltipRef.current?.offsetHeight || 165
    const halfW = tipW / 2
    const gap = 16

    // Flip below if cursor is too close to top edge of the canvas viewport
    const flipBelow = mouseY < tipH + gap + 20

    // Clamp X so tooltip never clips left or right edge of the container
    const clampedX = Math.max(halfW + 12, Math.min(rect.width - halfW - 12, mouseX))

    // Clamp Y to prevent clipping at bottom if flipped below or top if flipped above
    let clampedY = mouseY
    if (flipBelow) {
      if (mouseY + gap + tipH > rect.height - 12) {
        clampedY = Math.max(0, rect.height - tipH - gap - 12)
      }
    } else {
      if (mouseY - gap - tipH < 12) {
        clampedY = tipH + gap + 12
      }
    }

    setTooltipPos({
      x: clampedX,
      y: clampedY,
      flipBelow,
    })
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      })
    }

    updateTooltipPosition(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch Handlers for Mobile (Pan & Pinch-to-zoom)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      panStartRef.current = { ...pan }
    } else if (e.touches.length === 2) {
      setIsDragging(false)
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      touchDistRef.current = dist
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x
      const dy = e.touches[0].clientY - dragStartRef.current.y
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      })
    } else if (e.touches.length === 2 && touchDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const factor = dist / touchDistRef.current
      setScale((prev) => Math.min(Math.max(prev * factor, 0.6), 4.0))
      touchDistRef.current = dist
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    touchDistRef.current = null
  }

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!viewerRef.current) return
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Sync Fullscreen with browser native fullscreenchange
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
      setTimeout(() => {
        handleResetZoom()
      }, 100)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [handleResetZoom])

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedPlot(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Plot Counts for Filter Pills
  const counts = {
    All: displayPlots.length,
    Available: displayPlots.filter((p) => p.status === 'Available').length,
    Booked: displayPlots.filter((p) => p.status === 'Booked').length,
    Sold: displayPlots.filter((p) => p.status === 'Sold' || p.status === 'Registered').length,
    Blocked: displayPlots.filter((p) => p.status === 'Blocked').length,
  }

  // Build WhatsApp Inquiry URL
  const getWhatsAppUrl = (plot) => {
    if (!plot) return '#'
    const layoutTitle = meta?.title || meta?.name || 'Crystal Estates'
    const message = `Hello Crystal Estates, I am interested in ${layoutTitle} Plot No ${plot.plotNo} (${plot.area}, ${plot.facing} facing). Please share current pricing and schedule a site visit.`
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  const rawTitle = meta?.title || meta?.name || 'Layout Master Plan'
  const cleanTitle = rawTitle.replace(/\s*\((Phase\s*\d+|Layout\s*\d+)\)/gi, '').trim()
  const layoutTitle =
    currentPhase && layoutPhases && layoutPhases.length > 1
      ? `${cleanTitle} (${currentPhase.name || `Phase ${currentPhaseIdx + 1}`})`
      : rawTitle
  const subtitleParts = [
    meta?.sNo ? `S.No: ${meta.sNo}` : null,
    meta?.village,
    meta?.taluk ? `${meta.taluk} Taluk` : null,
    meta?.district || meta?.location,
  ].filter(Boolean)

  return (
    <div
      ref={viewerRef}
      className={`plot-viewer ${isFullscreen ? 'plot-viewer--fullscreen' : ''} ${className}`}
    >
      {/* ── Top Header & Filter Bar (Template Styled) ── */}
      <div className="plot-viewer__header">
        <div className="plot-viewer__title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {backHref && (
              <Link
                href={backHref}
                className="plot-viewer__back-btn"
                title="Back to Project Details"
                aria-label="Back to Project Details"
              >
                <ArrowLeft size={15} />
                <span className="pv-back-text">Back</span>
              </Link>
            )}
            <h3 className="plot-viewer__title">
              {layoutTitle}
              <span className="plot-viewer__badge">Interactive Plan</span>
            </h3>
          </div>
          {subtitleParts.length > 0 && (
            <p className="plot-viewer__subtitle">
              {subtitleParts.join(' • ')}
            </p>
          )}
        </div>

        {/* Phase Switcher (if multiple phases exist) */}
        {layoutPhases && layoutPhases.length > 1 && (
          <div className="plot-viewer__phase-switcher" role="tablist" aria-label="Select layout phase">
            {layoutPhases.map((phase, idx) => {
              const isSelected = idx === currentPhaseIdx
              const phasePlotCount = Array.isArray(phase.plots) ? phase.plots.length : 0
              return (
                <button
                  key={phase.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handlePhaseSelect(idx)}
                  className={`plot-viewer__phase-btn ${isSelected ? 'plot-viewer__phase-btn--active' : ''}`}
                >
                  <span className={`plot-viewer__phase-dot ${isSelected ? 'plot-viewer__phase-dot--active' : ''}`} />
                  <span className="plot-viewer__phase-btn-text">{phase.name || `Phase ${idx + 1}`}</span>
                  {phasePlotCount > 0 && (
                    <span className="plot-viewer__phase-count">
                      {phasePlotCount} {phasePlotCount === 1 ? 'Plot' : 'Plots'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Filter Pills */}
        <div className="plot-viewer__filter-bar" role="tablist" aria-label="Filter plots by status">
          <button
            type="button"
            className={`plot-filter-btn ${activeFilter === 'All' ? 'plot-filter-btn--active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All Plots
            <span className="plot-filter-btn__count">{counts.All}</span>
          </button>

          <button
            type="button"
            className={`plot-filter-btn ${activeFilter === 'Available' ? 'plot-filter-btn--active' : ''}`}
            onClick={() => setActiveFilter('Available')}
          >
            <span className="plot-filter-btn__dot plot-filter-btn__dot--avail" />
            Available
            <span className="plot-filter-btn__count">{counts.Available}</span>
          </button>

          <button
            type="button"
            className={`plot-filter-btn ${activeFilter === 'Booked' ? 'plot-filter-btn--active' : ''}`}
            onClick={() => setActiveFilter('Booked')}
          >
            <span className="plot-filter-btn__dot plot-filter-btn__dot--booked" />
            Booked
            <span className="plot-filter-btn__count">{counts.Booked}</span>
          </button>

          <button
            type="button"
            className={`plot-filter-btn ${activeFilter === 'Sold' ? 'plot-filter-btn--active' : ''}`}
            onClick={() => setActiveFilter('Sold')}
          >
            <span className="plot-filter-btn__dot plot-filter-btn__dot--sold" />
            Sold
            <span className="plot-filter-btn__count">{counts.Sold}</span>
          </button>

          {counts.Blocked > 0 && (
            <button
              type="button"
              className={`plot-filter-btn ${activeFilter === 'Blocked' ? 'plot-filter-btn--active' : ''}`}
              onClick={() => setActiveFilter('Blocked')}
            >
              <span className="plot-filter-btn__dot plot-filter-btn__dot--blocked" />
              Blocked
              <span className="plot-filter-btn__count">{counts.Blocked}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Canvas Viewport ── */}
      <div
        ref={containerRef}
        className={`plot-viewer__canvas-container ${isDragging ? 'plot-viewer__canvas-container--dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loading && (
          <div className="plot-viewer__loading-overlay">
            <div className="plot-viewer__spinner" />
            <span>Loading layout from database...</span>
          </div>
        )}

        {error && (
          <div className="plot-viewer__error-banner">
            Error loading plots: {error}
          </div>
        )}

        {/* Transform Stage */}
        <div
          className="plot-viewer__map-stage"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
        >
          {(() => {
            const [, , vbW, vbH] = (activeViewBox || '0 0 1056 816').split(' ').map(Number)
            const stageWidth = vbW || 1056
            const stageHeight = vbH || 816

            return (
              <div
                className="plot-viewer__map-layers"
                style={{
                  width: `${stageWidth}px`,
                  height: `${stageHeight}px`,
                }}
              >
                {/* 1. Background Layout Map Image / Blueprint */}
                {activeBackgroundUrl && (
                  <img
                    src={activeBackgroundUrl}
                    alt={layoutTitle}
                    className="plot-viewer__bg-image"
                    draggable={false}
                  />
                )}

                {/* 2. Interactive SVG Overlay Element (Dynamically fetched from DB) */}
                <svg
                  viewBox={activeViewBox}
                  className="plot-viewer__overlay-svg"
                  aria-label="Interactive Plot Overlay"
                >
                  {displayPlots.filter((plot) => Boolean(plot.svgPath && plot.svgPath.trim())).map((plot) => {
                const isMatch =
                  activeFilter === 'All' ||
                  plot.status === activeFilter ||
                  (activeFilter === 'Sold' && plot.status === 'Registered')

                const isSelected = selectedPlot?.id === plot.id

                return (
                  <g
                    key={plot.id || plot.plotNo}
                    id={`plot-group-${plot.plotNo}`}
                    className={`pv-plot pv-plot--${plot.status} ${isSelected ? 'pv-plot--selected' : ''} ${!isMatch ? 'pv-plot--dimmed' : ''}`}
                    onMouseEnter={(e) => {
                      updateTooltipPosition(e.clientX, e.clientY)
                      setHoveredPlot(plot)
                    }}
                    onMouseMove={(e) => {
                      updateTooltipPosition(e.clientX, e.clientY)
                    }}
                    onMouseLeave={() => setHoveredPlot(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPlot(plot)
                      if (onPlotSelect) onPlotSelect(plot)
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Plot Number ${plot.plotNo}, Status: ${plot.status}, Area: ${plot.area}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedPlot(plot)
                      }
                    }}
                  >
                    {/* Boundary Path */}
                    <path
                      d={plot.svgPath}
                      className="pv-plot__boundary"
                    />

                    {/* Centered Plot Number Label (Computed from path centroid if missing/misaligned) */}
                    {(() => {
                      const centroid = computePathCentroid(plot.svgPath)
                      const isExplicitValid =
                        plot.textX !== undefined &&
                        plot.textY !== undefined &&
                        (!centroid || (
                          plot.textX >= centroid.minX - 35 &&
                          plot.textX <= centroid.maxX + 35 &&
                          plot.textY >= centroid.minY - 35 &&
                          plot.textY <= centroid.maxY + 35
                        ))
                      const labelX = isExplicitValid ? plot.textX : (centroid?.textX ?? plot.textX ?? 0)
                      const labelY = isExplicitValid ? plot.textY : (centroid?.textY ?? plot.textY ?? 0)

                      return (
                        <g transform={`translate(${labelX}, ${labelY})`}>
                          <circle
                            cx="0"
                            cy="0"
                            r="11"
                            className="pv-plot__label-bg"
                          />
                          <text
                            x="0"
                            y="0"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="pv-plot__label-text"
                          >
                            {plot.plotNo}
                          </text>
                        </g>
                      )
                    })()}
                  </g>
                )
              })}
            </svg>
          </div>
        )
      })()}
    </div>

        {/* ── Floating Zoom Controls Toolbar ── */}
        <div className="plot-viewer__controls" role="toolbar" aria-label="Map zoom and navigation controls">
          <button
            type="button"
            className="pv-control-btn"
            onClick={() => handleZoom(1.25)}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={18} />
          </button>

          <span className="plot-viewer__zoom-level" title="Zoom Percentage">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            className="pv-control-btn"
            onClick={() => handleZoom(0.8)}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>

          <button
            type="button"
            className="pv-control-btn"
            onClick={handleResetZoom}
            title="Reset Zoom & Center"
            aria-label="Reset View"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            className="pv-control-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* ── Instruction Pill (Hidden when plot details card is open) ── */}
        {!selectedPlot && (
          <div className="plot-viewer__helper-pill">
            <Info size={14} />
            <span>Click & drag to pan • Scroll to zoom • Click plot for details</span>
          </div>
        )}

        {/* ── Hover Tooltip Card ── */}
        {hoveredPlot && !isDragging && (
          <div
            ref={tooltipRef}
            className={`pv-tooltip ${tooltipPos.flipBelow ? 'pv-tooltip--bottom' : ''}`}
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
          >
            <div className="pv-tooltip__header">
              <h4 className="pv-tooltip__title">Plot {hoveredPlot.plotNo}</h4>
              <span className={`pv-tooltip__status pv-tooltip__status--${hoveredPlot.status}`}>
                {hoveredPlot.status}
              </span>
            </div>
            <div className="pv-tooltip__grid">
              <span className="pv-tooltip__label">Facing:</span>
              <span className="pv-tooltip__val">{hoveredPlot.facing}</span>
              <span className="pv-tooltip__label">Dimensions:</span>
              <span className="pv-tooltip__val">
                {hoveredPlot.dimensions || `${hoveredPlot.width || ''} × ${hoveredPlot.length || ''}`}
              </span>
              <span className="pv-tooltip__label">Area:</span>
              <span className="pv-tooltip__val">{hoveredPlot.area}</span>
            </div>
            <div className="pv-tooltip__hint">Click for full details & WhatsApp inquiry</div>
          </div>
        )}

        {/* ── Selected Plot Tiny Sweet Card (Bottom-Left Corner) ── */}
        {selectedPlot && (
          <div
            className="pv-tiny-card"
            role="region"
            aria-label={`Plot No ${selectedPlot.plotNo} Details`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* Header: Title + Status + Close */}
            <div className="pv-tiny-card__header">
              <div className="pv-tiny-card__title-wrap">
                <span className="pv-tiny-card__title">Plot {selectedPlot.plotNo}</span>
                <span className={`pv-tiny-card__badge pv-tiny-card__badge--${selectedPlot.status}`}>
                  {selectedPlot.status}
                </span>
              </div>
              <button
                type="button"
                className="pv-tiny-card__close"
                onClick={() => setSelectedPlot(null)}
                aria-label="Close"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick Compact Specs Grid */}
            <div className="pv-tiny-card__specs">
              <div className="pv-tiny-card__spec">
                <span className="pv-tiny-card__label">Extent</span>
                <strong className="pv-tiny-card__val">{selectedPlot.area}</strong>
              </div>
              <div className="pv-tiny-card__spec">
                <span className="pv-tiny-card__label">Facing</span>
                <strong className="pv-tiny-card__val">{selectedPlot.facing}</strong>
              </div>
              <div className="pv-tiny-card__spec">
                <span className="pv-tiny-card__label">Size</span>
                <strong className="pv-tiny-card__val">
                  {selectedPlot.dimensions || `${selectedPlot.width || ''} × ${selectedPlot.length || ''}`}
                </strong>
              </div>
              {selectedPlot.price && (
                <div className="pv-tiny-card__spec">
                  <span className="pv-tiny-card__label">Price</span>
                  <strong className="pv-tiny-card__val pv-tiny-card__val--price">{selectedPlot.price}</strong>
                </div>
              )}
            </div>

            {/* Compact WhatsApp Action */}
            <a
              href={getWhatsAppUrl(selectedPlot)}
              target="_blank"
              rel="noopener noreferrer"
              className="pv-tiny-card__btn-wa"
            >
              <WhatsAppIcon size={15} />
              <span>Contact on WhatsApp</span>
            </a>
          </div>
        )}
      </div>

      {/* ── Footer Status Color Legend (Template Styled) ── */}
      <div className="plot-viewer__footer">
        <div className="plot-viewer__legend">
          <span style={{ fontWeight: 700, color: 'var(--ink, #111e16)' }}>Status Legend:</span>
          <div className="pv-legend-item">
            <span className="pv-legend-dot pv-legend-dot--Available" />
            <span>Available (Sky Blue)</span>
          </div>
          <div className="pv-legend-item">
            <span className="pv-legend-dot pv-legend-dot--Booked" />
            <span>Booked (Green)</span>
          </div>
          <div className="pv-legend-item">
            <span className="pv-legend-dot pv-legend-dot--Sold" />
            <span>Sold (Red)</span>
          </div>
          <div className="pv-legend-item">
            <span className="pv-legend-dot pv-legend-dot--Blocked" />
            <span>Blocked (Orange)</span>
          </div>
        </div>

        <div>
          <span>Database Inventory: <strong>{displayPlots.length} Plots</strong></span>
        </div>
      </div>
    </div>
  )
}
