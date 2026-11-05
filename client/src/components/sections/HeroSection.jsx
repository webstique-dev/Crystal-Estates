'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Search, PhoneCall, ShieldCheck, CheckCircle2, Sparkles, MapPin, Layers } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Container, Button, Field, LeafDecor } from '../ui'
import { searchOptions } from '../../data/site'

/**
 * Reusable HeroSection Component
 * @param {string} [heading="Own Land You Can Trust"]
 * @param {string} [subtext="Verified plots and farmland around Chennai with clear titles and complete documentation."]
 * @param {function} [onSearch] - Search callback ({ type, location, budget })
 * @param {string} [className=""]
 */
export default function HeroSection({
  heading = 'Own Land You Can Trust',
  subtext = 'Verified plots and farmland around Chennai with clear titles and complete documentation.',
  onSearch,
  className = '',
}) {
  const router = useRouter()
  const [type, setType] = useState('All')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState(0)
  const heroRef = useRef(null)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch({ type, location, budget })
    }
    const params = new URLSearchParams()
    if (type && type !== 'All') params.set('type', type)
    if (location) params.set('location', location)
    if (budget) params.set('budget', budget)
    const query = params.toString() ? `?${params.toString()}` : ''
    router.push(`/projects${query}`)
  }

  // Smooth entrance animations with GSAP
  useGSAP(
    () => {
      if (isReducedMotion()) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero-ref__bg-img', {
        scale: 1.05,
        opacity: 0.85,
        duration: 1.0,
      })
        .from(
          '.hero-ref__eyebrow',
          {
            y: -12,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.7',
        )
        .from(
          '.hero-ref__title',
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.5',
        )
        .from(
          '.hero-ref__lead',
          {
            y: 12,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.4',
        )
        .from(
          '.hero-ref__cta-group',
          {
            y: 12,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.3',
        )
        .from(
          '.hero-search',
          {
            y: 16,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.3',
        )
    },
    { scope: heroRef },
  )

  return (
    <section id="home" className={`hero-ref ${className}`.trim()} ref={heroRef}>
      <LeafDecor variant="branch" className="hero-ref__leaf hero-ref__leaf--top-right" opacity={0.08} />

      <Container className="hero-ref__container">
        {/* Architectural Hero Frame */}
        <div className="hero-ref__frame">
          <Image
            src="/images/vedanthangal.jpg"
            alt="Crystal Estates Land Assets Chennai"
            fill
            sizes="100vw"
            className="hero-ref__bg-img"
            priority
          />
          <div className="hero-ref__gradient-overlay" />

          {/* Centered Hero Content */}
          <div className="hero-ref__content">
            <div className="hero-ref__eyebrow">
              <Sparkles size={13} className="hero-ref__eyebrow-icon" />
              <span>ASSETS CREATOR • CHENNAI & KANCHIPURAM</span>
            </div>

            <h1 className="hero-ref__title">{heading}</h1>

            <p className="hero-ref__lead">{subtext}</p>

            {/* Two CTA Buttons: "View Projects" and "Talk to an Expert" */}
            <div className="hero-ref__cta-group">
              <Link href="/projects" className="hero-ref__primary-btn">
                <span>View Projects</span>
                <span className="hero-ref__btn-icon">
                  <ArrowUpRight size={15} />
                </span>
              </Link>

              <Link href="/contact" className="hero-ref__gold-btn">
                <PhoneCall size={15} />
                <span>Talk to an Expert</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Search Bar: Type (Residential / Agricultural), Location, Budget */}
        <form className="hero-search" onSubmit={handleSearchSubmit} role="search" aria-label="Land Search">
          <div className="hero-search__grid">
            <Field label="Land Type">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="Select Land Type"
              >
                <option value="All">All Types (Plots & Farm)</option>
                <option value="Residential Plot">Residential Plots</option>
                <option value="Farm Land">Agricultural / Farm Land</option>
              </select>
            </Field>

            <Field label="Location">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Select Location"
              >
                <option value="">All Locations</option>
                {searchOptions.locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Budget Range">
              <select
                value={budget}
                onChange={(e) => setBudget(+e.target.value)}
                aria-label="Select Budget Range"
              >
                {searchOptions.budgets.map((b, i) => (
                  <option key={b.label} value={i}>
                    {b.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="hero-search__action">
              <Button type="submit" variant="primary" block>
                <Search size={17} />
                <span>Search Land</span>
              </Button>
            </div>
          </div>

          <div className="hero-search__trust">
            <span>
              <ShieldCheck size={16} /> 100% Legal Title Verification
            </span>
            <span>
              <CheckCircle2 size={16} /> DTCP & CMDA Approved Layouts
            </span>
            <span>
              <CheckCircle2 size={16} /> Managed Sandalwood Farmland
            </span>
            <span>
              <CheckCircle2 size={16} /> Spot Registration & Patta
            </span>
          </div>
        </form>
      </Container>
    </section>
  )
}

