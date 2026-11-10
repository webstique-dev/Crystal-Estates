import React, { useState } from 'react'
import { MapPin, Trash2, Edit2, FileCode2, ImageOff, Video, FileText, Layers } from 'lucide-react'

// Status badge styling for properties
const STATUS_STYLES = {
  'Available': { dot: 'bg-emerald-500', text: 'text-emerald-800' },
  'Booking Open': { dot: 'bg-emerald-500', text: 'text-emerald-800' },
  'Registration Ready': { dot: 'bg-blue-500', text: 'text-blue-800' },
  'Ready to Construct': { dot: 'bg-teal-500', text: 'text-teal-800' },
  'Phase 1 Handover': { dot: 'bg-indigo-500', text: 'text-indigo-800' },
  'Pre-launch Phase 1': { dot: 'bg-purple-500', text: 'text-purple-800' },
  'Few Plots Left': { dot: 'bg-amber-500', text: 'text-amber-800' },
  'Reserved': { dot: 'bg-amber-500', text: 'text-amber-800' },
  'Booked': { dot: 'bg-amber-500', text: 'text-amber-800' },
  'Sold': { dot: 'bg-slate-500', text: 'text-slate-800' },
}

export default function PropertyCard({ property, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false)

  // Status badge config
  const statusKey = property.badge || property.status || 'Available'
  const statusCfg = STATUS_STYLES[statusKey] || {
    dot: 'bg-blue-500',
    text: 'text-slate-800',
  }

  // Real inventory numbers (only if present in database)
  const hasInventory =
    typeof property.available === 'number' ||
    typeof property.booked === 'number' ||
    typeof property.sold === 'number'

  const available = property.available || 0
  const booked = property.booked || 0
  const sold = property.sold || 0
  const total = available + booked + sold
  const availPct = total > 0 ? Math.round((available / total) * 100) : 0
  const bookedPct = total > 0 ? Math.round((booked / total) * 100) : 0
  const soldPct = total > 0 ? Math.max(0, 100 - availPct - bookedPct) : 0

  const hasLayout = Boolean(property.layoutBackgroundUrl || property.hasLayoutMap || property.layoutUrl)
  const isSvgLayout = Boolean(
    (property.layoutBackgroundUrl && property.layoutBackgroundUrl.endsWith('.svg')) ||
    property.layoutSlug
  )
  const fallbackSlug = property.name ? property.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : (property.id || '')
  const targetLayoutLink = isSvgLayout
    ? `http://localhost:3000/layout-viewer?slug=${property.layoutSlug || fallbackSlug}`
    : property.layoutBackgroundUrl || property.layoutUrl

  const hasDocs = Boolean(property.documents && property.documents.length > 0)
  const hasVideos = Boolean(property.videos && property.videos.length > 0)

  const imgSrc =
    property.image ||
    (Array.isArray(property.images) && property.images[0]) ||
    (Array.isArray(property.gallery) && property.gallery[0])

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* ── 1. Top Photo Banner ── */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden flex items-end justify-center">
        {!imgError && imgSrc ? (
          <img
            src={imgSrc}
            alt={property.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 gap-2 p-4 text-center">
            <ImageOff className="w-8 h-8 opacity-40" />
            <span className="text-xs font-semibold text-slate-400">{property.name}</span>
          </div>
        )}

        {/* Subtle Gradient Overlays for High Contrast & Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Status Pill on Top Left */}
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-bold shadow-md border border-white/60">
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot} animate-pulse`} />
            {statusKey}
          </span>
          {property.projectId && (
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold">
              {property.projectId}
            </span>
          )}
        </div>

        {/* Media Badges & Interactive Layout on Top Right */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
          {hasLayout && (
            <a
              href={targetLayoutLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0B57D0]/90 hover:bg-[#0B57D0] text-white text-[10px] font-bold shadow-md backdrop-blur-md transition"
              title="Open Layout Blueprint"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Map</span>
            </a>
          )}
          {hasVideos && (
            <span className="p-1 rounded-full bg-black/60 text-white backdrop-blur-md text-[10px]" title="Drone Video Available">
              <Video className="w-3 h-3" />
            </span>
          )}
          {hasDocs && (
            <span className="p-1 rounded-full bg-black/60 text-white backdrop-blur-md text-[10px]" title="Property Documents Attached">
              <FileText className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Category Pill on Bottom Left of Image */}
        <div className="absolute bottom-3 left-3.5 z-10">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide">
            {property.propertyType || property.type || 'Residential'}
          </span>
        </div>

        {/* Action buttons on bottom right of banner */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition duration-200">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(property)}
              className="py-1 px-2.5 rounded-lg bg-white/95 text-[#0B57D0] hover:bg-white text-xs shadow-md font-bold flex items-center gap-1 transition"
              title="Edit Property"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(property.id, property.name)}
              className="p-1.5 rounded-lg bg-white/95 text-rose-600 hover:bg-white hover:text-rose-700 text-xs shadow-md transition"
              title="Delete Property"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Card Content Body ── */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Property Name */}
          <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight line-clamp-1 group-hover:text-[#0B57D0] transition-colors">
            {property.name}
          </h3>

          {/* Location with Pin Icon */}
          {property.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span className="truncate">{property.location}</span>
            </div>
          )}

          {/* Configuration / Area / Survey Number */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 mt-2">
            <span className="truncate">
              {property.totalLandArea || property.configuration || ''}
            </span>
            {property.surveyNumber && (
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                {property.surveyNumber}
              </span>
            )}
          </div>

          {/* Price */}
          {property.priceFormatted && (
            <p className="text-base font-extrabold text-slate-900 mt-1">
              {property.priceFormatted}
            </p>
          )}

          {/* ── 3. Inventory Bar (Only if real inventory data exists) ── */}
          {hasInventory && total > 0 && (
            <div className="mt-3.5">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                {availPct > 0 && (
                  <div
                    style={{ width: `${availPct}%` }}
                    className="bg-[#10B981] h-full transition-all duration-500"
                    title={`${available} available`}
                  />
                )}
                {bookedPct > 0 && (
                  <div
                    style={{ width: `${bookedPct}%` }}
                    className="bg-[#F59E0B] h-full transition-all duration-500"
                    title={`${booked} booked`}
                  />
                )}
                {soldPct > 0 && (
                  <div
                    style={{ width: `${soldPct}%` }}
                    className="bg-[#94A3B8] h-full transition-all duration-500"
                    title={`${sold} sold`}
                  />
                )}
              </div>

              {/* Inventory Legend Numbers */}
              <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-2 font-medium">
                {available > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[2px] bg-[#10B981]" />
                    {available} available
                  </span>
                )}
                {booked > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[2px] bg-[#F59E0B]" />
                    {booked} booked
                  </span>
                )}
                {sold > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[2px] bg-[#94A3B8]" />
                    {sold} sold
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 4. Card Footer (Approval/RERA ID & Leads Count) ── */}
        <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span
            className="font-mono text-[10px] truncate max-w-[180px] text-slate-600 font-semibold"
            title={property.approvalStatus || property.rera || property.approval}
          >
            {property.approvalStatus || property.rera || property.approval || ''}
          </span>

          <div className="flex items-center gap-2.5 shrink-0">
            {(hasLayout || (property.plots && property.plots.length > 0)) && (
              <button
                type="button"
                onClick={() => onEdit && onEdit(property)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B57D0] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition"
                title="Manage Plot Details & Path Data"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {property.plots && property.plots.length > 0
                    ? `${property.plots.length} Plots`
                    : '+ Add Plot'}
                </span>
              </button>
            )}

            {hasLayout && (
              <a
                href={targetLayoutLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B57D0] hover:underline"
                title="Open Layout Plan"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Layout</span>
              </a>
            )}

            {property.leadsCount != null && property.leadsCount > 0 && (
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                {property.leadsCount} leads
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
