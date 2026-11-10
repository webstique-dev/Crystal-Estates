import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, Compass, Layers, CheckCircle2, AlertCircle, FileCode } from 'lucide-react'
import AddPlotModal from './AddPlotModal'

const STATUS_BADGES = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Booked: 'bg-amber-50 text-amber-700 border-amber-200',
  Sold: 'bg-rose-50 text-rose-700 border-rose-200',
  Blocked: 'bg-slate-100 text-slate-700 border-slate-200',
}

export default function PlotManagementSection({
  plots = [],
  onChange,
  layoutUrl = null,
  projectName = '',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlot, setEditingPlot] = useState(null)
  const [filter, setFilter] = useState('All')

  // Status counts
  const counts = {
    All: plots.length,
    Available: plots.filter((p) => p.status === 'Available').length,
    Booked: plots.filter((p) => p.status === 'Booked').length,
    Sold: plots.filter((p) => p.status === 'Sold').length,
    Blocked: plots.filter((p) => p.status === 'Blocked').length,
  }

  const handleOpenAdd = () => {
    setEditingPlot(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (plot) => {
    setEditingPlot(plot)
    setIsModalOpen(true)
  }

  const handleDelete = (plotNo) => {
    if (window.confirm(`Are you sure you want to delete Plot ${plotNo}?`)) {
      const updated = plots.filter((p) => String(p.plotNo) !== String(plotNo))
      onChange(updated)
    }
  }

  const handleSavePlot = (plotData) => {
    const existingIndex = plots.findIndex(
      (p) => String(p.plotNo).toLowerCase() === String(plotData.plotNo).toLowerCase()
    )

    let updated
    if (existingIndex >= 0) {
      // Update existing
      updated = [...plots]
      updated[existingIndex] = { ...updated[existingIndex], ...plotData }
    } else {
      // Add new
      updated = [...plots, plotData]
    }
    onChange(updated)
  }

  // Filtered plots
  const filteredPlots =
    filter === 'All' ? plots : plots.filter((p) => p.status === filter)

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      {/* ── Section Header & Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0B57D0]" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Layout Plots & Path Data ({plots.length})
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Manage demarcated plot boundaries, pricing, facing directions, and interactive SVG paths.
          </p>
        </div>

        {/* Action Button: Add Plot */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-[#0B57D0] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.98] shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Plot</span>
        </button>
      </div>

      {/* ── Stats & Filter Bar ── */}
      {plots.length > 0 && (
        <div className="flex items-center justify-between gap-2 flex-wrap bg-white p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'Available', 'Booked', 'Sold', 'Blocked'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filter === st
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st} <span className="opacity-75">({counts[st] || 0})</span>
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Saved automatically with property
          </span>
        </div>
      )}

      {/* ── Plots List / Table ── */}
      {plots.length === 0 ? (
        <div className="p-8 bg-white border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B57D0] flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">No plots configured yet</h5>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
              Add individual demarcated plots with their SVG boundary path data, facing direction, area, and status.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B57D0] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Plot</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-5">
                <tr>
                  <th className="py-2.5 px-3.5">Plot #</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Facing</th>
                  <th className="py-2.5 px-3.5">Area & Size</th>
                  <th className="py-2.5 px-3.5">Price</th>
                  <th className="py-2.5 px-3.5">SVG Path Data</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlots.map((plot) => (
                  <tr key={plot.plotNo || plot.id} className="hover:bg-slate-50/60 transition">
                    {/* Plot # */}
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      Plot {plot.plotNo}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          STATUS_BADGES[plot.status] || STATUS_BADGES.Available
                        }`}
                      >
                        {plot.status || 'Available'}
                      </span>
                    </td>

                    {/* Facing */}
                    <td className="py-2.5 px-3.5 font-semibold text-slate-700">
                      {plot.facing || 'East'}
                    </td>

                    {/* Area & Size */}
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-slate-800">{plot.area}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {plot.dimensions || `${plot.width || ''} × ${plot.length || ''}`}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      {plot.price || 'TBD'}
                    </td>

                    {/* SVG Path snippet */}
                    <td className="py-2.5 px-3.5 max-w-[180px]">
                      <div
                        className="truncate font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md"
                        title={plot.svgPath}
                      >
                        {plot.svgPath || 'No path provided'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(plot)}
                          className="p-1.5 text-slate-500 hover:text-[#0B57D0] hover:bg-blue-50 rounded-lg transition"
                          title="Edit plot"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(plot.plotNo)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete plot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Plot Modal Popup ── */}
      <AddPlotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlot}
        initialData={editingPlot}
        existingPlots={plots}
      />
    </div>
  )
}

