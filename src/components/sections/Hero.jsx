'use client'

import { useState, useRef } from 'react'
import { ArrowUpRight, Search, ShieldCheck, CheckCircle2, Sparkles, Map } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Container, Button, Field, LeafDecor } from '../ui'
import { searchOptions } from '../../data/site'

export default function Hero({ onSearch }) {
  const [loc, setLoc] = useState('')
  const [size, setSize] = useState(0)
  const [budget, setBudget] = useState(0)
  const heroRef = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    onSearch({ location: loc, size, budget })
    document.getElementById('plots')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Refined GSAP Entrance Timeline
  useGSAP(
    () => {
      if (isReducedMotion()) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero-ref__bg-img', {
        scale: 1.06,
        opacity: 0.85,
        duration: 1.0,
      })
        .from(
          '.hero-ref__eyebrow',
          {
            y: -14,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.7',
        )
        .from(
          '.hero-ref__title',
          {
            y: 24,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.5',
        )
        .from(
          '.hero-ref__lead',
          {
            y: 14,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.4',
        )
        .from(
          '.hero-ref__cta-group',
          {
            y: 14,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.3',
        )
        .from(
          '.hero-ref__highlights',
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
            y: 18,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.3',
        )
    },
    { scope: heroRef },
  )

  return (
    <section id="home" className="hero-ref" ref={heroRef}>
      <LeafDecor variant="branch" className="hero-ref__leaf hero-ref__leaf--top-right" opacity={0.08} />

      <Container className="hero-ref__container">
        {/* Simple, Neat & Clean Architectural Hero Card */}
        <div className="hero-ref__frame">
          <img
            src="/images/hero-estate.jpg"
            alt="Luxury modern estate villa and plots"
            className="hero-ref__bg-img"
            loading="eager"
            fetchPriority="high"
          />
          <div className="hero-ref__gradient-overlay" />

          {/* Centered, Uncluttered Hero Content */}
          <div className="hero-ref__content">
            <div className="hero-ref__eyebrow">
              <Sparkles size={13} className="hero-ref__eyebrow-icon" />
              <span>DTCP & CMDA Approved • West Chennai</span>
            </div>

            <h1 className="hero-ref__title">
              Plots You Can Trust.<br />
              Land to Build Your Future On.
            </h1>

            <p className="hero-ref__lead">
              Clear marketable titles, transparent documentation, and guided site visits across prime West Chennai locations including Kolapakkam, Somamangalam & Brammadesam.
            </p>

            <div className="hero-ref__cta-group">
              <a href="#plots" className="hero-ref__primary-btn">
                <span>DISCOVER PLOTS</span>
                <span className="hero-ref__btn-icon">
                  <ArrowUpRight size={15} />
                </span>
              </a>

              <a href="/layout-viewer" className="hero-ref__secondary-btn">
                <Map size={15} />
                <span>Interactive Layout Map</span>
              </a>
            </div>
          </div>

          {/* Simple, Neat Trust Highlights at bottom */}
          <div className="hero-ref__highlights">
            <div className="hero-ref__highlight-item">
              <span className="hero-ref__highlight-val">100%</span>
              <span className="hero-ref__highlight-label">Clear Titles</span>
            </div>
            <div className="hero-ref__highlight-sep" />
            <div className="hero-ref__highlight-item">
              <span className="hero-ref__highlight-val">500+</span>
              <span className="hero-ref__highlight-label">Happy Families</span>
            </div>
            <div className="hero-ref__highlight-sep" />
            <div className="hero-ref__highlight-item">
              <span className="hero-ref__highlight-val">Since 2014</span>
              <span className="hero-ref__highlight-label">Verified Experience</span>
            </div>
          </div>
        </div>

        {/* Clean Integrated Search Bar */}
        <form className="hero-search" onSubmit={submit}>
          <div className="hero-search__grid">
            <Field label="Location">
              <select value={loc} onChange={(e) => setLoc(e.target.value)}>
                <option value="">All Locations in West Chennai</option>
                {searchOptions.locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>

            <Field label="Plot Size">
              <select value={size} onChange={(e) => setSize(+e.target.value)}>
                {searchOptions.sizes.map((s, i) => (
                  <option key={s.label} value={i}>{s.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Budget Range">
              <select value={budget} onChange={(e) => setBudget(+e.target.value)}>
                {searchOptions.budgets.map((b, i) => (
                  <option key={b.label} value={i}>{b.label}</option>
                ))}
              </select>
            </Field>

            <div className="hero-search__action">
              <Button type="submit" variant="primary" block>
                <Search size={18} /> Search Plots
              </Button>
            </div>
          </div>

          <div className="hero-search__trust">
            <span><ShieldCheck size={16} /> 100% Legal Verification</span>
            <span><CheckCircle2 size={16} /> DTCP & CMDA Approved</span>
            <span><CheckCircle2 size={16} /> Bank Loan Assistance</span>
          </div>
        </form>
      </Container>
    </section>
  )
}
