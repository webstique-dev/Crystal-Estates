'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, MapPin, Mail, ArrowUp } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Container, WhatsAppIcon } from '../ui'
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
        <Container>
          <div className="footer-ref__top">
            {/* Brand column */}
            <div className="footer-ref__col footer-ref__col--brand">
              <Link href="/" className="footer-ref__logo" aria-label={business.name}>
                <img src="/logo-white.png" alt={business.name} width="160" height="42" />
              </Link>
              <p className="footer-ref__tagline">{business.tagline}</p>
              <div className="footer-ref__office-info">
                <span><MapPin size={15} /> {business.address.city}</span>
                <span><Phone size={15} /> {business.phone}</span>
                <span><Mail size={15} /> {business.email}</span>
              </div>
            </div>

            {/* Explore column */}
            <div className="footer-ref__col">
              <h4>Explore</h4>
              <ul>
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={getHref(l.href)}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Listings & Verification */}
            <div className="footer-ref__col">
              <h4>Verification</h4>
              <ul>
                <li><Link href={getHref('#plots')}>DTCP Approved Plots</Link></li>
                <li><Link href={getHref('#plots')}>CMDA Approved Layouts</Link></li>
                <li><Link href={getHref('#about')}>Clear Title Guarantee</Link></li>
                <li><Link href={getHref('#about')}>Bank Loan Partnerships</Link></li>
                <li><a href={business.justdial} target="_blank" rel="noopener noreferrer">Verified Justdial Listing</a></li>
              </ul>
            </div>

            {/* Office location */}
            <div className="footer-ref__col">
              <h4>Site Office</h4>
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

          {/* Bottom strip */}
          <div className="footer-ref__bottom">
            <p className="footer-ref__copy">
              © {new Date().getFullYear()} {business.name}. All rights reserved. DTCP & CMDA approved residential plots.
            </p>
            <div className="footer-ref__actions">
              <Link href={getHref('#plots')} className="footer-ref__link">
                View Plots
              </Link>
              <Link href={getHref('#contact')} className="footer-ref__link">
                Schedule Visit
              </Link>
              <button
                type="button"
                className="footer-ref__scroll-top"
                onClick={scrollToTop}
                aria-label="Scroll to top"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </Container>
      </footer>

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${business.whatsapp}?text=Hello%20Crystal%20Estates,%20I%20would%20like%20to%20inquire%20about%20your%20available%20plots.`}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float"
        aria-label="Chat with us on WhatsApp"
      >
        <WhatsAppIcon size={28} />
      </a>
    </>
  )
}
