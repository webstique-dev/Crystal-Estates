'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Map,
  Plus,
  Trash2,
  Edit2,
  X,
  Layers,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import Navbar from '../../components/sections/Navbar'
import Footer from '../../components/sections/Footer'
import PlotViewer from '../../components/plot-viewer/PlotViewer'
import { KOLAPAKKAM_METADATA } from '../../data/kolapakkamPlots'
import { computePathCentroid } from '@/lib/svgPathCentroid'
import './layout-viewer.css'

export default function LayoutViewerPage() {
  const [activeTab, setActiveTab] = useState('map') // 'map' | 'manage'
  const [plots, setPlots] = useState([])
  const [metadata, setMetadata] = useState(KOLAPAKKAM_METADATA)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlot, setEditingPlot] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    plotNo: '',
    status: 'Available',
    facing: 'North',
    width: "40'0\"",
    length: "30'0\"",
    area: '1200 sq.ft',
    price: '₹ 42.00 Lakhs',
    svgPath: '',
    coordX: 685,
    coordY: 320,
    coordW: 75,
    coordH: 45,
    useCustomPath: false,
  })

  // Show Toast helper
  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  // Load plots from MongoDB API
  const reloadPlots = useCallback(() => {
    fetch('/api/plots/kolapakkam')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.plots) {
          setPlots(data.plots)
          if (data.metadata) setMetadata(data.metadata)
        }
      })
      .catch((err) => {
        console.warn('API error, using local data:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let isMounted = true
    fetch('/api/plots/kolapakkam')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.plots) {
          setPlots(data.plots)
          if (data.metadata) setMetadata(data.metadata)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.warn('API error, using local data:', err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Open Modal to Add
  const handleOpenAdd = () => {
    const nextPlotNo = String(plots.length + 1)
    setEditingPlot(null)
    setFormData({
      plotNo: nextPlotNo,
      status: 'Available',
      facing: 'North',
      width: "40'0\"",
      length: "30'0\"",
      area: '1200 sq.ft',
      price: '₹ 42.00 Lakhs',
      svgPath: '',
      coordX: 685,
      coordY: 320,
      coordW: 75,
      coordH: 45,
      useCustomPath: false,
    })
    setIsModalOpen(true)
  }

  // Open Modal to Edit
  const handleOpenEdit = (plot) => {
    setEditingPlot(plot)
    setFormData({
      plotNo: plot.plotNo,
      status: plot.status,
      facing: plot.facing,
      width: plot.width,
      length: plot.length,
      area: plot.area,
      price: plot.price || '',
      svgPath: plot.svgPath || '',
      coordX: 685,
      coordY: 320,
      coordW: 75,
      coordH: 45,
      useCustomPath: Boolean(plot.svgPath),
    })
    setIsModalOpen(true)
  }

  // Submit Add or Edit to MongoDB
  const handleSubmitForm = async (e) => {
    e.preventDefault()

    // Calculate path and text center
    let finalSvgPath = formData.svgPath
    let textX = 722
    let textY = 340

    if (!formData.useCustomPath || !finalSvgPath) {
      const x = Number(formData.coordX)
      const y = Number(formData.coordY)
      const w = Number(formData.coordW)
      const h = Number(formData.coordH)
      finalSvgPath = `M ${x},${y} L ${x + w},${y} L ${x + w},${y + h} L ${x},${y + h} Z`
      textX = Number((x + w / 2).toFixed(1))
      textY = Number((y + h / 2).toFixed(1))
    } else {
      // Calculate exact mathematical centroid for custom SVG path
      const centroid = computePathCentroid(finalSvgPath)
      if (centroid) {
        textX = centroid.textX
        textY = centroid.textY
      }
    }

    const payload = {
      plotNo: String(formData.plotNo),
      status: formData.status,
      facing: formData.facing,
      width: formData.width,
      length: formData.length,
      area: formData.area,
      price: formData.price,
      svgPath: finalSvgPath,
      textX,
      textY,
    }

    try {
      if (editingPlot) {
        // PATCH
        const res = await fetch('/api/plots/kolapakkam', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          showToast(`Plot ${formData.plotNo} updated successfully!`)
          reloadPlots()
          setIsModalOpen(false)
        }
      } else {
        // POST (Create)
        const res = await fetch('/api/plots/kolapakkam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          showToast(`Plot ${formData.plotNo} created and saved to Database!`)
          reloadPlots()
          setIsModalOpen(false)
        }
      }
    } catch (err) {
      showToast(`Error: ${err.message}`)
    }
  }

  // Quick Inline Status Update
  const handleQuickStatusChange = async (plot, newStatus) => {
    // Optimistic local update
    setPlots((prev) =>
      prev.map((p) => (p.plotNo === plot.plotNo ? { ...p, status: newStatus } : p))
    )

    try {
      const res = await fetch('/api/plots/kolapakkam', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plotNo: plot.plotNo, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Plot ${plot.plotNo} status set to ${newStatus}`)
      }
    } catch (err) {
      showToast(`Update failed: ${err.message}`)
      reloadPlots()
    }
  }

  // Delete Plot from Database
  const handleDeletePlot = async (plot) => {
    if (!window.confirm(`Are you sure you want to delete Plot ${plot.plotNo}?`)) return

    try {
      const res = await fetch(`/api/plots/kolapakkam?plotNo=${plot.plotNo}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Plot ${plot.plotNo} deleted from Database`)
        reloadPlots()
      }
    } catch (err) {
      showToast(`Delete failed: ${err.message}`)
    }
  }

  // Compute stats
  const totalCount = plots.length
  const availCount = plots.filter((p) => p.status === 'Available').length
  const bookedCount = plots.filter((p) => p.status === 'Booked').length
  const soldCount = plots.filter((p) => p.status === 'Sold' || p.status === 'Registered').length
  const blockedCount = plots.filter((p) => p.status === 'Blocked').length

  return (
    <>
      <Navbar />
      <main className="lv-page">
        <div className="lv-container">
          {/* ── Top Navigation Bar ── */}
          <nav className="lv-nav" aria-label="Breadcrumb navigation">
            <Link href="/" className="lv-back-btn">
              <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="lv-location-badge">
              <MapPin size={15} color="var(--green-900, #0a5c36)" />
              <span>
                {metadata.village}, {metadata.taluk} Taluk, Chennai
              </span>
            </div>
          </nav>

          {/* ── Page Header (Template Aesthetic) ── */}
          <header className="lv-header">
            <div className="lv-header__eyebrow">
              <Sparkles size={13} /> Live Interactive Master Plan & Management
            </div>
            <h1 className="lv-header__title">{metadata.title}</h1>
            <p className="lv-header__desc">
              Explore real-time plot boundaries, live availability, facing, and dimensions.
              Manage inventory or add new plots directly to the live database.
            </p>
          </header>

          {/* ── Navigation Toolbar & Action Buttons ── */}
          <div className="lv-toolbar">
            {/* View Mode Tabs */}
            <div className="lv-tabs" role="tablist">
              <button
                type="button"
                className={`lv-tab-btn ${activeTab === 'map' ? 'lv-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('map')}
                role="tab"
                aria-selected={activeTab === 'map'}
              >
                <Map size={16} />
                Interactive Map
                <span className="lv-tab-count">{totalCount}</span>
              </button>

              <button
                type="button"
                className={`lv-tab-btn ${activeTab === 'manage' ? 'lv-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('manage')}
                role="tab"
                aria-selected={activeTab === 'manage'}
              >
                <Layers size={16} />
                Manage Inventory
                <span className="lv-tab-count">{totalCount}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="lv-actions">
              <button
                type="button"
                className="lv-add-btn"
                onClick={handleOpenAdd}
                aria-label="Add New Plot"
              >
                <Plus size={16} />
                Add New Plot
              </button>

              <button
                type="button"
                onClick={reloadPlots}
                className="lv-action-btn"
                title="Refresh from Database"
                aria-label="Refresh data"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* ── Tab Content 1: Interactive Map View ── */}
          {activeTab === 'map' && (
            <div style={{ width: '100%' }}>
              <PlotViewer
                initialPlots={plots}
                backgroundUrl={metadata.layoutBackgroundUrl}
                viewBox={metadata.viewBox}
                metadata={metadata}
                whatsappNumber="919444280722"
              />
            </div>
          )}

          {/* ── Tab Content 2: Manage Plots Inventory & Database ── */}
          {activeTab === 'manage' && (
            <div>
              {/* Stats Overview */}
              <div className="lv-stats-grid">
                <div className="lv-stat-card">
                  <span className="lv-stat-label">Total Plots</span>
                  <span className="lv-stat-val">{totalCount}</span>
                </div>
                <div className="lv-stat-card" style={{ borderLeft: '4px solid #38bdf8' }}>
                  <span className="lv-stat-label" style={{ color: '#0284c7' }}>Available</span>
                  <span className="lv-stat-val" style={{ color: '#0284c7' }}>{availCount}</span>
                </div>
                <div className="lv-stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
                  <span className="lv-stat-label" style={{ color: '#16a34a' }}>Booked</span>
                  <span className="lv-stat-val" style={{ color: '#16a34a' }}>{bookedCount}</span>
                </div>
                <div className="lv-stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <span className="lv-stat-label" style={{ color: '#dc2626' }}>Sold / Reg.</span>
                  <span className="lv-stat-val" style={{ color: '#dc2626' }}>{soldCount}</span>
                </div>
                <div className="lv-stat-card" style={{ borderLeft: '4px solid #f97316' }}>
                  <span className="lv-stat-label" style={{ color: '#ea580c' }}>Blocked</span>
                  <span className="lv-stat-val" style={{ color: '#ea580c' }}>{blockedCount}</span>
                </div>
              </div>

              {/* Plot Inventory Table Card */}
              <div className="lv-mgmt-card">
                <div className="lv-mgmt-header">
                  <div>
                    <h3 className="lv-mgmt-title">Plot Inventory Management</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--muted, #4e6355)' }}>
                      Live synchronization with MongoDB database cluster
                    </p>
                  </div>
                  <button
                    type="button"
                    className="lv-add-btn"
                    onClick={handleOpenAdd}
                    style={{ fontSize: '0.8rem', padding: '7px 14px' }}
                  >
                    <Plus size={14} /> Add Plot
                  </button>
                </div>

                <div className="lv-table-wrap">
                  <table className="lv-table">
                    <thead>
                      <tr>
                        <th>Plot No</th>
                        <th>Status (Live Edit)</th>
                        <th>Facing</th>
                        <th>Dimensions</th>
                        <th>Area</th>
                        <th>Estimated Price</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plots.map((plot) => (
                        <tr key={plot.id || plot.plotNo}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className="lv-plot-badge">{plot.plotNo}</span>
                              <span style={{ fontWeight: 700, color: 'var(--ink, #111e16)' }}>Plot {plot.plotNo}</span>
                            </div>
                          </td>
                          <td>
                            <select
                              className={`lv-status-select lv-status-select--${plot.status}`}
                              value={plot.status}
                              onChange={(e) => handleQuickStatusChange(plot, e.target.value)}
                              aria-label={`Change status for plot ${plot.plotNo}`}
                            >
                              <option value="Available">Available (Sky Blue)</option>
                              <option value="Booked">Booked (Green)</option>
                              <option value="Sold">Sold (Red)</option>
                              <option value="Blocked">Blocked (Orange)</option>
                            </select>
                          </td>
                          <td>{plot.facing}</td>
                          <td>{plot.width} × {plot.length}</td>
                          <td style={{ fontWeight: 700, color: 'var(--ink, #111e16)' }}>{plot.area}</td>
                          <td style={{ color: 'var(--green-900, #0a5c36)', fontWeight: 700 }}>{plot.price || '—'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                type="button"
                                className="lv-action-btn"
                                onClick={() => handleOpenEdit(plot)}
                                title="Edit plot specifications"
                                aria-label={`Edit plot ${plot.plotNo}`}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                className="lv-action-btn lv-action-btn--delete"
                                onClick={() => handleDeletePlot(plot)}
                                title="Delete plot from database"
                                aria-label={`Delete plot ${plot.plotNo}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Create / Edit Plot Modal ── */}
          {isModalOpen && (
            <div
              className="lv-modal-backdrop"
              onClick={() => setIsModalOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="lv-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="lv-modal__header">
                  <h3 className="lv-modal__title">
                    {editingPlot ? `Edit Plot ${editingPlot.plotNo}` : 'Add New Plot to Database'}
                  </h3>
                  <button
                    type="button"
                    className="lv-modal__close"
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Close form"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm}>
                  <div className="lv-grid-2">
                    <div className="lv-form-group">
                      <label className="lv-form-label">Plot Number *</label>
                      <input
                        type="text"
                        className="lv-input"
                        required
                        value={formData.plotNo}
                        onChange={(e) => setFormData({ ...formData, plotNo: e.target.value })}
                        placeholder="e.g. 13"
                      />
                    </div>

                    <div className="lv-form-group">
                      <label className="lv-form-label">Status *</label>
                      <select
                        className="lv-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Available">Available (Sky Blue)</option>
                        <option value="Booked">Booked (Green)</option>
                        <option value="Sold">Sold (Red)</option>
                        <option value="Blocked">Blocked (Orange)</option>
                      </select>
                    </div>
                  </div>

                  <div className="lv-grid-2">
                    <div className="lv-form-group">
                      <label className="lv-form-label">Facing Direction</label>
                      <select
                        className="lv-select"
                        value={formData.facing}
                        onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                      >
                        <option value="East">East</option>
                        <option value="North">North</option>
                        <option value="West">West</option>
                        <option value="South">South</option>
                        <option value="North-East">North-East</option>
                        <option value="North-West">North-West</option>
                        <option value="South-East">South-East</option>
                        <option value="South-West">South-West</option>
                      </select>
                    </div>

                    <div className="lv-form-group">
                      <label className="lv-form-label">Dimensions (W × L)</label>
                      <input
                        type="text"
                        className="lv-input"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        placeholder="e.g. 40'0&quot;"
                      />
                    </div>
                  </div>

                  <div className="lv-grid-2">
                    <div className="lv-form-group">
                      <label className="lv-form-label">Total Extent / Area</label>
                      <input
                        type="text"
                        className="lv-input"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="e.g. 1200 sq.ft"
                      />
                    </div>

                    <div className="lv-form-group">
                      <label className="lv-form-label">Estimated Price</label>
                      <input
                        type="text"
                        className="lv-input"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g. ₹ 42.00 Lakhs"
                      />
                    </div>
                  </div>

                  {/* SVG Vector Coordinates */}
                  <div style={{ marginTop: 10, padding: 14, background: 'var(--green-50, #eef6f1)', borderRadius: 14, border: '1px solid var(--line, #e3ece6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900, #0a5c36)' }}>
                        Plot Map Coordinates
                      </span>
                      <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink, #111e16)', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={formData.useCustomPath}
                          onChange={(e) => setFormData({ ...formData, useCustomPath: e.target.checked })}
                        />
                        Custom SVG &quot;d&quot; Path
                      </label>
                    </div>

                    {formData.useCustomPath ? (
                      <div className="lv-form-group" style={{ marginBottom: 0 }}>
                        <label className="lv-form-label">SVG Path &quot;d&quot; Attribute</label>
                        <textarea
                          className="lv-textarea"
                          rows={2}
                          value={formData.svgPath}
                          onChange={(e) => setFormData({ ...formData, svgPath: e.target.value })}
                          placeholder="e.g. m 307.81 374.20 h 64.51 v 48.37 l -42.17 19.33 z"
                        />
                        {(() => {
                          const c = computePathCentroid(formData.svgPath)
                          if (!c) return null
                          return (
                            <div style={{ marginTop: 6, fontSize: '0.74rem', color: '#0a5c36', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                              <CheckCircle2 size={13} />
                              <span>Auto-detected badge center: X: {c.textX}, Y: {c.textY}</span>
                            </div>
                          )
                        })()}
                      </div>
                    ) : (
                      <div className="lv-grid-2">
                        <div className="lv-form-group" style={{ marginBottom: 0 }}>
                          <label className="lv-form-label">X Position: {formData.coordX}px</label>
                          <input
                            type="range"
                            min="100"
                            max="950"
                            value={formData.coordX}
                            onChange={(e) => setFormData({ ...formData, coordX: Number(e.target.value) })}
                            style={{ width: '100%', accentColor: 'var(--green-900, #0a5c36)' }}
                          />
                        </div>
                        <div className="lv-form-group" style={{ marginBottom: 0 }}>
                          <label className="lv-form-label">Y Position: {formData.coordY}px</label>
                          <input
                            type="range"
                            min="100"
                            max="700"
                            value={formData.coordY}
                            onChange={(e) => setFormData({ ...formData, coordY: Number(e.target.value) })}
                            style={{ width: '100%', accentColor: 'var(--green-900, #0a5c36)' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lv-form-actions">
                    <button type="button" className="lv-cancel-btn" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="lv-submit-btn">
                      <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6 }} />
                      {editingPlot ? 'Save Changes' : 'Create & Save to Database'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Floating Toast Feedback */}
          {toast && (
            <div className="lv-toast" role="status" aria-live="polite">
              {toast}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
