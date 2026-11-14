'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Container } from '../ui'
import { isReducedMotion } from '../../lib/gsap'

/**
 * Mandatory Tagline Reveal Section per landing-page-design B11
 * Separate from the hero. Large typography where words transition individually
 * from 28% muted opacity to 100% full text color on scroll.
 */
export default function TaglineReveal({
  eyebrow = 'THE ASSET PROMISE',
  text = 'Creating enduring land assets through complete legal transparency, pristine documentation, and guided ownership across Chennai.',
}) {
  const containerRef = useRef(null)
  const [activeWordIndex, setActiveWordIndex] = useState(-1)
  const [reduced, setReduced] = useState(false)

  const words = text.split(' ')

  useEffect(() => {
    if (isReducedMotion()) {
      setReduced(true)
      setActiveWordIndex(words.length)
      return
    }

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return
          const rect = containerRef.current.getBoundingClientRect()
          const windowHeight = window.innerHeight

          // Section entry progress from bottom 80% to top 25% of viewport
          const start = windowHeight * 0.82
          const end = windowHeight * 0.28
          const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)))

          const targetIndex = Math.floor(progress * words.length)
          setActiveWordIndex(targetIndex)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [words.length])

  return (
    <section className="tagline-reveal-section" ref={containerRef}>
      <Container>
        <div className="tagline-reveal-wrap">
          {eyebrow && (
            <span className="tagline-reveal-eyebrow caption-3">
              {eyebrow}
            </span>
          )}

          <h2 className="tagline-reveal-heading heading-2">
            {words.map((word, idx) => {
              const isRevealed = reduced || idx <= activeWordIndex
              return (
                <span
                  key={`${word}-${idx}`}
                  className={`tagline-word ${isRevealed ? 'tagline-word--active' : ''}`}
                >
                  {word}{' '}
                </span>
              )
            })}
          </h2>

          <div className="tagline-reveal-meta body-4">
            <span>Direct sub registrar execution</span>
            <span className="tagline-meta-dot">·</span>
            <span>Zero encumbrances</span>
            <span className="tagline-meta-dot">·</span>
            <span>Dedicated land advisory</span>
          </div>
        </div>
      </Container>
    </section>
  )
}

