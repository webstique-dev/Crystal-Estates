'use client'

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Container, SectionHeading } from './ui'
import defaultTestimonials from '../data/testimonials'

/**
 * Reusable TestimonialsSection Component
 * @param {string|React.ReactNode} [title="What Our Landowners Say"]
 * @param {string|React.ReactNode} [subtitle]
 * @param {number} [limit] - Maximum items to show
 * @param {"slider"|"grid"} [variant="slider"] - Layout presentation
 * @param {string} [className=""]
 */
export function TestimonialsSection({
  title = 'What Our Landowners Say',
  subtitle = 'Verified experiences from families and investors who have built lasting land assets with Crystal Estates across Chennai & Kanchipuram.',
  limit,
  variant = 'slider',
  className = '',
}) {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(3)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Detect Reduced Motion preference using recommended subscription idiom
  const prefersReducedMotion = useSyncExternalStore(
    (notify) => {
      if (typeof window === 'undefined') return () => {}
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener('change', notify)
      return () => mq.removeEventListener('change', notify)
    },
    () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false),
    () => false
  )

  const touchStartX = useRef(null)
  const touchEndX = useRef(null)
  const sliderRef = useRef(null)

  // 1. Data Fetching: Check backend endpoint first, fallback to /client/data/testimonials.js
  useEffect(() => {
    let isMounted = true

    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials', {
          headers: { Accept: 'application/json' },
        })

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`)
        }

        const data = await res.json()
        const items = Array.isArray(data)
          ? data
          : data?.testimonials || data?.data || []

        if (isMounted) {
          if (items.length > 0) {
            setTestimonials(items)
          } else {
            setTestimonials(defaultTestimonials)
          }
        }
      } catch {
        // Fallback to local realistic sample data
        if (isMounted) {
          setTestimonials(defaultTestimonials)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTestimonials()

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Responsive cardsPerView detector: 1 on mobile, 2 on tablet, 3 on desktop
  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth
      if (width < 768) {
        setCardsPerView(1)
      } else if (width < 1024) {
        setCardsPerView(2)
      } else {
        setCardsPerView(3)
      }
    }

    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView, { passive: true })
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  // Slice if limit prop is provided
  const items = limit ? testimonials.slice(0, limit) : testimonials
  const maxIndex = Math.max(0, items.length - cardsPerView)
  // Clamp index purely during render to avoid cascading effect renders
  const safeIndex = Math.min(currentIndex, maxIndex)

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  // 4. Autoplay (5 seconds) with pause on hover, focus, and reduced motion
  useEffect(() => {
    if (
      variant !== 'slider' ||
      loading ||
      items.length <= cardsPerView ||
      isHovered ||
      isFocused ||
      prefersReducedMotion
    ) {
      return
    }

    const timer = setInterval(() => {
      goNext()
    }, 5000)

    return () => clearInterval(timer)
  }, [
    variant,
    loading,
    items.length,
    cardsPerView,
    isHovered,
    isFocused,
    prefersReducedMotion,
    goNext,
  ])

  // 5. Touch swipe event handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    const threshold = 40
    if (diff > threshold) {
      goNext()
    } else if (diff < -threshold) {
      goPrev()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  // 6. Keyboard navigation (ArrowLeft & ArrowRight)
  const handleKeyDown = (e) => {
    if (variant !== 'slider') return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goNext()
    }
  }

  // Helper for Initials
  const getInitials = (name) => {
    if (!name) return 'CE'
    const parts = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  // 7. Loading state: Render accessible skeletons
  if (loading) {
    return (
      <section className={`section testimonials-section ${className}`.trim()} aria-busy="true">
        <Container>
          <SectionHeading eyebrow="TESTIMONIALS" title={title} subtitle={subtitle} center />
          <div className="testimonials-skeleton-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="testimonial-card testimonial-card--skeleton">
                <div className="testimonial-card__skeleton-header">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-stars" />
                </div>
                <div className="skeleton-line skeleton-line--long" />
                <div className="skeleton-line skeleton-line--mid" />
                <div className="skeleton-line skeleton-line--short" />
                <div className="skeleton-footer">
                  <div className="skeleton-name" />
                  <div className="skeleton-sub" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  // 8. Hidden state: If no testimonials exist, hide section completely
  if (!items || items.length === 0) {
    return null
  }

  const gap = 24 // px gap between cards
  const slideOffset = `calc(-${safeIndex} * ((100% + ${gap}px) / ${cardsPerView}))`

  return (
    <section
      id="testimonials"
      className={`section testimonials-section ${className}`.trim()}
      aria-label="Landowner Testimonials"
    >
      <Container>
        <div className="testimonials-section__header-row">
          <SectionHeading
            eyebrow="CLIENT EXPERIENCES"
            title={title}
            subtitle={subtitle}
            center={variant === 'grid'}
          />

          {variant === 'slider' && items.length > cardsPerView && (
            <div className="testimonials-controls" aria-label="Slider Controls">
              <button
                type="button"
                onClick={goPrev}
                className="testimonials-control-btn"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="testimonials-control-btn"
                aria-label="Next testimonial"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Presentation: Slider Variant */}
        {variant === 'slider' ? (
          <div
            className="testimonials-slider-viewport"
            ref={sliderRef}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer Testimonials Carousel"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
          >
            <div
              className={`testimonials-slider-track ${
                prefersReducedMotion ? 'testimonials-slider-track--reduced' : ''
              }`}
              style={{
                transform: `translateX(${slideOffset})`,
              }}
            >
              {items.map((item, idx) => (
                <article
                  key={item.id || idx}
                  className="testimonial-card"
                  style={{
                    flex: `0 0 calc((100% - ${(cardsPerView - 1) * gap}px) / ${cardsPerView})`,
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} of ${items.length}`}
                >
                  <div className="testimonial-card__header">
                    <div className="testimonial-card__stars" aria-label={`${item.rating || 5} out of 5 stars`}>
                      {[...Array(item.rating || 5)].map((_, sIdx) => (
                        <Star key={sIdx} size={16} className="star-icon star-icon--filled" />
                      ))}
                    </div>
                    <div className="testimonial-card__quote-icon" aria-hidden="true">
                      <Quote size={20} />
                    </div>
                  </div>

                  <blockquote className="testimonial-card__quote">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>

                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <span
                        className="testimonial-card__avatar-fallback"
                        style={{ display: item.photo ? 'none' : 'flex' }}
                      >
                        {getInitials(item.name)}
                      </span>
                    </div>

                    <div className="testimonial-card__meta">
                      <h4 className="testimonial-card__name">{item.name}</h4>
                      <p className="testimonial-card__location">{item.location}</p>
                      <span className="testimonial-card__project-badge">
                        {item.project}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Dots */}
            {items.length > cardsPerView && (
              <div className="testimonials-dots" role="tablist" aria-label="Slider Pagination">
                {Array.from({ length: maxIndex + 1 }).map((_, dIdx) => (
                  <button
                    key={dIdx}
                    type="button"
                    role="tab"
                    aria-selected={safeIndex === dIdx}
                    aria-label={`Go to slide ${dIdx + 1}`}
                    className={`testimonials-dot ${
                      safeIndex === dIdx ? 'testimonials-dot--active' : ''
                    }`}
                    onClick={() => setCurrentIndex(dIdx)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Presentation: Grid Variant */
          <div className="testimonials-grid">
            {items.map((item, idx) => (
              <article key={item.id || idx} className="testimonial-card">
                <div className="testimonial-card__header">
                  <div className="testimonial-card__stars" aria-label={`${item.rating || 5} out of 5 stars`}>
                    {[...Array(item.rating || 5)].map((_, sIdx) => (
                      <Star key={sIdx} size={16} className="star-icon star-icon--filled" />
                    ))}
                  </div>
                  <div className="testimonial-card__quote-icon" aria-hidden="true">
                    <Quote size={20} />
                  </div>
                </div>

                <blockquote className="testimonial-card__quote">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">
                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <span
                      className="testimonial-card__avatar-fallback"
                      style={{ display: item.photo ? 'none' : 'flex' }}
                    >
                      {getInitials(item.name)}
                    </span>
                  </div>

                  <div className="testimonial-card__meta">
                    <h4 className="testimonial-card__name">{item.name}</h4>
                    <p className="testimonial-card__location">{item.location}</p>
                    <span className="testimonial-card__project-badge">
                      {item.project}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}

export default TestimonialsSection
