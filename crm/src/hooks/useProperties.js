import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchPlots, deletePlot } from '../lib/api'

export function useProperties() {
  const [dbPlots, setDbPlots] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch Live Plots strictly from MongoDB Backend
  const loadDbPlots = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchPlots()
      if (data && data.plots) {
        setDbPlots(data.plots)
      }
      setError(null)
    } catch (err) {
      console.warn('Could not fetch plots from backend:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDbPlots()
  }, [loadDbPlots])

  // Map real database plots without any injected dummy data or numbers
  const allProperties = useMemo(() => {
    return dbPlots.map((p, index) => ({
      id: p.id || `db-${index}`,
      projectId: p.projectId || null,
      name: p.name || p.projectName || 'Unnamed Project',
      projectName: p.projectName || p.name || 'Unnamed Project',
      location: p.location || '',
      district: p.district || '',
      taluk: p.taluk || '',
      village: p.village || '',
      surveyNumber: p.surveyNumber || '',
      configuration: p.plotDimensions || p.configuration || p.type || '',
      type: p.propertyType || p.type || 'Residential',
      propertyType: p.propertyType || p.type || 'Residential',
      totalLandArea: p.totalLandArea || (p.area ? `${p.area} sq.ft` : ''),
      availableArea: p.availableArea || '',
      plotNumber: p.plotNumber || p.plotNo || '',
      plotDimensions: p.plotDimensions || '',
      length: p.length || '',
      width: p.width || '',
      price: p.price ?? null,
      priceFormatted: p.priceFormatted || p.priceDisplay || (p.price ? `₹ ${Number(p.price).toLocaleString('en-IN')}` : ''),
      pricePerSqft: p.pricePerSqft ?? null,
      pricePerCent: p.pricePerCent ?? null,
      roadAccess: p.roadAccess || '',
      badge: p.status || 'Available',
      status: p.status || 'Available',
      image: p.image || (Array.isArray(p.images) && p.images[0]) || (Array.isArray(p.gallery) && p.gallery[0]) || null,
      images: Array.isArray(p.images) ? p.images : Array.isArray(p.gallery) ? p.gallery : [],
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      documents: Array.isArray(p.documents) ? p.documents : [],
      videos: Array.isArray(p.videos) ? p.videos : [],
      available: typeof p.available === 'number' ? p.available : null,
      booked: typeof p.booked === 'number' ? p.booked : null,
      sold: typeof p.sold === 'number' ? p.sold : null,
      approval: p.approval || p.approvalStatus || '',
      approvalStatus: p.approvalStatus || p.approval || '',
      rera: p.rera || p.approvalStatus || p.approval || '',
      leadsCount: typeof p.leadsCount === 'number' ? p.leadsCount : null,
      hasLayoutMap: Boolean(p.layoutBackgroundUrl || p.hasLayoutMap),
      layoutSlug:
        p.layoutSlug ||
        (p.layoutBackgroundUrl
          ? p.layoutBackgroundUrl.replace('/plots/', '').replace('-layout.svg', '')
          : null),
      layoutBackgroundUrl: p.layoutBackgroundUrl || null,
      description: p.description || '',
    }))
  }, [dbPlots])

  // Filter properties by search term
  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return allProperties
    const term = searchTerm.toLowerCase()
    return allProperties.filter(
      (prop) =>
        (prop.name && prop.name.toLowerCase().includes(term)) ||
        (prop.location && prop.location.toLowerCase().includes(term)) ||
        (prop.surveyNumber && prop.surveyNumber.toLowerCase().includes(term)) ||
        (prop.type && prop.type.toLowerCase().includes(term))
    )
  }, [allProperties, searchTerm])

  const handleDelete = useCallback(async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return false
    try {
      await deletePlot(id)
      setDbPlots((prev) => prev.filter((p) => p.id !== id && p.projectId !== id))
      return true
    } catch {
      setDbPlots((prev) => prev.filter((p) => p.id !== id && p.projectId !== id))
      return true
    }
  }, [])

  const addPlot = useCallback((newPlot) => {
    setDbPlots((prev) => [newPlot, ...prev])
  }, [])

  const updatePlotState = useCallback((updatedPlot) => {
    setDbPlots((prev) => {
      const exists = prev.some(
        (p) => p.id === updatedPlot.id || (p.projectId && p.projectId === updatedPlot.projectId)
      )
      if (exists) {
        return prev.map((p) =>
          p.id === updatedPlot.id || (p.projectId && p.projectId === updatedPlot.projectId)
            ? { ...p, ...updatedPlot }
            : p
        )
      }
      return [updatedPlot, ...prev]
    })
  }, [])

  return {
    properties: filteredProperties,
    totalCount: allProperties.length,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    refreshPlots: loadDbPlots,
    addPlot,
    updatePlotState,
    deleteProperty: handleDelete,
  }
}
