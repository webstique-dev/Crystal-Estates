'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Filter, Search, RotateCcw } from 'lucide-react'
import { Container, Section } from '../ui'
import { ProjectGrid } from './ProjectGrid'
import { fetchPlots, normalizePlot } from '../../lib/api'

const initialFilterState = {
  type: 'All',
  location: '',
  priceRange: 'all',
  availability: 'all',
}

export default function ProjectsClientView({ initialProjects = null }) {
  const [dbProjects, setDbProjects] = useState(
    Array.isArray(initialProjects) && initialProjects.length > 0 ? initialProjects : []
  )
  const [loading, setLoading] = useState(!initialProjects || initialProjects.length === 0)
  const [filters, setFilters] = useState(initialFilterState)

  // Fetch actual data from backend API
  useEffect(() => {
    let isMounted = true

    fetch('/api/plots')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.plots) && data.plots.length > 0) {
          const normalized = data.plots.map(normalizePlot)
          setDbProjects(normalized)
        }
      })
      .catch((err) => {
        console.warn('Could not fetch plots from MongoDB API, checking fallback:', err.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleResetFilters = () => {
    setFilters(initialFilterState)
  }

  // Derive dynamic locations purely from actual database projects
  const locationOptions = useMemo(() => {
    const locSet = new Set()
    dbProjects.forEach((p) => {
      if (p.location) locSet.add(p.location.trim())
      if (p.district) locSet.add(p.district.trim())
      if (p.village) locSet.add(p.village.trim())
      if (p.taluk) locSet.add(p.taluk.trim())
    })
    return Array.from(locSet).filter(Boolean).sort()
  }, [dbProjects])

  // Filter computation
  const filteredProjects = useMemo(() => {
    return dbProjects.filter((proj) => {
      // 1. Type
      if (filters.type !== 'All') {
        const pType = (proj.propertyType || proj.type || '').toLowerCase()
        const fType = filters.type.toLowerCase()
        if (fType.includes('residential') && !pType.includes('residential')) return false
        if (fType.includes('farm') || fType.includes('agri')) {
          if (!pType.includes('farm') && !pType.includes('agri')) return false
        }
        if (fType.includes('bulk') && !pType.includes('bulk')) return false
      }

      // 2. Location
      if (filters.location) {
        const filterLoc = filters.location.toLowerCase()
        const fullLoc = [
          proj.location,
          proj.district,
          proj.taluk,
          proj.village,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!fullLoc.includes(filterLoc)) {
          return false
        }
      }

      // 3. Availability
      if (filters.availability !== 'all') {
        const normStatus = (proj.status || '').toLowerCase().replace(/\s+/g, '')
        const normFilter = filters.availability.toLowerCase().replace(/\s+/g, '')
        if (normStatus !== normFilter) return false
      }

      // 4. Price range
      if (filters.priceRange !== 'all') {
        const price = Number(proj.price) || 0
        if (filters.priceRange === 'under-50l' && price >= 5000000) return false
        if (filters.priceRange === '50l-80l' && (price < 5000000 || price > 8000000)) return false
        if (filters.priceRange === '80l-plus' && price <= 8000000) return false
      }

      return true
    })
  }, [dbProjects, filters])

  return (
    <Section variant="light" className="projects-catalog">
      <Container>
        {/* Filter Bar Component */}
        <div className="projects-filter-bar">
          <div className="projects-filter-bar__header">
            <div className="projects-filter-bar__title">
              <Filter size={18} />
              <span>Filter Land &amp; Plots</span>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="projects-filter-bar__reset"
              aria-label="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="projects-filter-bar__grid">
            {/* Filter 1: Type */}
            <div className="filter-field">
              <label htmlFor="filter-type">Land Type</label>
              <div className="filter-select-wrap">
                <select
                  id="filter-type"
                  value={filters.type}
                  onChange={handleFilterChange('type')}
                  aria-label="Filter by Land Type"
                  className="filter-select"
                >
                  <option value="All">All Categories</option>
                  <option value="Residential">Residential Plots</option>
                  <option value="Agricultural">Agricultural &amp; Farm Land</option>
                  <option value="Bulk land">Bulk Land</option>
                </select>
              </div>
            </div>

            {/* Filter 2: Location */}
            <div className="filter-field">
              <label htmlFor="filter-location">Location</label>
              <div className="filter-select-wrap">
                <select
                  id="filter-location"
                  value={filters.location}
                  onChange={handleFilterChange('location')}
                  aria-label="Filter by Location"
                  className="filter-select"
                >
                  <option value="">All Chennai Locations</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter 3: Price Range */}
            <div className="filter-field">
              <label htmlFor="filter-price">Budget Range</label>
              <div className="filter-select-wrap">
                <select
                  id="filter-price"
                  value={filters.priceRange}
                  onChange={handleFilterChange('priceRange')}
                  aria-label="Filter by Price Range"
                  className="filter-select"
                >
                  <option value="all">Any Price</option>
                  <option value="under-50l">Under ₹ 50 Lakhs</option>
                  <option value="50l-80l">₹ 50 Lakhs – ₹ 80 Lakhs</option>
                  <option value="80l-plus">₹ 80 Lakhs &amp; Above</option>
                </select>
              </div>
            </div>

            {/* Filter 4: Availability */}
            <div className="filter-field">
              <label htmlFor="filter-availability">Availability Status</label>
              <div className="filter-select-wrap">
                <select
                  id="filter-availability"
                  value={filters.availability}
                  onChange={handleFilterChange('availability')}
                  aria-label="Filter by Availability Status"
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Booked">Booked</option>
                  <option value="Few Left">Few Left</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            fontSize: '14px',
            color: 'var(--muted)',
          }}
        >
          <span>
            Showing <strong>{filteredProjects.length}</strong> land projects
          </span>
        </div>

        {/* ProjectGrid with pagination, empty state, and loading skeletons */}
        <ProjectGrid
          projects={filteredProjects}
          loading={loading}
          emptyMessage="No land projects match your selected filters. Try broadening your location or budget."
          onReset={handleResetFilters}
          initialCount={9}
          pageSize={9}
        />
      </Container>
    </Section>
  )
}
