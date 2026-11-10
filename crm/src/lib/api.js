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
 * Upload property document (PDF, DOC, Patta, etc.) to backend
 */
export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append('document', file)

  const res = await fetch(getApiUrl('/api/upload/document'), {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Document upload failed: HTTP ${res.status}`)
  }

  return await res.json()
}

/**
 * Upload drone or site video to backend
 */
export async function uploadVideo(file) {
  const formData = new FormData()
  formData.append('video', file)

  const res = await fetch(getApiUrl('/api/upload/video'), {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Video upload failed: HTTP ${res.status}`)
  }

  return await res.json()
}

/**
 * Upload layout blueprint file of any format (PDF, CAD, SVG, image, doc) directly without conversion
 */
export async function uploadLayoutFile(file, projectName = '') {
  const formData = new FormData()
  formData.append('layoutFile', file)
  if (projectName) {
    formData.append('projectName', projectName)
  }

  const res = await fetch(getApiUrl('/api/upload/layout-file'), {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Layout file upload failed: HTTP ${res.status}`)
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
 * Update existing plot in database
 */
export async function updatePlot(id, updates) {
  const res = await fetch(getApiUrl(`/api/plots/${id}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to update plot: HTTP ${res.status}`)
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

/**
 * Fetch all leads from MongoDB API
 */
export async function fetchLeads() {
  const res = await fetch(getApiUrl('/api/leads'))
  if (!res.ok) throw new Error(`Failed to fetch leads: HTTP ${res.status}`)
  return await res.json()
}

/**
 * Create a new lead in MongoDB
 */
export async function createLead(leadData) {
  const res = await fetch(getApiUrl('/api/leads'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to create lead: HTTP ${res.status}`)
  }
  return await res.json()
}

/**
 * Update a lead stage, agent, advance, or notes in MongoDB
 */
export async function updateLead(id, updates) {
  const res = await fetch(getApiUrl(`/api/leads/${id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to update lead: HTTP ${res.status}`)
  }
  return await res.json()
}

/**
 * Delete a lead from MongoDB
 */
export async function deleteLead(id) {
  const res = await fetch(getApiUrl(`/api/leads/${id}`), {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`Failed to delete lead: HTTP ${res.status}`)
  return await res.json()
}

/**
 * Record an advance payment for a lead (creates payment record in MongoDB)
 */
export async function recordLeadPayment(id, paymentData) {
  const res = await fetch(getApiUrl(`/api/leads/${id}/payments`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to record payment: HTTP ${res.status}`)
  }
  return await res.json()
}

/**
 * Schedule a follow-up for a lead in MongoDB
 */
export async function scheduleLeadFollowUp(id, followUpData) {
  const res = await fetch(getApiUrl(`/api/leads/${id}/followups`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(followUpData),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to schedule follow-up: HTTP ${res.status}`)
  }
  return await res.json()
}

/**
 * Toggle completion of a follow-up item
 */
export async function toggleLeadFollowUp(id, fuId) {
  const res = await fetch(getApiUrl(`/api/leads/${id}/followups/${fuId}/toggle`), {
    method: 'PATCH',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to toggle follow-up: HTTP ${res.status}`)
  }
  return await res.json()
}

/**
 * Add a quick note to a lead and record in activity timeline
 */
export async function addLeadNote(id, note) {
  const res = await fetch(getApiUrl(`/api/leads/${id}/notes`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to add note: HTTP ${res.status}`)
  }
  return await res.json()
}

/**
 * Fetch dynamic lead metadata (projects, agents, sources, stages, payment options)
 */
export async function fetchLeadsMeta() {
  const res = await fetch(getApiUrl('/api/leads/meta'))
  if (!res.ok) throw new Error('Failed to load lead metadata')
  return await res.json()
}

/**
 * Fetch all payments recorded across all leads
 */
export async function fetchAllPayments() {
  const res = await fetch(getApiUrl('/api/leads/payments/all'))
  if (!res.ok) throw new Error('Failed to load payments')
  return await res.json()
}

/**
 * Authentication: Login
 */
export async function loginUser(email, password) {
  const res = await fetch(getApiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Login failed. Please check your credentials.')
  }
  return data
}

/**
 * Authentication: Request password reset
 */
export async function forgotPasswordUser(email) {
  const res = await fetch(getApiUrl('/api/auth/forgot-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send reset link.')
  }
  return data
}

/**
 * Authentication: Reset password
 */
export async function resetPasswordUser({ email, resetToken, otp, newPassword }) {
  const res = await fetch(getApiUrl('/api/auth/reset-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, resetToken, otp, newPassword }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset password.')
  }
  return data
}

/**
 * Authentication: Fetch current user
 */
export async function fetchCurrentUser(token) {
  const res = await fetch(getApiUrl('/api/auth/me'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Session invalid')
  return await res.json()
}

/**
 * Layout & Plot Management APIs
 */
export async function fetchLayoutDetails(slug) {
  const res = await fetch(getApiUrl(`/api/plots/layout/${slug}`))
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to fetch layout: HTTP ${res.status}`)
  }
  return await res.json()
}

export async function saveLayoutPlots(slug, plots) {
  const res = await fetch(getApiUrl(`/api/plots/layout/${slug}/plots`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plots }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to save layout plots: HTTP ${res.status}`)
  }
  return await res.json()
}

export async function addOrUpdateLayoutPlot(slug, plotData) {
  const res = await fetch(getApiUrl(`/api/plots/layout/${slug}/plot`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plotData),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to save plot: HTTP ${res.status}`)
  }
  return await res.json()
}

export async function deleteLayoutPlot(slug, plotNo) {
  const res = await fetch(getApiUrl(`/api/plots/layout/${slug}/plot/${plotNo}`), {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to delete plot: HTTP ${res.status}`)
  }
  return await res.json()
}

