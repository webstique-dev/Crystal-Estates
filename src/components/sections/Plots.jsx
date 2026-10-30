'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Compass, Ruler, ArrowUpRight, ShieldCheck, Map } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, Badge, Button, LeafDecor } from '../ui'
import { formatPrice } from '../ui/format'
import { plots as initialStaticPlots, searchOptions } from '../../data/site'

/* Single Plot Card inspired directly by reference image */
export function PlotCard({ plot, onEnquire, onViewLayout }) {
  const isAvailable = plot.status === 'Available'
  const isFewLeft = plot.status === 'Few Left'
  const isSoldOut = plot.status === 'Sold Out'
  const hasLayout = Boolean(plot.hasLayoutMap || plot.name === 'Kolapakkam')

  return (
    <div className="plot-card-wrap">
      <div
        className={`plot-card ${hasLayout ? 'plot-card--has-layout' : ''}`}
        onClick={() => {
          if (hasLayout && onViewLayout) {
            onViewLayout(plot)
          }
        }}
        style={hasLayout ? { cursor: 'pointer' } : undefined}
      >
        {/* Plot Image Container */}
        <div className="plot-card__media">
          <img
            src={plot.image || '/images/plot-1.jpg'}
            alt={`${plot.name} residential plot in ${plot.location}`}
            className="plot-card__img"
            loading="lazy"
          />
          {/* Floating Pill Status Badge */}
          <div className="plot-card__badge-row">
            <span
              className={`plot-card__status ${isSoldOut ? 'plot-card__status--sold' : isFewLeft ? 'plot-card__status--warn' : 'plot-card__status--avail'}`}
            >
              <span className="plot-card__status-dot" />
              {isAvailable ? 'Available Plot' : plot.status}
            </span>
            <span className="plot-card__approval-badge">
              <ShieldCheck size={12} /> {plot.approval}
            </span>
          </div>

          {/* Interactive Layout Map Badge */}
          {hasLayout && (
            <Link
              href="/layout-viewer"
              onClick={(e) => e.stopPropagation()}
              className="plot-card__layout-pill"
              style={{ textDecoration: 'none' }}
            >
              <Map size={12} /> Interactive Map
            </Link>
          )}
        </div>

        {/* Plot Information Body */}
        <div className="plot-card__body">
          <div className="plot-card__header-row">
            <div>
              <h3 className="plot-card__title">{plot.name}</h3>
              <p className="plot-card__location">
                <MapPin size={14} /> {plot.location}, Chennai
              </p>
            </div>
            <div className="plot-card__price-box">
              <span className="plot-card__price-label">Starting at</span>
              <span className="plot-card__price-val">{formatPrice(plot.price)}</span>
            </div>
          </div>

          {/* Specifications Pills */}
          <div className="plot-card__specs">
            <Badge tone="soft">
              <Ruler size={13} style={{ display: 'inline', marginRight: 4 }} />
              {plot.area.toLocaleString('en-IN')} sq.ft
            </Badge>
            <Badge tone="soft">
              <Compass size={13} style={{ display: 'inline', marginRight: 4 }} />
              {plot.facing} facing
            </Badge>
          </div>

          {/* Action Row */}
          <div className="plot-card__footer">
            {hasLayout ? (
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <Link
                  href="/layout-viewer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn--primary btn--sm plot-card__cta-btn"
                  style={{ flex: 1.2, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Map size={14} style={{ marginRight: 4 }} /> View Layout SVG
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEnquire(plot)
                  }}
                  className="plot-card__cta-btn"
                  style={{ flex: 0.8 }}
                >
                  Enquire <ArrowUpRight size={13} />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant={isSoldOut ? 'outline' : 'primary'}
                disabled={isSoldOut}
                onClick={(e) => {
                  e.stopPropagation()
                  onEnquire(plot)
                }}
                className="plot-card__cta-btn"
                style={isSoldOut ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                {isSoldOut ? 'Sold Out' : 'Enquire Now'} <ArrowUpRight size={15} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Plots({ filters, onEnquire, onReset }) {
  const sectionRef = useRef(null)
  const router = useRouter()
  const [dbPlots, setDbPlots] = useState(initialStaticPlots)

  // Fetch plot details dynamically from MongoDB
  useEffect(() => {
    let isMounted = true
    fetch('/api/plots')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.plots?.length > 0) {
          setDbPlots(data.plots)
        }
      })
      .catch((err) => {
        console.warn('Could not fetch plots from MongoDB API, using local fallback:', err.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const size = searchOptions.sizes[filters.size] || { min: 0, max: Infinity }
  const budget = searchOptions.budgets[filters.budget] || { min: 0, max: Infinity }

  const hasFilter = Boolean(filters.location || filters.size > 0 || filters.budget > 0)

  // Filter matching plots
  const filtered = dbPlots.filter(
    (p) =>
      (!filters.location || p.location === filters.location) &&
      p.area >= size.min &&
      p.area <= size.max &&
      p.price <= budget.max &&
      p.price >= (budget.min ?? 0),
  )

  // Exactly 4 plot cards featured by default or when available
  const displayList = hasFilter ? filtered : dbPlots.slice(0, 4)

  useGSAP(
    () => {
      if (isReducedMotion()) return

      gsap.from('.plots-sec__header > *', {
        scrollTrigger: {
          trigger: '.plots-sec__header',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })

      gsap.from('.plot-card-wrap', {
        scrollTrigger: {
          trigger: '.plots-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        y: 35,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef, dependencies: [displayList.length] },
  )

  const handleOpenLayout = () => {
    router.push('/layout-viewer')
  }

  return (
    <Section id="plots" className="plots-sec" ref={sectionRef}>
      <LeafDecor variant="laurel" className="plots-sec__leaf" opacity={0.05} style={{ top: 20, right: 20 }} />

      {/* Header Row: Left Title, Right Description matching reference layout */}
      <div className="plots-sec__header">
        <div>
          <span className="eyebrow">Available Plots</span>
          <h2 className="plots-sec__title">
            Find Your Dream Plot<br />
            Today
          </h2>
        </div>
        <div className="plots-sec__desc-box">
          <p className="plots-sec__desc">
            Explore our handpicked, approved residential layouts in the most sought-after prime locations across West Chennai. Every plot is legally vetted and ready for registration.
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/layout-viewer"
              className="btn btn--primary btn--sm"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(10, 92, 54, 0.3)',
                cursor: 'pointer',
              }}
            >
              <Map size={15} /> Explore Interactive Layout Map
            </Link>
          </div>
          {hasFilter && (
            <div className="plots-sec__filter-info">
              <span>Showing filtered results ({displayList.length})</span>
              <button onClick={onReset} className="plots-sec__reset-btn">
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exactly 4 Plot Cards Grid */}
      {displayList.length > 0 ? (
        <div className="plots-grid">
          {displayList.map((p) => (
            <PlotCard
              key={p.id}
              plot={p}
              onEnquire={onEnquire}
              onViewLayout={handleOpenLayout}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>No plots match your selected filters.</p>
          <Button variant="outline" size="sm" onClick={onReset} style={{ marginTop: 16 }}>
            Clear Filters
          </Button>
        </div>
      )}
    </Section>
  )
}

