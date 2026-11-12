'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight, ShieldCheck, Ruler } from 'lucide-react'
import { Button } from '../ui'
import { formatPrice } from '../../lib/api'

/**
 * Reusable ProjectCard Component (Plot UI)
 * Clean image display with zero overlay on the image.
 * Fully responsive across all devices from 320px to 1920px.
 * @param {object} project
 * @param {string} [className=""]
 */
export function ProjectCard({ project, className = '' }) {
  if (!project) return null

  const isFlagship = Boolean(project?.isFlagship || project?.featured)
  const fallbackImage = '/images/hero-estate.jpg'

  const primaryImage =
    project.image ||
    (Array.isArray(project.images) && project.images[0]) ||
    (Array.isArray(project.gallery) && project.gallery[0]) ||
    fallbackImage

  const [imgSrc, setImgSrc] = useState(primaryImage)

  useEffect(() => {
    setImgSrc(primaryImage)
  }, [primaryImage])

  const handleImageError = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    // If it was a relative path starting with /images/plots/, try fetching directly from API server
    if (imgSrc && typeof imgSrc === 'string' && imgSrc.startsWith('/images/plots/') && !imgSrc.startsWith('http')) {
      const fullUrl = `${apiUrl.replace(/\/$/, '')}${imgSrc}`
      if (imgSrc !== fullUrl) {
        setImgSrc(fullUrl)
        return
      }
    }
    // Specific project fallback before generic hero-estate
    const slugImage = project?.slug ? `/images/${project.slug}.jpg` : null
    if (slugImage && imgSrc !== slugImage && imgSrc !== fallbackImage) {
      setImgSrc(slugImage)
      return
    }
    setImgSrc(fallbackImage)
  }

  const projectSlug = project.slug || project.id || project.projectId

  // Format Area display
  const areaDisplay = (() => {
    if (project.totalLandArea) return String(project.totalLandArea)
    if (project.availableArea) return String(project.availableArea)
    if (typeof project.area === 'number') return `${project.area.toLocaleString('en-IN')} ${project.unit || 'sq.ft'}`
    if (typeof project.area === 'string' && project.area.trim()) {
      const num = Number(project.area)
      return !isNaN(num) ? `${num.toLocaleString('en-IN')} ${project.unit || 'sq.ft'}` : project.area
    }
    if (project.plotSizes) return project.plotSizes
    return 'Individual Plots'
  })()

  // Format Price display
  const priceDisplay = (() => {
    if (project.priceDisplay) return project.priceDisplay
    if (project.priceFormatted) return project.priceFormatted
    if (project.price) return formatPrice(project.price)
    return 'Price on Request'
  })()

  // Format Location display
  const locationDisplay =
    project.location ||
    [project.village, project.taluk, project.district].filter(Boolean).join(', ') ||
    'Chennai'

  const propType = project.propertyType || project.type || 'Residential Plot'
  const propStatus = project.status || project.badge || 'Available'
  const propTitle = project.name || project.projectName || 'Crystal Estates Property'

  const statusStr = String(propStatus || '').trim().toLowerCase()
  const isSoldOut =
    statusStr === 'sold' ||
    statusStr === 'sold out' ||
    statusStr === 'soldout' ||
    Boolean(project.isSoldOut) ||
    (typeof project.availablePlots === 'number' && project.availablePlots === 0 && (project.totalPlots > 0 || (Array.isArray(project.plots) && project.plots.length > 0)))

  return (
    <article className={`project-card ${isFlagship ? 'project-card--flagship' : ''} ${className}`.trim()}>
      {/* 1. Pure Clean Image Container (No overlays, no text, no badges on the image) */}
      <div className="project-card__image-wrap">
        <Image
          src={imgSrc}
          alt={propTitle}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="project-card__image"
          loading="lazy"
          onError={handleImageError}
        />
      </div>

      {/* 2. Structured Content Body */}
      <div className="project-card__body">
        {/* Meta Bar: Location & Status / Type */}
        <div className="project-card__meta-bar">
          <div className="project-card__location" title={locationDisplay}>
            <MapPin size={14} className="project-card__location-icon" />
            <span>{locationDisplay}</span>
          </div>

          <div className="project-card__badges-wrap">
            {propType && (
              <span className="project-card__type-pill">
                {propType}
              </span>
            )}
            {propStatus && (
              <span className={`project-card__status-pill project-card__status-pill--${propStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                {propStatus}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="project-card__title">
          <Link href={`/projects/${projectSlug}`}>
            {propTitle}
          </Link>
        </h3>

        {/* Key Specs Box: Size / Extent & Price */}
        <div className="project-card__meta-grid">
          <div className="project-card__meta-item">
            <span className="project-card__meta-label">
              <Ruler size={13} /> Size / Extent
            </span>
            <span className="project-card__meta-value">
              {areaDisplay}
            </span>
          </div>

          <div className="project-card__meta-item">
            <span className="project-card__meta-label">Price</span>
            <span className="project-card__meta-value project-card__meta-value--price">
              {priceDisplay}
            </span>
          </div>
        </div>

        {/* Card Footer: Legal Patta tag & CTA */}
        <div className="project-card__footer">
          <div className="project-card__legal-tag">
            <ShieldCheck size={15} />
            <span>{project.approval || project.approvalStatus || '100% Clear Title Patta'}</span>
          </div>

          {isSoldOut ? (
            <Button
              href={`/projects/${projectSlug}`}
              variant="outline"
              size="sm"
              className="project-card__cta project-card__cta--soldout"
            >
              <span>Sold Out</span>
            </Button>
          ) : (
            <Button href={`/projects/${projectSlug}`} variant="outline" size="sm" className="project-card__cta">
              <span>View Details</span>
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
