import { useState, useRef } from 'react'
import { ArrowUpRight, Search, ShieldCheck, CheckCircle2 } from 'lucide-react'
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

  // GSAP Entrance Timeline for the Hero Section
  useGSAP(
    () => {
      if (isReducedMotion()) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero-ref__bg-img', {
        scale: 1.08,
        opacity: 0.8,
        duration: 1.1,
      })
        .from(
          '.hero-ref__top-bar',
          {
            y: -16,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.8',
        )
        .from(
          '.hero-ref__title',
          {
            y: 28,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.5',
        )
        .from(
          '.hero-ref__stat-card',
          {
            y: 20,
            opacity: 0,
            stagger: 0.12,
            duration: 0.6,
          },
          '-=0.5',
        )
        .from(
          '.hero-ref__bottom-row',
          {
            y: 14,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.4',
        )
        .from(
          '.hero-search',
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
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
        {/* Main Immersive Hero Card inspired directly by reference image */}
        <div className="hero-ref__frame">
          <img
            src="/images/hero-estate.jpg"
            alt="Luxury modern estate villa and plots"
            className="hero-ref__bg-img"
            loading="eager"
            fetchPriority="high"
          />
          <div className="hero-ref__gradient-overlay" />

          {/* 1. Top Bar: Sub-headline, Badges & Micro info (Completely separated from title) */}
          <div className="hero-ref__top-bar">
            <div className="hero-ref__tagline">
              <div className="hero-ref__pill-group">
                <span className="hero-ref__micro">SINCE 2014</span>
                <span className="hero-ref__pill-accent">WEST CHENNAI</span>
              </div>
              <h2 className="hero-ref__subtitle">
                UPGRADE YOUR FUTURE WITH APPROVED RESIDENTIAL PLOTS
              </h2>
              <p className="hero-ref__lead">
                Transparent documentation, DTCP & CMDA approved land with clear marketable titles.
              </p>
            </div>

            <div className="hero-ref__top-right">
              <span className="hero-ref__badge">Security For Living</span>
            </div>
          </div>

          {/* 2. Middle Body: Grand Architectural Display Title & Non-colliding Stats */}
          <div className="hero-ref__center-content">
            <div className="hero-ref__title-box">
              <h1 className="hero-ref__title">
                CRYSTAL ESTATES
              </h1>
            </div>

            {/* Floating Stat Badges placed in their dedicated right-hand zone */}
            <div className="hero-ref__stats-cluster">
              <div className="hero-ref__stat-card hero-ref__stat-card--top">
                <span className="hero-ref__stat-val">100%</span>
                <p className="hero-ref__stat-txt">
                  Clear & verified titles with encumbrance checks.
                </p>
              </div>

              <div className="hero-ref__stat-card hero-ref__stat-card--bottom">
                <span className="hero-ref__stat-val">500+</span>
                <p className="hero-ref__stat-txt">
                  Happy families successfully building their dream homes.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Bottom Row: Left Meta, Center Floating CTA, Right Meta */}
          <div className="hero-ref__bottom-row">
            <div className="hero-ref__bottom-meta hero-ref__bottom-meta--left">
              <span>Verified Clear-Title Plots</span>
            </div>

            <div className="hero-ref__bottom-cta">
              <a href="#plots" className="hero-ref__discover-btn">
                <span>DISCOVER PLOTS</span>
                <span className="hero-ref__discover-icon">
                  <ArrowUpRight size={16} />
                </span>
              </a>
            </div>

            <div className="hero-ref__bottom-meta hero-ref__bottom-meta--right">
              <span>Welcome to Crystal Estates</span>
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
