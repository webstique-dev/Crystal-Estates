import { useState, useEffect, useCallback } from 'react'
import {
  fetchSiteVisits,
  createSiteVisit,
  updateSiteVisit,
  deleteSiteVisit,
} from '../lib/api'

export function useSiteVisits() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadVisits = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await fetchSiteVisits()
      if (data.success) {
        setVisits(data.visits || [])
      }
      setError(null)
    } catch (err) {
      console.error('Failed to load site visits:', err)
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVisits()
    const interval = setInterval(() => loadVisits(true), 15000)
    const handleFocus = () => loadVisits(true)
    window.addEventListener('focus', handleFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadVisits])

  const scheduleVisit = async (visitData) => {
    const res = await createSiteVisit(visitData)
    if (res.success && res.visit) {
      await loadVisits(true)
      return res
    }
    throw new Error(res.error || 'Failed to schedule site visit')
  }

  const updateVisit = async (id, updates) => {
    const res = await updateSiteVisit(id, updates)
    if (res.success && res.visit) {
      setVisits((prev) => prev.map((v) => (v.id === id ? res.visit : v)))
      return res.visit
    }
    throw new Error(res.error || 'Failed to update site visit')
  }

  const removeVisit = async (id) => {
    const res = await deleteSiteVisit(id)
    if (res.success) {
      setVisits((prev) => prev.filter((v) => v.id !== id))
      return true
    }
    throw new Error(res.error || 'Failed to delete site visit')
  }

  return {
    visits,
    loading,
    error,
    refreshVisits: () => loadVisits(false),
    scheduleVisit,
    updateVisit,
    removeVisit,
  }
}

