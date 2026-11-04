'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Eye, Calendar } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, SectionHeading, LeafDecor } from '../ui'
import { galleryItems } from '../../data/site'

const categories = ['All', 'Aerial', 'Plantation', 'Layouts', 'Site', 'Events']

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('All')
  const [activeModalIdx, setActiveModalIdx] = useState(null)
  const sectionRef = useRef(null)

  const filteredItems = activeTab === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeTab)

  const openLightbox = (index) => {
    setActiveModalIdx(index)
  }

  const closeLightbox = useCallback(() => {
    setActiveModalIdx(null)
  }, [])

  const nextLightbox = useCallback(() => {
    if (activeModalIdx === null) return
    setActiveModalIdx((prev) => (prev + 1) % filteredItems.length)
  }, [activeModalIdx, filteredItems.length])

  const prevLightbox = useCallback(() => {
    if (activeModalIdx === null) return
    setActiveModalIdx((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
  }, [activeModalIdx, filteredItems.length])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activeModalIdx === null) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
      if (e.key === 'ArrowLeft') prevLightbox()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeModalIdx, closeLightbox, nextLightbox, prevLightbox])

  useGSAP(
    () => {
      if (isReducedMotion()) return

      gsap.from('.gallery-sec .heading', {
        scrollTrigger: {
          trigger: '.gallery-sec .heading',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      gsap.from('.gallery-filters', {
        scrollTrigger: {
          trigger: '.gallery-filters',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 15,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      })

      gsap.from('.gallery-card', {
        scrollTrigger: {
          trigger: '.gallery-grid',
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
    { scope: sectionRef, dependencies: [filteredItems.length] },
  )

  const activeItem = activeModalIdx !== null ? filteredItems[activeModalIdx] : null

  return (
    <Section id="gallery" className="gallery-sec" ref={sectionRef}>
      <LeafDecor variant="branch" className="gallery-sec__leaf" opacity={0.05} style={{ top: 20, right: 30 }} />

      <SectionHeading
        center
        eyebrow="Visual Portfolio"
        title="Project Gallery & Drone Footage"
        text="A curated look into our 15-acre sandalwood farmland, completed residential parcels, and guided site visits across Chennai."
      />

      {/* Category Tabs - High contrast, perfectly centered and responsive */}
      <div className="gallery-filters" role="tablist">
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

      {/* 6-Card Image Grid */}
      <div className="gallery-grid">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            className="gallery-card"
            onClick={() => openLightbox(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openLightbox(idx)
              }
            }}
          >
            <div className="gallery-card__media">
              <img
                src={item.image}
                alt={item.title}
                className="gallery-card__img"
                loading="lazy"
              />
              <span className="gallery-card__category">{item.category}</span>
              <div className="gallery-card__overlay">
                <span className="gallery-card__zoom-btn">
                  <Eye size={18} /> View Image
                </span>
              </div>
            </div>
            <div className="gallery-card__info">
              <h4 className="gallery-card__title">{item.title}</h4>
              <p className="gallery-card__caption">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="gallery-cta">
        <span>Want to experience our lands in person?</span>
        <a href="#contact" className="btn btn--gold btn--sm">
          <Calendar size={14} /> Book a Free Site Visit
        </a>
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <div className="gallery-lightbox__dialog" onClick={(e) => e.stopPropagation()}>
            <button
              className="gallery-lightbox__close"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>

            <button
              className="gallery-lightbox__nav gallery-lightbox__nav--prev"
              onClick={prevLightbox}
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              className="gallery-lightbox__nav gallery-lightbox__nav--next"
              onClick={nextLightbox}
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>

            <div className="gallery-lightbox__content">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                className="gallery-lightbox__img"
              />
              <div className="gallery-lightbox__details">
                <div className="gallery-lightbox__header">
                  <span className="gallery-lightbox__badge">{activeItem.category}</span>
                  <span className="gallery-lightbox__counter">
                    {activeModalIdx + 1} of {filteredItems.length}
                  </span>
                </div>
                <h3>{activeItem.title}</h3>
                <p>{activeItem.caption}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}
