'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, ArrowUpRight, Map, Sparkles, Download, Calendar, CheckCircle2 } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, SectionHeading, LeafDecor } from '../ui'
import { formatPrice } from '../ui/format'
import { projects as staticProjects } from '../../data/site'

const categories = ['All', 'Farm Lands', 'Residential Plots']

export function PlotCard({ plot, onEnquire }) {
  const isAvailable = plot.status === 'Available' || plot.status === 'Booking Open'
  const isFewLeft = plot.status === 'Few Left'
  const isSoldOut = plot.status === 'Sold Out'
  const hasLayout = Boolean(plot.hasLayoutMap || plot.name === 'Kolapakkam')

  return (
    <div className="gallery-card plot-gallery-card">
      {/* Media with Category and Status Badges */}
      <div className="gallery-card__media">
        <img
          src={plot.image || '/images/plot-1.jpg'}
          alt={`${plot.name} ${plot.type || 'plot'} in ${plot.location}`}
          className="gallery-card__img"
          loading="lazy"
        />
        <span className="gallery-card__category">{plot.approval || plot.type}</span>
        <span className={`plot-gallery-card__status ${isSoldOut ? 'plot-gallery-card__status--sold' : isFewLeft ? 'plot-gallery-card__status--warn' : 'plot-gallery-card__status--avail'}`}>
          <span className="plot-gallery-card__dot" />
          {isAvailable ? 'Available' : plot.status}
        </span>
      </div>

      {/* Card Info matching Gallery card layout */}
      <div className="gallery-card__info plot-gallery-card__info">
        <div className="plot-gallery-card__title-row">
          <h4 className="gallery-card__title plot-gallery-card__title">{plot.name}</h4>
          <span className="plot-gallery-card__price">
            {plot.priceDisplay || formatPrice(plot.price)}
          </span>
        </div>

        <p className="gallery-card__caption plot-gallery-card__specs">
          {plot.location}, Chennai • {typeof plot.area === 'number' ? `${plot.area.toLocaleString('en-IN')} sq.ft` : plot.area}
          {plot.facing ? ` • ${plot.facing} facing` : (plot.plotSizes ? ` • ${plot.plotSizes}` : '')}
        </p>

        {/* Clean, Uncluttered CTA Row */}
        <div className="plot-gallery-card__actions">
          {hasLayout ? (
            <>
              <Link
                href="/layout-viewer"
                className="btn btn--primary btn--sm plot-gallery-card__btn-main"
              >
                <Map size={14} /> View Layout Map
              </Link>
              <button
                type="button"
                onClick={() => onEnquire(plot)}
                className="btn btn--outline btn--sm plot-gallery-card__btn-sub"
              >
                Enquire
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={isSoldOut}
              onClick={() => onEnquire(plot)}
              className="btn btn--primary btn--sm btn--block"
              style={isSoldOut ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            >
              {isSoldOut ? 'Sold Out' : 'Enquire Now'} <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Plots({ filters = {}, onEnquire, onReset }) {
  const sectionRef = useRef(null)
  const [dbPlots, setDbPlots] = useState(staticProjects)
  const [activeTab, setActiveTab] = useState('All')
  const [downloadModal, setDownloadModal] = useState(false)
  const [brochureLead, setBrochureLead] = useState({ name: '', phone: '' })
  const [brochureDownloaded, setBrochureDownloaded] = useState(false)

  // Fetch plot details dynamically from MongoDB
  useEffect(() => {
    let isMounted = true
    fetch('/api/plots')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.plots?.length > 0) {
          const flagship = staticProjects.find((p) => p.isFlagship)
          const merged = flagship ? [flagship, ...data.plots.filter((p) => !p.isFlagship)] : data.plots
          setDbPlots(merged)
        }
      })
      .catch((err) => {
        console.warn('Could not fetch plots from MongoDB API, using local fallback:', err.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const flagshipProject = dbPlots.find((p) => p.isFlagship) || staticProjects[0]
  const residentialPlots = dbPlots.filter((p) => !p.isFlagship)

  // Filter based on active tab
  let displayList = residentialPlots
  if (activeTab === 'Farm Lands') {
    displayList = flagshipProject ? [flagshipProject] : []
  } else if (activeTab === 'Residential Plots') {
    displayList = residentialPlots
  }

  // Filter based on search props if provided
  if (filters?.location) {
    displayList = displayList.filter((p) => p.location.toLowerCase().includes(filters.location.toLowerCase()))
  }

  useGSAP(
    () => {
      if (isReducedMotion()) return

      gsap.from('.plots-sec .heading', {
        scrollTrigger: {
          trigger: '.plots-sec .heading',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      gsap.from('.plots-tab-bar', {
        scrollTrigger: {
          trigger: '.plots-tab-bar',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 15,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      })

      gsap.from('.plot-gallery-card', {
        scrollTrigger: {
          trigger: '.plots-gallery-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef, dependencies: [displayList.length, activeTab] },
  )

  const handleBrochureSubmit = (e) => {
    e.preventDefault()
    setBrochureDownloaded(true)
    setTimeout(() => {
      setDownloadModal(false)
      setBrochureDownloaded(false)
      window.open('/images/vedanthangal.jpg', '_blank')
    }, 1500)
  }

  return (
    <Section id="projects" className="plots-sec" ref={sectionRef}>
      <span id="plots" style={{ position: 'relative', top: '-100px', visibility: 'hidden' }} />
      <LeafDecor variant="laurel" className="plots-sec__leaf" opacity={0.05} style={{ top: 20, right: 20 }} />

      {/* Flagship Featured Project Spotlight */}
      {flagshipProject && (
        <div className="flagship-card">
          <div className="flagship-card__grid">
            <div className="flagship-card__media">
              <img
                src={flagshipProject.image || '/images/vedanthangal.jpg'}
                alt={flagshipProject.name}
                className="flagship-card__img"
                loading="eager"
              />
              <div className="flagship-card__badge-tag">
                <Sparkles size={14} /> Flagship Farm Land • 15 Acres
              </div>
            </div>

            <div className="flagship-card__content">
              <div className="flagship-card__header">
                <span className="eyebrow" style={{ marginBottom: 6 }}>Featured Project</span>
                <h3 className="flagship-card__title">{flagshipProject.name}</h3>
                <p className="flagship-card__location">
                  <MapPin size={15} /> {flagshipProject.location}
                </p>
              </div>

              <p className="flagship-card__desc">
                {flagshipProject.description}
              </p>

              {/* Highlights List */}
              <div className="flagship-card__highlights">
                {flagshipProject.highlights?.map((h, i) => (
                  <div key={i} className="flagship-card__highlight-item">
                    <CheckCircle2 size={14} className="flagship-card__check" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flagship-card__actions">
                <button
                  type="button"
                  onClick={() => setDownloadModal(true)}
                  className="btn btn--gold btn--sm"
                >
                  <Download size={15} /> Download Brochure
                </button>

                <button
                  type="button"
                  onClick={() => onEnquire(flagshipProject)}
                  className="btn btn--primary btn--sm"
                >
                  <Calendar size={15} /> Book Site Visit
                </button>

                <Link
                  href="/layout-viewer"
                  className="btn btn--outline btn--sm"
                >
                  <Map size={15} /> View Master Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Heading matching Gallery layout */}
      <SectionHeading
        center
        eyebrow="Available Approved Plots"
        title="Find Your Dream Plot Today"
        text="Explore our handpicked, approved residential layouts in the most sought-after prime locations across West Chennai. Every plot is legally vetted and ready for registration."
      />

      {/* Filter Tabs matching Gallery Tab style & alignment */}
      <div className="plots-tab-bar">
        <div className="gallery-filters plots-filters" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeTab === cat}
              className={`gallery-filter-pill ${activeTab === cat ? 'gallery-filter-pill--active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Explore Interactive Layout Map Link Pill */}
        <Link
          href="/layout-viewer"
          className="plots-map-cta-pill"
        >
          <Map size={14} /> Explore Interactive Layout Map
        </Link>
      </div>

      {/* Plots Card Grid matching Gallery visual consistency */}
      {displayList.length > 0 ? (
        <div className="gallery-grid plots-gallery-grid">
          {displayList.map((p) => (
            <PlotCard
              key={p.id}
              plot={p}
              onEnquire={onEnquire}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>No plots found matching your criteria.</p>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => {
              setActiveTab('All')
              if (onReset) onReset()
            }}
            style={{ marginTop: 16 }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Brochure Modal */}
      {downloadModal && (
        <div className="brochure-modal" onClick={() => setDownloadModal(false)}>
          <div className="brochure-modal__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="brochure-modal__header">
              <span className="eyebrow" style={{ marginBottom: 4 }}>Official Brochure</span>
              <h3>Download Project Brochure</h3>
              <p>Please enter your contact details to download the complete 15-Acre Vedanthangal Sandalwood Farm Land brochure & layout map.</p>
            </div>

            {brochureDownloaded ? (
              <div className="brochure-modal__success">
                <CheckCircle2 size={36} color="var(--green-600)" />
                <h4>Thank you!</h4>
                <p>Downloading brochure now...</p>
              </div>
            ) : (
              <form onSubmit={handleBrochureSubmit} className="brochure-modal__form">
                <div className="brochure-modal__field">
                  <label>Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your name"
                    value={brochureLead.name}
                    onChange={(e) => setBrochureLead({ ...brochureLead, name: e.target.value })}
                  />
                </div>
                <div className="brochure-modal__field">
                  <label>Mobile Number (for WhatsApp copy)</label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 98400 12345"
                    pattern="[0-9+\s]{10,15}"
                    value={brochureLead.phone}
                    onChange={(e) => setBrochureLead({ ...brochureLead, phone: e.target.value })}
                  />
                </div>
                <div className="brochure-modal__actions">
                  <button type="submit" className="btn btn--gold btn--block">
                    <Download size={15} /> Download PDF Now
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm btn--block"
                    onClick={() => setDownloadModal(false)}
                    style={{ marginTop: 8 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Section>
  )
}
