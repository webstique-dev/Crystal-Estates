'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Phone, Mail, ArrowUp, Calendar } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Container, LeafDecor, WhatsAppIcon } from '../ui'
import { business, navLinks } from '../../data/site'

export default function Footer() {
  const footerRef = useRef(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getHref = useCallback((rawHref) => {
    const hash = rawHref.startsWith('#') ? rawHref : `#${rawHref}`
    if (isHome) return hash
    if (hash === '#home') return '/'
    return `/${hash}`
  }, [isHome])

  useGSAP(
    () => {
      if (isReducedMotion()) return

      gsap.from('.footer-ref__col', {
        scrollTrigger: {
          trigger: '.footer-ref__top',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })
    },
    { scope: footerRef },
  )

  return (
    <>
      <footer className="footer-ref" ref={footerRef}>
        {/* Decorative Botanical Leaf Backgrounds */}
        <LeafDecor
          variant="branch"
          className="footer-ref__leaf footer-ref__leaf--left"
          opacity={0.08}
        />
        <LeafDecor
          variant="laurel"
          className="footer-ref__leaf footer-ref__leaf--right"
          opacity={0.07}
        />

        <Container className="footer-ref__container">
          <div className="footer-ref__top">
            {/* Brand column - Left-aligned */}
            <div className="footer-ref__col footer-ref__col--brand">
              <Link href="/" className="footer-ref__logo" aria-label={business.name}>
                <img src="/logo-white.png" alt={business.name} width="160" height="42" />
              </Link>
              <p className="footer-ref__tagline">{business.tagline}</p>
              <div className="footer-ref__office-info">
                <span>
                  <MapPin size={14} className="footer-ref__info-icon" />
                  {business.address.city}
                </span>
                <a href={`tel:${business.phone.replace(/\s/g, '')}`} className="footer-ref__info-link">
                  <Phone size={14} className="footer-ref__info-icon" />
                  {business.phone}
                </a>
                <a href={`mailto:${business.email}`} className="footer-ref__info-link">
                  <Mail size={14} className="footer-ref__info-icon" />
                  {business.email}
                </a>
              </div>
            </div>

            {/* Explore column - Left-aligned */}
            <div className="footer-ref__col">
              <h4>Explore</h4>
              <ul>
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={getHref(l.href)}>{l.label}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/layout-viewer">Interactive Layout Map</Link>
                </li>
              </ul>
            </div>

            {/* Key Projects - Left-aligned */}
            <div className="footer-ref__col">
              <h4>Key Projects</h4>
              <ul>
                <li><Link href={getHref('#projects')}>Vedanthangal Sandalwood (15 Acres)</Link></li>
                <li><Link href={getHref('#projects')}>Kolapakkam CMDA Layout</Link></li>
                <li><Link href={getHref('#projects')}>Somamangalam DTCP Plots</Link></li>
                <li><Link href={getHref('#projects')}>Brammadesam Residential</Link></li>
                <li><Link href={getHref('#about')}>100% Clear Title Guarantee</Link></li>
              </ul>
            </div>

            {/* Head Office location - Left-aligned */}
            <div className="footer-ref__col">
              <h4>Head Office</h4>
              <p className="footer-ref__address-text">
                {business.address.line1},<br />
                {business.address.line2},<br />
                {business.address.city}
              </p>
              <div className="footer-ref__hours">
                <strong>Hours:</strong> {business.hours}
              </div>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(business.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-ref__map-link"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          {/* Mandatory Legal Disclaimer - Center-aligned */}
          <div className="footer-ref__disclaimer">
            <p>{business.disclaimer}</p>
          </div>

          {/* Bottom strip with centered spacing & alignment */}
          <div className="footer-ref__bottom">
            <p className="footer-ref__copy">
              © {new Date().getFullYear()} {business.name}. All rights reserved. Farm Lands • Plots • Premium Living.
            </p>
            <div className="footer-ref__actions">
              <Link href={getHref('#projects')} className="footer-ref__link">
                View Projects
              </Link>
              <span className="footer-ref__sep">•</span>
              <Link href={getHref('#contact')} className="footer-ref__link">
                Book Site Visit
              </Link>
              <button
                type="button"
                className="footer-ref__scroll-top"
                onClick={scrollToTop}
                aria-label="Scroll to top"
              >
                <ArrowUp size={14} />
                <span>Top</span>
              </button>
            </div>
          </div>
        </Container>
      </footer>

      {/* Floating Action Shortcuts */}
      <div className="floating-dock" aria-label="Quick contact shortcuts">
        <a
          href={getHref('#contact')}
          className="floating-btn floating-btn--book"
          aria-label="Book a site visit"
        >
          <Calendar size={15} />
          <span className="floating-btn__text">Book Site Visit</span>
        </a>

        <a
          href={`tel:${business.phone.replace(/\s/g, '')}`}
          className="floating-btn floating-btn--call"
          aria-label={`Call us at ${business.phone}`}
        >
          <Phone size={15} />
          <span className="floating-btn__text">Call Us</span>
        </a>

        <a
          href={`https://wa.me/${business.whatsapp}?text=Hello%20Crystal%20Estates,%20I%20would%20like%20to%20inquire%20about%20your%20farm%20lands%20and%20plots.`}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-btn floating-btn--wa"
          aria-label="Chat with us on WhatsApp"
        >
          <WhatsAppIcon size={18} />
          <span className="floating-btn__text">WhatsApp</span>
        </a>
      </div>
    </>
  )
}
