'use client'

import { useState, useRef } from 'react'
import { ArrowUpRight, Search, ShieldCheck, CheckCircle2, Sparkles, Calendar, MapPin, Ruler, Compass } from 'lucide-react'
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
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
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
        {/* Full-width architectural hero frame specified in Developer Brief */}
        <div className="hero-ref__frame">
          <img
            src="/images/vedanthangal.jpg"
            alt="Vedanthangal Sandalwood Farm Land 15 Acres"
            className="hero-ref__bg-img"
            loading="eager"
            fetchPriority="high"
          />
          <div className="hero-ref__gradient-overlay" />

          {/* Centered, Elegant Hero Content */}
          <div className="hero-ref__content">
            <div className="hero-ref__eyebrow">
              <Sparkles size={13} className="hero-ref__eyebrow-icon" />
              <span>Flagship Project • Vedanthangal, Chennai</span>
            </div>

            <h1 className="hero-ref__title">
              Own a Piece of Nature.<br />
              Invest in Legacy.
            </h1>

            <p className="hero-ref__subhead">
              Vedanthangal Sandalwood Farm Land — 15 Acres
            </p>

            <p className="hero-ref__lead">
              A rare opportunity to own managed sandalwood farmland with high appreciation potential, clear legal titles, and complete farm management by Crystal Estates.
            </p>

            {/* Two Action Buttons: View Project & Book Site Visit (per brief wireframe) */}
            <div className="hero-ref__cta-group">
              <a href="#projects" className="hero-ref__primary-btn">
                <span>VIEW PROJECT</span>
                <span className="hero-ref__btn-icon">
                  <ArrowUpRight size={15} />
                </span>
              </a>

              <a href="#contact" className="hero-ref__gold-btn">
                <Calendar size={15} />
                <span>BOOK SITE VISIT</span>
              </a>
            </div>
          </div>

          {/* Key Facts Strip (Page 4 of Brief: 15 Acres, Plot Sizes, Road Access, Approvals) */}
          <div className="hero-ref__facts-strip">
            <div className="hero-ref__fact-item">
              <span className="hero-ref__fact-val">15 Acres</span>
              <span className="hero-ref__fact-lbl">Total Extent</span>
            </div>
            <div className="hero-ref__fact-sep" />
            <div className="hero-ref__fact-item">
              <span className="hero-ref__fact-val">Plot Sizes</span>
              <span className="hero-ref__fact-lbl">From 22 Cents</span>
            </div>
            <div className="hero-ref__fact-sep" />
            <div className="hero-ref__fact-item">
              <span className="hero-ref__fact-val">Road Access</span>
              <span className="hero-ref__fact-lbl">30-ft & Blacktop</span>
            </div>
            <div className="hero-ref__fact-sep" />
            <div className="hero-ref__fact-item">
              <span className="hero-ref__fact-val">Approvals</span>
              <span className="hero-ref__fact-lbl">100% Clear Titles</span>
            </div>
          </div>
        </div>

        {/* Clean Integrated Search Bar */}
        <form className="hero-search" onSubmit={submit}>
          <div className="hero-search__grid">
            <Field label="Location">
              <select value={loc} onChange={(e) => setLoc(e.target.value)}>
                <option value="">All Projects & Locations</option>
                {searchOptions.locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>

            <Field label="Plot Size / Extent">
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
                <Search size={18} /> Search Projects
              </Button>
            </div>
          </div>

          <div className="hero-search__trust">
            <span><ShieldCheck size={16} /> 100% Legal Verification</span>
            <span><CheckCircle2 size={16} /> DTCP, CMDA & Patta Land</span>
            <span><CheckCircle2 size={16} /> Managed Sandalwood Care</span>
            <span><CheckCircle2 size={16} /> Bank Loan Assistance</span>
          </div>
        </form>
      </Container>
    </section>
  )
}
