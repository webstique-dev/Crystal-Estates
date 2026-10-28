import { useRef } from 'react'
import { MapPin, Compass, Ruler, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, Badge, Button, LeafDecor } from '../ui'
import { formatPrice } from '../ui/format'
import { plots, searchOptions } from '../../data/site'

/* Single Plot Card inspired directly by reference image */
export function PlotCard({ plot, onEnquire }) {
  const isAvailable = plot.status === 'Available'
  const isFewLeft = plot.status === 'Few Left'
  const isSoldOut = plot.status === 'Sold Out'

  return (
    <div className="plot-card-wrap">
      <div className="plot-card">
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
            <span className={`plot-card__status ${isSoldOut ? 'plot-card__status--sold' : isFewLeft ? 'plot-card__status--warn' : 'plot-card__status--avail'}`}>
              <span className="plot-card__status-dot" />
              {isAvailable ? 'Available Plot' : plot.status}
            </span>
            <span className="plot-card__approval-badge">
              <ShieldCheck size={12} /> {plot.approval}
            </span>
          </div>
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
            <Button
              size="sm"
              variant={isSoldOut ? 'outline' : 'primary'}
              disabled={isSoldOut}
              onClick={() => onEnquire(plot)}
              className="plot-card__cta-btn"
              style={isSoldOut ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            >
              {isSoldOut ? 'Sold Out' : 'Enquire Now'} <ArrowUpRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Plots({ filters, onEnquire, onReset }) {
  const sectionRef = useRef(null)
  const size = searchOptions.sizes[filters.size] || { min: 0, max: Infinity }
  const budget = searchOptions.budgets[filters.budget] || { min: 0, max: Infinity }
  
  const hasFilter = Boolean(filters.location || filters.size > 0 || filters.budget > 0)

  // Filter matching plots from the existing data source
  const filtered = plots.filter((p) =>
    (!filters.location || p.location === filters.location) &&
    p.area >= size.min && p.area <= size.max &&
    p.price <= budget.max && p.price >= (budget.min ?? 0),
  )

  // Exactly 4 plot cards featured by default or when available
  const displayList = hasFilter ? filtered : plots.slice(0, 4)

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
          {hasFilter && (
            <div className="plots-sec__filter-info">
              <span>Showing filtered results ({displayList.length})</span>
              <button onClick={onReset} className="plots-sec__reset-btn">Reset Filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Exactly 4 Plot Cards Grid */}
      {displayList.length > 0 ? (
        <div className="plots-grid">
          {displayList.map((p) => (
            <PlotCard key={p.id} plot={p} onEnquire={onEnquire} />
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
