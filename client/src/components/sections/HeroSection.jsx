'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'

/**
 * Homepage Hero Section redesigned to strictly match the reference image:
 * - Existing background video preserved
 * - Bottom-left huge editorial display typography ("We help / families / find home")
 * - Bottom-right floating translucent glass card with preview thumbnail and full-width action button
 * - Seamless transparent navigation support
 * - Fully responsive across all devices
 */
export default function HeroSection({
  line1 = 'We help',
  line2 = 'families',
  line3 = 'find',
  italicWord = 'home',
  cardTag = 'About Crystal',
  cardDescription = "We're the pulse of Chennai, shaping its land legacy.",
  cardActionText = 'Explore now',
  cardActionHref = '/projects',
  cardImage = '/images/vedanthangal.jpg',
  className = '',
}) {
  const heroRef = useRef(null)

  // Smooth entrance animation using base deceleration curve
  useGSAP(
    () => {
      if (isReducedMotion()) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero-ref__title-line', {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
      }).from(
        '.hero-ref__widget-card',
        {
          y: 30,
          opacity: 0,
          duration: 0.8,
        },
        '-=0.5'
      )
    },
    { scope: heroRef }
  )

  const handleOpenSiteVisit = (e) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-site-visit'))
    }
  }

  return (
    <section id="home" className={`hero-ref hero-ref--stellar ${className}`.trim()} ref={heroRef}>
      {/* Existing Background Video Preserved 100% */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/images/hero-estate.jpg"
        className="hero-ref__video"
        aria-hidden="true"
        suppressHydrationWarning
      >
        <source
          src="https://res.cloudinary.com/rlokioxu/video/upload/v1793966711/13282387_3840_2160_60fps_online-video-cutter.com_qarfsk.mp4"
          type="video/mp4"
        />
      </video>

      {/* Cinematic Contrast Scrim for Transparent Top Nav & Bottom Content */}
      <div className="hero-ref__gradient-overlay" aria-hidden="true" />

      {/* Content Container (Anchored at Bottom Row) */}
      <div className="hero-ref__container">
        <div className="hero-ref__row">
          {/* Left Side: Large Bold Display Typography */}
          <div className="hero-ref__headline-block">
            <h1 className="hero-ref__display-title">
              <span className="hero-ref__title-line">{line1}</span>
              <span className="hero-ref__title-line">{line2}</span>
              <span className="hero-ref__title-line hero-ref__title-line--combo">
                {line3} <em className="hero-ref__italic-serif">{italicWord}</em>
              </span>
            </h1>
          </div>

          {/* Right Side: Floating Glass Widget Card */}
          <div className="hero-ref__widget-card">
            <div className="hero-ref__widget-header">
              <span className="hero-ref__widget-tag">{cardTag}</span>
              <p className="hero-ref__widget-desc">{cardDescription}</p>
            </div>

            <div className="hero-ref__widget-thumb">
              <Image
                src={cardImage}
                alt="Featured Chennai Land Asset"
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="hero-ref__widget-img"
                priority
              />
              <button
                type="button"
                onClick={handleOpenSiteVisit}
                className="hero-ref__widget-zoom-btn"
                aria-label="Schedule site visit inspection"
                title="Schedule site inspection"
              >
                <ArrowUpRight size={14} />
              </button>
            </div>

            <Link href={cardActionHref} className="hero-ref__widget-action-btn">
              {cardActionText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
