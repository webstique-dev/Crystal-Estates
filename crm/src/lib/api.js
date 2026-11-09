const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export function getApiUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${cleanPath}`
}

/**
 * Upload single image to backend
 */
export async function uploadPlotImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(getApiUrl('/api/upload/image'), {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Upload failed: HTTP ${res.status}`)
  }

  return await res.json()
}

/**
 * Upload converted SVG layout to backend
 */
export async function uploadLayoutSvg({ svgContent, layoutSlug, projectName, viewBox, width, height }) {
  const res = await fetch(getApiUrl('/api/upload/layout-svg'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      svgContent,
      layoutSlug,
      projectName,
      viewBox,
      width,
      height,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Layout SVG upload failed: HTTP ${res.status}`)
  }

  return await res.json()
}

/**
 * Fetch all plots from backend
 */
export async function fetchPlots() {
  const res = await fetch(getApiUrl('/api/plots'))
  if (!res.ok) throw new Error(`Failed to load plots: HTTP ${res.status}`)
  return await res.json()
}

/**
 * Save new plot to database
 */
export async function createPlot(plotData) {
  const res = await fetch(getApiUrl('/api/plots'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plotData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to create plot: HTTP ${res.status}`)
  }

  return await res.json()
}

/**
 * Delete plot
 */
export async function deletePlot(id) {
  const res = await fetch(getApiUrl(`/api/plots/${id}`), {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`Delete failed: HTTP ${res.status}`)
  return await res.json()
}

