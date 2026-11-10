import React, { useState, useEffect } from 'react'
import { X, Check, MapPin, Compass, Layers, AlertCircle, Eye } from 'lucide-react'
import { computePathCentroid } from '../../lib/svgPathCentroid'

const PLOT_STATUS_OPTIONS = [
  { value: 'Available', label: 'Available', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'Booked', label: 'Booked', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'Sold', label: 'Sold', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { value: 'Blocked', label: 'Blocked', color: 'text-slate-700 bg-slate-100 border-slate-200' },
]

const FACING_OPTIONS = [
  'East',
  'North',
  'South',
  'West',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
]

const PLOT_TYPES = [
  'Residential Plot',
  'Corner Plot',
  'Commercial Plot',
  'Villa Plot',
  'Farmland Parcel',
]

/**
 * Clean path input string if user pasted a full <path ... /> element
 */
function cleanSvgPathInput(raw) {
  if (!raw) return ''
  const trimmed = raw.trim()
  const dMatch = trimmed.match(/d=["']([^"']+)["']/i)
  if (dMatch && dMatch[1]) {
    return dMatch[1].trim()
  }
  return trimmed
}

export default function AddPlotModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  existingPlots = [],
}) {
  const [plotNo, setPlotNo] = useState('')
  const [status, setStatus] = useState('Available')
  const [facing, setFacing] = useState('East')
  const [area, setArea] = useState('1200 sq.ft')
  const [width, setWidth] = useState("30'0\"")
  const [length, setLength] = useState("40'0\"")
  const [dimensions, setDimensions] = useState("30'0\" x 40'0\"")
  const [price, setPrice] = useState('₹ 42.00 Lakhs')
  const [roadWidth, setRoadWidth] = useState('30 ft Road')
  const [type, setType] = useState('Residential Plot')
  const [surveyNo, setSurveyNo] = useState('')
  const [svgPath, setSvgPath] = useState('')
  const [error, setError] = useState(null)

  // Populate data when editing an existing plot
  useEffect(() => {
    if (initialData) {
      setPlotNo(initialData.plotNo || '')
      setStatus(initialData.status || 'Available')
      setFacing(initialData.facing || 'East')
      setArea(initialData.area || '1200 sq.ft')
      setWidth(initialData.width || "30'0\"")
      setLength(initialData.length || "40'0\"")
      setDimensions(
        initialData.dimensions ||
          `${initialData.width || "30'0\""} x ${initialData.length || "40'0\""}`
      )
      setPrice(initialData.price || '')
      setRoadWidth(initialData.roadWidth || '30 ft Road')
      setType(initialData.type || 'Residential Plot')
      setSurveyNo(initialData.surveyNo || '')
      setSvgPath(initialData.svgPath || '')
      setError(null)
    } else {
      // Auto-suggest next plot number
      const nextNum = existingPlots.length > 0 ? existingPlots.length + 1 : 1
      setPlotNo(String(nextNum))
      setStatus('Available')
      setFacing('East')
      setArea('1200 sq.ft')
      setWidth("30'0\"")
      setLength("40'0\"")
      setDimensions("30'0\" x 40'0\"")
      setPrice('₹ 42.00 Lakhs')
      setRoadWidth('30 ft Road')
      setType('Residential Plot')
      setSurveyNo('')
      setSvgPath('')
      setError(null)
    }
  }, [initialData, existingPlots, isOpen])

  if (!isOpen) return null

  // Preview centroid and bounding box
  const cleanedPath = cleanSvgPathInput(svgPath)
  const centroid = computePathCentroid(cleanedPath)

  const handleSvgPathChange = (e) => {
    const rawVal = e.target.value
    const cleaned = cleanSvgPathInput(rawVal)
    setSvgPath(cleaned)
  }

  const handleDimensionsChange = (newWidth, newLength) => {
    setWidth(newWidth)
    setLength(newLength)
    setDimensions(`${newWidth} x ${newLength}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!plotNo.trim()) {
      setError('Plot number is required.')
      return
    }

    if (!cleanedPath) {
      setError('SVG Path data is required for the plot layout boundary.')
      return
    }

    // Check duplicate plot number if adding new plot
    const isEditing = Boolean(initialData)
    if (!isEditing && existingPlots.some((p) => String(p.plotNo).toLowerCase() === plotNo.trim().toLowerCase())) {
      setError(`Plot number "${plotNo.trim()}" already exists. Please choose a unique plot number.`)
      return
    }

    const numId = parseInt(plotNo.trim(), 10)

    const plotData = {
      id: initialData?.id || (!isNaN(numId) ? numId : Date.now()),
      plotNo: plotNo.trim(),
      status,
      facing,
      area: area.trim() || '1200 sq.ft',
      dimensions: dimensions.trim() || `${width} x ${length}`,
      width: width.trim() || "30'0\"",
      length: length.trim() || "40'0\"",
      price: price.trim(),
      roadWidth: roadWidth.trim() || '30 ft Road',
      type: type || 'Residential Plot',
      surveyNo: surveyNo.trim(),
      svgPath: cleanedPath,
      textX: centroid ? centroid.textX : 100,
      textY: centroid ? centroid.textY : 100,
      updatedAt: new Date(),
    }

    onSave(plotData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {initialData ? `Edit Plot ${initialData.plotNo}` : 'Add New Plot to Layout'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Define plot dimensions, boundaries, status and interactive SVG path data.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Plot Number & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Plot Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={plotNo}
                onChange={(e) => {
                  setPlotNo(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="e.g. 1, 12B, A-102"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Plot Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer"
              >
                {PLOT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Facing & Area */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Facing Direction</span>
              </label>
              <select
                value={facing}
                onChange={(e) => setFacing(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer"
              >
                {FACING_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f} Facing
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Plot Area / Extent
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 1200 sq.ft or 2.5 Cents"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white"
              />
            </div>
          </div>

          {/* Row 3: Dimensions & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Dimensions (Width × Length)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={width}
                  onChange={(e) => handleDimensionsChange(e.target.value, length)}
                  placeholder="Width (e.g. 30'0&quot;)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white"
                />
                <input
                  type="text"
                  value={length}
                  onChange={(e) => handleDimensionsChange(width, e.target.value)}
                  placeholder="Length (e.g. 40'0&quot;)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Price (Total or per sq.ft)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. ₹ 42.00 Lakhs"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white"
              />
            </div>
          </div>

          {/* Row 4: Road Width & Category/Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Road Frontage / Width
              </label>
              <input
                type="text"
                value={roadWidth}
                onChange={(e) => setRoadWidth(e.target.value)}
                placeholder="e.g. 30 ft Road, 40 ft Main Road"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Plot Category / Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer"
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                SVG Path Boundary (<code className="font-mono text-blue-700 font-semibold">d="..."</code>) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Paste path &apos;d&apos; attribute or complete &lt;path&gt; tag
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={svgPath}
              onChange={handleSvgPathChange}
              placeholder='e.g. M 100 200 L 150 200 L 150 260 L 100 260 Z OR <path d="M 100 200..." />'
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white resize-y"
            />
          </div>

          {/* Live Mini Preview of Path */}
          {cleanedPath && centroid && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
              <div className="w-24 h-24 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1 overflow-hidden shrink-0">
                <svg
                  viewBox={`${centroid.minX - 10} ${centroid.minY - 10} ${Math.max(centroid.maxX - centroid.minX + 20, 40)} ${Math.max(centroid.maxY - centroid.minY + 20, 40)}`}
                  className="w-full h-full"
                >
                  <path
                    d={cleanedPath}
                    fill="#DCFCE7"
                    stroke="#15803D"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={centroid.textX}
                    cy={centroid.textY}
                    r="9"
                    fill="#15803D"
                  />
                  <text
                    x={centroid.textX}
                    y={centroid.textY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {plotNo || 'P'}
                  </text>
                </svg>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Path Detected & Centered</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Calculated Centroid: ({centroid.textX}, {centroid.textY})
                </p>
                <p className="text-[11px] text-slate-500">
                  Bounding Box: {Math.round(centroid.maxX - centroid.minX)} × {Math.round(centroid.maxY - centroid.minY)} px
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-[0.98]"
            >
              {initialData ? 'Update Plot' : 'Save Plot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

