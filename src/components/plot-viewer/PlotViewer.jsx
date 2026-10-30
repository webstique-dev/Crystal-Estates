'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Info
} from 'lucide-react'
import { WhatsAppIcon } from '../ui'
import { KOLAPAKKAM_METADATA } from '../../data/kolapakkamPlots'
import { computePathCentroid } from '@/lib/svgPathCentroid'
import './PlotViewer.css'

/**
 * React Interactive Plot Viewer Component
 * Displays a real estate layout map with dynamic plots loaded from API/Database,
 * pan & zoom, hover tooltips, status filters, and pre-filled WhatsApp inquiry.
 * All plot boundaries are loaded dynamically from the database.
 */
export default function PlotViewer({
  initialPlots = null,
  fetchUrl = '/api/plots/kolapakkam',
  backgroundUrl = KOLAPAKKAM_METADATA.layoutBackgroundUrl,
  viewBox = KOLAPAKKAM_METADATA.viewBox,
  metadata = KOLAPAKKAM_METADATA,
  whatsappNumber = '919444280722',
  className = '',
  onPlotSelect = null,
}) {
  // Data state loaded purely from API or passed props
  const [plots, setPlots] = useState(initialPlots || [])
  const [loading, setLoading] = useState(Boolean(!initialPlots && fetchUrl))
  const [error, setError] = useState(null)

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

  // Hover Tooltip state
  const [hoveredPlot, setHoveredPlot] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Selected Plot Modal state
  const [selectedPlot, setSelectedPlot] = useState(null)

  // Touch pinch zoom state
  const touchDistRef = useRef(null)

  // 1. Dynamic Data Fetching from Database API
  useEffect(() => {
    if (!fetchUrl) return
    let isMounted = true

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (isMounted) {
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
  }, [fetchUrl])

  // Active display plots (props override or fetched state)
  const displayPlots = (initialPlots && initialPlots.length > 0) ? initialPlots : plots

  // Center & Fit Layout automatically when container mounts
  const handleResetZoom = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    const [, , vbW, vbH] = viewBox.split(' ').map(Number)

    const scaleX = (containerWidth - 40) / vbW
    const scaleY = (containerHeight - 40) / vbH
    const initialScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.7), 1.3)

    const initialPanX = (containerWidth - vbW * initialScale) / 2
    const initialPanY = (containerHeight - vbH * initialScale) / 2

    setScale(initialScale)
    setPan({ x: initialPanX, y: initialPanY })
  }, [viewBox])

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

  // Mouse Wheel Zoom centered on cursor
  const handleWheel = (e) => {
    e.preventDefault()
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.6), 4.0)

    const newPanX = cursorX - ((cursorX - pan.x) / scale) * newScale
    const newPanY = cursorY - ((cursorY - pan.y) / scale) * newScale

    setScale(newScale)
    setPan({ x: newPanX, y: newPanY })
  }

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    panStartRef.current = { ...pan }
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

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
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
    const message = `Hello Crystal Estates, I am interested in ${metadata?.title || 'Crystal Garden\'s'} Plot No ${plot.plotNo} (${plot.area}, ${plot.facing} facing). Please share current pricing and schedule a site visit.`
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  return (
    <div
      ref={viewerRef}
      className={`plot-viewer ${isFullscreen ? 'plot-viewer--fullscreen' : ''} ${className}`}
    >
      {/* ── Top Header & Filter Bar (Template Styled) ── */}
      <div className="plot-viewer__header">
        <div className="plot-viewer__title-group">
          <h3 className="plot-viewer__title">
            {metadata.title}
            <span className="plot-viewer__badge">Interactive Plan</span>
          </h3>
          <p className="plot-viewer__subtitle">
            S.No: {metadata.sNo} • {metadata.village}, {metadata.taluk} Taluk
          </p>
        </div>

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
        onWheel={handleWheel}
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
          <div className="plot-viewer__map-layers">
            {/* 1. Background Layout Map Image */}
            <img
              src={backgroundUrl}
              alt="Real Estate Layout Map"
              className="plot-viewer__bg-image"
              draggable={false}
            />

            {/* 2. Interactive SVG Overlay Element (Dynamically fetched from DB) */}
            <svg
              viewBox={viewBox}
              className="plot-viewer__overlay-svg"
              aria-label="Interactive Plot Overlay"
            >
              {displayPlots.map((plot) => {
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
                    onMouseEnter={() => setHoveredPlot(plot)}
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

        {/* ── Instruction Pill ── */}
        <div className="plot-viewer__helper-pill">
          <Info size={14} />
          <span>Click & drag to pan • Scroll to zoom • Click plot for details</span>
        </div>

        {/* ── Hover Tooltip Card ── */}
        {hoveredPlot && !isDragging && (
          <div
            className="pv-tooltip"
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
              <span className="pv-tooltip__val">{hoveredPlot.width} × {hoveredPlot.length}</span>
              <span className="pv-tooltip__label">Area:</span>
              <span className="pv-tooltip__val">{hoveredPlot.area}</span>
            </div>
            <div className="pv-tooltip__hint">Click for full details & WhatsApp inquiry</div>
          </div>
        )}

        {/* ── Details Popup Card (Modal) ── */}
        {selectedPlot && (
          <div
            className="pv-modal-backdrop"
            onClick={() => setSelectedPlot(null)}
          >
            <div
              className="pv-modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-plot-title"
            >
              <button
                type="button"
                className="pv-modal-close-btn"
                onClick={() => setSelectedPlot(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>

              <div className="pv-modal__header">
                <h3 id="modal-plot-title" className="pv-modal__plot-title">
                  Plot No {selectedPlot.plotNo}
                </h3>
                <span className={`pv-modal__badge pv-modal__badge--${selectedPlot.status}`}>
                  {selectedPlot.status}
                </span>
              </div>
              <p className="pv-modal__project-sub">
                {metadata.title} • {metadata.village} Layout
              </p>

              {/* Specs Grid */}
              <div className="pv-modal__specs-grid">
                <div className="pv-spec-box pv-spec-box--full">
                  <div className="pv-spec-box__label">Total Extent / Area</div>
                  <div className="pv-spec-box__val">{selectedPlot.area}</div>
                </div>

                <div className="pv-spec-box">
                  <div className="pv-spec-box__label">Facing Direction</div>
                  <div className="pv-spec-box__val">{selectedPlot.facing}</div>
                </div>

                <div className="pv-spec-box">
                  <div className="pv-spec-box__label">Dimensions</div>
                  <div className="pv-spec-box__val">
                    {selectedPlot.width} × {selectedPlot.length}
                  </div>
                </div>

                {selectedPlot.price && (
                  <div className="pv-spec-box pv-spec-box--full">
                    <div className="pv-spec-box__label">Estimated Price / Guide Value</div>
                    <div className="pv-spec-box__val" style={{ color: 'var(--green-900, #0a5c36)' }}>
                      {selectedPlot.price}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pv-modal__actions">
                <a
                  href={getWhatsAppUrl(selectedPlot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pv-btn-whatsapp"
                >
                  <WhatsAppIcon size={20} />
                  Contact on WhatsApp
                </a>

                <button
                  type="button"
                  className="pv-btn-secondary"
                  onClick={() => setSelectedPlot(null)}
                >
                  Close Details
                </button>
              </div>
            </div>
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
