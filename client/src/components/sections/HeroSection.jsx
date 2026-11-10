'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight, PhoneCall } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'

/**
 * Full-width Video HeroSection Component
 * Features video background with bottom-left positioned heading, subheading, and CTA buttons.
 * @param {string} [heading="Creating Assets. Building Trust. Securing Your Future."]
 * @param {string} [subheading="Discover premium residential plots, agricultural lands and valuable land investment opportunities with Crystal Estates."]
 * @param {string} [className=""]
 */
export default function HeroSection({
  heading = 'Creating Assets. Building Trust. Securing Your Future.',
  subheading = 'Discover premium residential plots, agricultural lands and valuable land investment opportunities with Crystal Estates.',
  className = '',
}) {
  const heroRef = useRef(null)

  // Smooth entrance animation with GSAP
  useGSAP(
    () => {
      if (isReducedMotion()) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero-ref__title', {
        y: 28,
        opacity: 0,
        duration: 0.9,
      })
        .from(
          '.hero-ref__lead',
          {
            y: 18,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.5',
        )
        .from(
          '.hero-ref__cta-group',
          {
            y: 16,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.4',
        )
    },
    { scope: heroRef },
  )

  return (
    <section id="home" className={`hero-ref hero-ref--fullwidth ${className}`.trim()} ref={heroRef}>
      {/* Background Video */}
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

      {/* Cinematic Gradient Scrim for Bottom-Left Text Legibility */}
      <div className="hero-ref__gradient-overlay" aria-hidden="true" />

      {/* Hero Content Placed in Bottom-Left Corner */}
      <div className="hero-ref__content">
        <h1 className="hero-ref__title">{heading}</h1>

        {subheading && (
          <p className="hero-ref__lead">{subheading}</p>
        )}

        {/* Buttons: Explore Projects & Contact Our Team */}
        <div className="hero-ref__cta-group">
          <Link href="/projects" className="hero-ref__primary-btn">
            <span>Explore Projects</span>
            <span className="hero-ref__btn-icon">
              <ArrowUpRight size={15} />
            </span>
          </Link>

          <Link href="/contact" className="hero-ref__gold-btn">
            <PhoneCall size={15} />
            <span>Contact Our Team</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
