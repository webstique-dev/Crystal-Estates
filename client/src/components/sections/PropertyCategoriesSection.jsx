'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Home, Trees, Building2, Landmark } from 'lucide-react'
import { Section, Container } from '../ui'

const categories = [
  {
    id: 'residential',
    title: 'Residential Plots',
    tag: 'CMDA & DTCP Approved',
    description:
      'Gated community plots with blacktop roads, sweet groundwater, compound walls, and immediate construction clearance.',
    locations: 'Prime Residential Corridors',
    stat: 'Individual & Gated Plots',
    href: '/projects',
    image: '/images/plot-1.jpg',
    icon: Home,
  },
  {
    id: 'farmland',
    title: 'Agricultural & Farm Land',
    tag: 'Managed Farmland',
    description:
      'Fertile agro-forestry farm lands planted with high-value trees, sweet water sources, and 24/7 plantation care.',
    locations: 'Fertile Agro Corridors',
    stat: 'Acreage & Farm Parcels',
    href: '/projects',
    image: '/images/hero-estate.jpg',
    icon: Trees,
  },
  {
    id: 'commercial',
    title: 'Commercial & Highway Land',
    tag: 'High-Visibility Frontage',
    description:
      'Prime commercial frontages along major arterial corridors ideal for showrooms, logistics, institutions, and corporate warehouses.',
    locations: 'Arterial Highway Corridors',
    stat: 'Commercial Frontages',
    href: '/projects',
    image: '/images/plot-2.jpg',
    icon: Building2,
  },
  {
    id: 'bulk-investment',
    title: 'Bulk Land & Investment Parcels',
    tag: 'Strategic Land Banks',
    description:
      'Clear-titled large acreage for HNIs and family offices seeking generational wealth preservation with 30-year legal vetting.',
    locations: 'Strategic Growth Corridors',
    stat: '5+ Acres Multi-Acre Parcels',
    href: '/sell-your-land',
    image: '/images/hero-estate.jpg',
    icon: Landmark,
  },
]

export default function PropertyCategoriesSection({
  title = 'Property Categories',
  subtitle = 'Explore diversified land opportunities tailored for residential living, agro-forestry, and high-yield capital appreciation.',
  className = '',
}) {
  return (
    <Section
      title={title}
      subtitle={subtitle}
      variant="light"
      className={`property-categories-sec ${className}`.trim()}
    >
      <Container>
        <div className="prop-cat-grid">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="prop-cat-card"
              >
                <div className="prop-cat-card__media">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="prop-cat-card__img"
                  />
                  <div className="prop-cat-card__gradient" />
                  <span className="prop-cat-card__tag">{cat.tag}</span>
                  <div className="prop-cat-card__icon-badge">
                    <Icon size={20} />
                  </div>
                </div>

                <div className="prop-cat-card__body">
                  <h3 className="prop-cat-card__title">{cat.title}</h3>
                  <p className="prop-cat-card__desc">{cat.description}</p>
                  
                  <div className="prop-cat-card__meta">
                    <span className="prop-cat-card__loc">{cat.locations}</span>
                    <strong className="prop-cat-card__stat">{cat.stat}</strong>
                  </div>

                  <div className="prop-cat-card__footer">
                    <span className="prop-cat-card__link-text">Explore Category</span>
                    <span className="prop-cat-card__arrow">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}

