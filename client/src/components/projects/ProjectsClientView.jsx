'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Filter, Search, RotateCcw } from 'lucide-react'
import { Container, Section, Field, Button } from '../ui'
import { ProjectGrid } from './ProjectGrid'
import { projects as staticProjects, searchOptions } from '../../data/site'

const initialFilterState = {
  type: 'All',
  location: '',
  priceRange: 'all',
  availability: 'all',
}

export default function ProjectsClientView() {
  const [dbProjects, setDbProjects] = useState(staticProjects)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(initialFilterState)

  // Keep existing API call unchanged
  useEffect(() => {
    let isMounted = true

    fetch('/api/plots')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.plots?.length > 0) {
          const flagship = staticProjects.find((p) => p.isFlagship)
          const merged = flagship
            ? [flagship, ...data.plots.filter((p) => !p.isFlagship)]
            : data.plots
          setDbProjects(merged)
        }
      })
      .catch((err) => {
        console.warn('Could not fetch plots from MongoDB API, using local fallback:', err.message)
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

  // Filter computation
  const filteredProjects = useMemo(() => {
    return dbProjects.filter((proj) => {
      // 1. Type
      if (filters.type !== 'All' && proj.type !== filters.type) {
        return false
      }

      // 2. Location
      if (
        filters.location &&
        !proj.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false
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
                  <option value="Residential Plot">Residential Plots</option>
                  <option value="Farm Land">Farm &amp; Sandalwood Land</option>
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
                  {searchOptions.locations.map((loc) => (
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
                  <option value="Booking Open">Booking Open</option>
                  <option value="Few Left">Few Left</option>
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
          initialCount={6}
          pageSize={6}
        />
      </Container>
    </Section>
  )
}

