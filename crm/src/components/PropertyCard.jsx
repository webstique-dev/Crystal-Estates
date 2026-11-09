import React, { useState } from 'react'
import { MapPin, ExternalLink, Trash2, FileCode2, ImageOff } from 'lucide-react'

// Status badge styling for actual properties
const STATUS_STYLES = {
  'Booking Open': { dot: 'bg-emerald-500', text: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  'Registration Ready': { dot: 'bg-blue-500', text: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  'Ready to Construct': { dot: 'bg-teal-500', text: 'text-teal-800', bg: 'bg-teal-50 border-teal-200' },
  'Phase 1 Handover': { dot: 'bg-indigo-500', text: 'text-indigo-800', bg: 'bg-indigo-50 border-indigo-200' },
  'Pre-launch Phase 1': { dot: 'bg-purple-500', text: 'text-purple-800', bg: 'bg-purple-50 border-purple-200' },
  'Few Plots Left': { dot: 'bg-amber-500', text: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  'Available': { dot: 'bg-emerald-500', text: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  'Booked': { dot: 'bg-amber-500', text: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  'Sold': { dot: 'bg-slate-500', text: 'text-slate-800', bg: 'bg-slate-100 border-slate-300' },
}

export default function PropertyCard({ property, onDelete }) {
  const [imgError, setImgError] = useState(false)

  // Status badge config
  const statusKey = property.badge || property.status || 'Available'
  const statusCfg = STATUS_STYLES[statusKey] || {
    dot: 'bg-blue-500',
    text: 'text-slate-800',
    bg: 'bg-white/95 border-slate-200',
  }

  // Inventory numbers with actual defaults
  const available = property.available ?? 18
  const booked = property.booked ?? 8
  const sold = property.sold ?? 34
  const total = available + booked + sold || 100

  // Percentage segments for the progress bar
  const availPct = Math.round((available / total) * 100)
  const bookedPct = Math.round((booked / total) * 100)
  const soldPct = Math.max(0, 100 - availPct - bookedPct)

  const hasLayout = Boolean(property.layoutBackgroundUrl || property.hasLayoutMap)
  const layoutSlug =
    property.layoutSlug ||
    (property.name ? property.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'kolapakkam')

  // Resolve image source cleanly
  const imgSrc = property.image || '/images/hero-estate.jpg'

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* ── 1. Top Real Photo Banner ── */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden flex items-end justify-center">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={property.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 gap-2">
            <ImageOff className="w-8 h-8 opacity-40" />
            <span className="text-xs font-semibold">{property.name}</span>
          </div>
        )}

        {/* Subtle Gradient Overlays for High Contrast & Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Status Pill on Top Left */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-bold shadow-md border border-white/60">
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot} animate-pulse`} />
            {statusKey}
          </span>
        </div>

        {/* Layout Badge on Top Right if has layout map */}
        {hasLayout && (
          <div className="absolute top-3.5 right-3.5 z-10">
            <a
              href={`http://localhost:3000/layout-viewer?layout=${layoutSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B57D0]/90 hover:bg-[#0B57D0] text-white text-[10px] font-bold shadow-md backdrop-blur-md transition"
              title="Open Interactive Layout Blueprint"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </a>
          </div>
        )}

        {/* Category Pill on Bottom Left of Image */}
        <div className="absolute bottom-3 left-3.5 z-10">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide">
            {property.type || 'Plotted Land'}
          </span>
        </div>

        {/* Delete action button on hover */}
        {onDelete && (
          <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition duration-200">
            <button
              type="button"
              onClick={() => onDelete(property.id, property.name)}
              className="p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-white hover:text-rose-700 text-xs shadow-md"
              title="Delete Property"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── 2. Card Content Body ── */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Property Name */}
          <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight line-clamp-1 group-hover:text-[#0B57D0] transition-colors">
            {property.name}
          </h3>

          {/* Location with Pin Icon */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span className="truncate">{property.location || 'Chennai, Tamil Nadu'}</span>
          </div>

          {/* Configuration / Type */}
          <p className="text-xs font-medium text-slate-600 mt-2 line-clamp-1">
            {property.configuration || property.plotSizes || `${property.area || 1200} sq.ft Plot Extent`}
          </p>

          {/* Price */}
          <p className="text-base font-extrabold text-slate-900 mt-1">
            {property.priceFormatted || property.priceDisplay || property.priceRange || 'Price on Request'}
          </p>

          {/* ── 3. Multi-Segment Inventory Bar ── */}
          <div className="mt-3.5">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${availPct}%` }}
                className="bg-[#10B981] h-full transition-all duration-500"
                title={`${available} available`}
              />
              <div
                style={{ width: `${bookedPct}%` }}
                className="bg-[#F59E0B] h-full transition-all duration-500"
                title={`${booked} booked`}
              />
              <div
                style={{ width: `${soldPct}%` }}
                className="bg-[#94A3B8] h-full transition-all duration-500"
                title={`${sold} sold`}
              />
            </div>

            {/* Inventory Legend Numbers */}
            <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-2 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[2px] bg-[#10B981]" />
                {available} available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[2px] bg-[#F59E0B]" />
                {booked} booked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[2px] bg-[#94A3B8]" />
                {sold} sold
              </span>
            </div>
          </div>
        </div>

        {/* ── 4. Card Footer (Approval/RERA ID & Leads Count) ── */}
        <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span
            className="font-mono text-[10px] truncate max-w-[180px] text-slate-600 font-semibold"
            title={property.rera || property.approval}
          >
            {property.rera || property.approval || 'CMDA & RERA Approved'}
          </span>

          <div className="flex items-center gap-2.5 shrink-0">
            {hasLayout && (
              <a
                href={`http://localhost:3000/layout-viewer?layout=${layoutSlug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B57D0] hover:underline"
                title="Open Interactive Layout Plan"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Layout</span>
              </a>
            )}

            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              {property.leadsCount || 12} leads
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
