/**
 * Client API Client & Data Normalizer
 * Connects Next.js client directly to MongoDB Plots API
 */

const SERVER_BASE =
  process.env.SERVER_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000'

/**
 * Format currency number to Indian format (e.g. ₹ 78.0 Lakhs, ₹ 1.25 Cr, ₹ 40,000)
 */
export function formatPrice(amount) {
  if (!amount || isNaN(amount)) return 'Price on Request'
  const num = Number(amount)
  if (num >= 10000000) {
    const cr = num / 10000000
    return `₹ ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`
  }
  if (num >= 100000) {
    const lk = num / 100000
    return `₹ ${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)} Lakhs`
  }
  return `₹ ${num.toLocaleString('en-IN')}`
}

/**
 * Format size / extent with proper unit
 */
export function formatArea(plot) {
  if (!plot) return 'Individual Plots'
  if (plot.totalLandArea && String(plot.totalLandArea).trim().length > 0) {
    return String(plot.totalLandArea).trim()
  }
  if (plot.availableArea && String(plot.availableArea).trim().length > 0) {
    return String(plot.availableArea).trim()
  }
  if (plot.area !== undefined && plot.area !== null && String(plot.area).trim().length > 0) {
    const num = Number(plot.area)
    if (!isNaN(num)) {
      return `${num.toLocaleString('en-IN')} ${plot.unit || 'sq.ft'}`
    }
    return String(plot.area)
  }
  if (plot.plotSizes) return String(plot.plotSizes)
  return 'Individual Plots'
}

/**
 * Resolve an embeddable Google Maps URL from user input
 * Accepts:
 * - iframe tag: `<iframe src="...">`
 * - direct embed URL: `https://www.google.com/maps/embed?...`
 * - standard maps URL: `https://maps.google.com/?q=...`
 * - coordinates: `12.9784, 80.2185`
 * - address query
 */
export function resolveMapEmbedUrl(mapInput, fallbackLocation) {
  if (!mapInput || typeof mapInput !== 'string' || !mapInput.trim()) {
    const query = fallbackLocation || 'Chennai, Tamil Nadu'
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
  }

  const trimmed = mapInput.trim()

  // 1. If user pasted an iframe
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i)
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1]
  }

  // 2. Already Google Maps embed
  if (trimmed.includes('google.com/maps/embed')) {
    return trimmed
  }

  // 3. Google Maps link with query
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed)
      const q = url.searchParams.get('q') || url.searchParams.get('query')
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
      }
    } catch (_) {}
    return trimmed
  }

  // 4. Coordinates or address string
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
}

/**
 * Resolve external direct Google Maps link for "Open in Maps"
 */
export function resolveMapDirectUrl(mapInput, fallbackLocation) {
  if (!mapInput || typeof mapInput !== 'string' || !mapInput.trim()) {
    const query = fallbackLocation || 'Chennai, Tamil Nadu'
    return `https://maps.google.com/?q=${encodeURIComponent(query)}`
  }

  const trimmed = mapInput.trim()
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i)
  if (iframeMatch && iframeMatch[1]) return iframeMatch[1]
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return `https://maps.google.com/?q=${encodeURIComponent(trimmed)}`
}

/**
 * Standardize property data from MongoDB into client-ready format
 */
export function normalizePlot(plot) {
  if (!plot) return null

  const id = String(plot.id || plot.projectId || plot._id || `plot-${Date.now()}`)
  const name = plot.name || plot.projectName || 'Crystal Estates Property'
  const slug =
    plot.slug ||
    plot.layoutSlug ||
    (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : id)

  const type = plot.propertyType || plot.type || 'Residential Plot'

  // Location string
  const locParts = [plot.village, plot.taluk, plot.district].filter(Boolean)
  const location =
    plot.location && plot.location.trim().length > 0
      ? plot.location.trim()
      : locParts.length > 0
        ? locParts.join(', ')
        : 'Chennai'

  // Price & price display
  const numPrice = Number(plot.price) || 0
  const priceDisplay =
    plot.priceFormatted ||
    plot.priceDisplay ||
    (numPrice > 0 ? formatPrice(numPrice) : 'Price on Request')

  // Status
  const status = plot.status || plot.badge || 'Available'

  // Approval
  const approval =
    plot.approvalStatus ||
    plot.approval ||
    plot.rera ||
    'CMDA / DTCP Approved'

  // Images
  const rawImages = [
    ...(Array.isArray(plot.images) ? plot.images : []),
    ...(Array.isArray(plot.gallery) ? plot.gallery : []),
    ...(typeof plot.image === 'string' && plot.image ? [plot.image] : []),
  ].filter((img) => typeof img === 'string' && img.trim().length > 0)

  const images = Array.from(new Set(rawImages))
  const primaryImage =
    plot.image ||
    (images.length > 0 ? images[0] : '/images/kolapakkam.jpg')

  // Videos (support both string URLs and uploaded video objects { name, url, size })
  const rawVideos = []
  if (Array.isArray(plot.videos)) {
    plot.videos.forEach((v) => {
      if (typeof v === 'string' && v.trim().length > 0) {
        rawVideos.push({ url: v.trim(), name: 'Project Video' })
      } else if (v && typeof v === 'object' && v.url) {
        rawVideos.push({
          url: v.url.trim(),
          name: v.name || 'Project Video',
          size: v.size || '',
        })
      }
    })
  }
  ;[plot.video, plot.videoUrl, plot.youtubeUrl, plot.video_url].forEach((v) => {
    if (typeof v === 'string' && v.trim().length > 0) {
      rawVideos.push({ url: v.trim(), name: 'Project Video' })
    }
  })

  // Deduplicate by URL
  const seenVideoUrls = new Set()
  const videos = rawVideos.filter((v) => {
    if (!v.url || seenVideoUrls.has(v.url)) return false
    seenVideoUrls.add(v.url)
    return true
  })

  // Documents
  const rawDocs = Array.isArray(plot.documents) ? plot.documents : []

  // Map Location
  const mapLocation = (
    plot.mapLocation ||
    plot.mapUrl ||
    plot.googleMapsUrl ||
    plot.mapEmbedUrl ||
    ''
  ).trim()

  return {
    ...plot,
    id,
    projectId: plot.projectId || id,
    slug,
    name,
    projectName: plot.projectName || name,
    type,
    propertyType: type,
    location,
    district: plot.district || '',
    taluk: plot.taluk || '',
    village: plot.village || '',
    area: formatArea(plot),
    rawArea: plot.area,
    totalLandArea: plot.totalLandArea || '',
    availableArea: plot.availableArea || '',
    plotDimensions:
      plot.plotDimensions ||
      (plot.length && plot.width ? `${plot.length}' x ${plot.width}'` : ''),
    roadAccess: plot.roadAccess || '',
    surveyNumber: plot.surveyNumber || '',
    plotNumber: plot.plotNumber || plot.plotNo || '',
    price: numPrice,
    priceDisplay,
    priceFormatted: priceDisplay,
    status,
    badge: status,
    approval,
    approvalStatus: approval,
    image: primaryImage,
    images: images.length > 0 ? images : [primaryImage],
    gallery: images.length > 0 ? images : [primaryImage],
    videos,
    documents: rawDocs,
    mapLocation,
    mapUrl: mapLocation,
    googleMapsUrl: mapLocation,
    hasLayoutMap: Boolean(
      plot.hasLayoutMap ||
        plot.layoutBackgroundUrl ||
        plot.layoutSlug ||
        name.toLowerCase().includes('kolapakkam')
    ),
    layoutSlug:
      plot.layoutSlug ||
      (name.toLowerCase().includes('kolapakkam') ? 'kolapakkam' : null),
    layoutBackgroundUrl: plot.layoutBackgroundUrl || null,
  }
}

/**
 * Fetch all plots from API
 */
export async function fetchPlots() {
  try {
    const isServer = typeof window === 'undefined'
    const url = isServer ? `${SERVER_BASE}/api/plots` : '/api/plots'
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.success && Array.isArray(data.plots) && data.plots.length > 0) {
      return data.plots.map(normalizePlot)
    }
  } catch (err) {
    console.warn('Error fetching plots from API:', err.message)
  }
  return null
}

/**
 * Fetch a single plot by slug, id, or projectId
 */
export async function fetchPlotBySlugOrId(slug) {
  try {
    const isServer = typeof window === 'undefined'
    const url = isServer ? `${SERVER_BASE}/api/plots/${slug}` : `/api/plots/${slug}`
    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.success && data.plot) {
        return normalizePlot(data.plot)
      }
    }
  } catch (err) {
    // fallback to full list lookup
  }

  const all = await fetchPlots()
  if (all) {
    const found = all.find(
      (p) =>
        p.slug === slug ||
        p.id === slug ||
        p.projectId === slug ||
        String(p.name).toLowerCase() === String(slug).toLowerCase()
    )
    if (found) return found
  }

  return null
}
