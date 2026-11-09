'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight, ShieldCheck, Ruler } from 'lucide-react'
import { Button } from '../ui'

/**
 * Reusable ProjectCard Component (Plot UI)
 * Clean image display with zero overlay on the image.
 * Fully responsive across all devices from 320px to 1920px.
 * @param {object} project
 * @param {string} [className=""]
 */
export function ProjectCard({ project, className = '' }) {
  const isFlagship = project?.isFlagship || project?.type === 'Farm Land'
  const fallbackImage = isFlagship ? '/images/vedanthangal.jpg' : '/images/kolapakkam.jpg'
  const [imgSrc, setImgSrc] = useState(project?.image || fallbackImage)

  if (!project) return null

  const projectSlug = project.slug || project.id

  return (
    <article className={`project-card ${isFlagship ? 'project-card--flagship' : ''} ${className}`.trim()}>
      {/* 1. Pure Clean Image Container (No overlays, no text, no badges on the image) */}
      <div className="project-card__image-wrap">
        <Image
          src={imgSrc}
          alt={project.name || 'Crystal Estates Land Plot'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="project-card__image"
          loading="lazy"
          onError={() => setImgSrc(fallbackImage)}
        />
      </div>

      {/* 2. Structured Content Body */}
      <div className="project-card__body">
        {/* Meta Bar: Location & Status / Type */}
        <div className="project-card__meta-bar">
          <div className="project-card__location">
            <MapPin size={14} className="project-card__location-icon" />
            <span>{project.location}</span>
          </div>

          <div className="project-card__badges-wrap">
            {project.type && (
              <span className="project-card__type-pill">
                {project.type}
              </span>
            )}
            {project.status && (
              <span className={`project-card__status-pill project-card__status-pill--${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {project.status}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="project-card__title">
          <Link href={`/projects/${projectSlug}`}>
            {project.name}
          </Link>
        </h3>

        {/* Key Specs Box: Size / Extent & Price */}
        <div className="project-card__meta-grid">
          <div className="project-card__meta-item">
            <span className="project-card__meta-label">
              <Ruler size={13} /> Size / Extent
            </span>
            <span className="project-card__meta-value">
              {project.area || project.plotSizes || 'Individual Plots'}
            </span>
          </div>

          <div className="project-card__meta-item">
            <span className="project-card__meta-label">Price</span>
            <span className="project-card__meta-value project-card__meta-value--price">
              {project.priceDisplay || `₹ ${(Number(project.price) / 100000).toFixed(1)} Lakhs`}
            </span>
          </div>
        </div>

        {/* Card Footer: Legal Patta tag & CTA */}
        <div className="project-card__footer">
          <div className="project-card__legal-tag">
            <ShieldCheck size={15} />
            <span>100% Clear Title Patta</span>
          </div>

          <Button href={`/projects/${projectSlug}`} variant="outline" size="sm" className="project-card__cta">
            <span>View Details</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
