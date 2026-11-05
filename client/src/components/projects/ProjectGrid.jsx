'use client'

import React, { useState } from 'react'
import { FolderSearch, RotateCcw } from 'lucide-react'
import ProjectCard from './ProjectCard'
import { Button } from '../ui'

/**
 * Reusable ProjectGrid Component with Skeletons, Empty State, and Pagination/Load More
 * @param {Array<object>} projects
 * @param {boolean} [loading=false]
 * @param {string} [emptyMessage="No land projects match your search criteria."]
 * @param {function} [onReset] - Handler to reset filters in empty state
 * @param {number} [initialCount=6]
 * @param {number} [pageSize=6]
 */
export function ProjectGrid({
  projects = [],
  loading = false,
  emptyMessage = 'No land projects match your search criteria.',
  onReset,
  initialCount = 6,
  pageSize = 6,
  className = '',
}) {
  const [visibleCount, setVisibleCount] = useState(initialCount)

  if (loading) {
    return (
      <div className={`project-grid ${className}`.trim()} aria-busy="true">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="project-card project-card--skeleton">
            <div className="skeleton-media" />
            <div className="skeleton-body" style={{ padding: '20px' }}>
              <div className="skeleton-line" style={{ width: '40%', height: '12px', marginBottom: '10px' }} />
              <div className="skeleton-line" style={{ width: '70%', height: '20px', marginBottom: '16px' }} />
              <div className="skeleton-line" style={{ width: '90%', height: '14px', marginBottom: '8px' }} />
              <div className="skeleton-line" style={{ width: '60%', height: '14px', marginBottom: '20px' }} />
              <div className="skeleton-line" style={{ width: '100%', height: '36px', borderRadius: '999px' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="project-grid-empty" role="status">
        <div className="project-grid-empty__icon">
          <FolderSearch size={40} />
        </div>
        <h3 className="project-grid-empty__title">No Projects Found</h3>
        <p className="project-grid-empty__desc">{emptyMessage}</p>
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset} className="project-grid-empty__btn">
            <RotateCcw size={14} />
            <span>Reset All Filters</span>
          </Button>
        )}
      </div>
    )
  }

  const visibleProjects = projects.slice(0, visibleCount)
  const hasMore = visibleCount < projects.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + pageSize)
  }

  return (
    <div className="project-grid-wrapper">
      <div className={`project-grid ${className}`.trim()}>
        {visibleProjects.map((proj) => (
          <ProjectCard key={proj.id || proj._id} project={proj} />
        ))}
      </div>

      {hasMore && (
        <div className="project-grid__load-more">
          <Button variant="outline" onClick={handleLoadMore}>
            <span>Load More Projects ({projects.length - visibleCount} remaining)</span>
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProjectGrid

