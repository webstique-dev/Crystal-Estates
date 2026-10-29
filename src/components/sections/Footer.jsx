'use client'

import { useRef } from 'react'
import { Phone, MapPin, Mail, ArrowUp } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Container, WhatsAppIcon } from '../ui'
import { business, navLinks } from '../../data/site'

export default function Footer() {
  const footerRef = useRef(null)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
              <a href="#home" className="footer-ref__logo" aria-label={business.name}>
                <img src="/logo-white.png" alt={business.name} width="160" height="42" />
              </a>
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
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Listings & Verification */}
            <div className="footer-ref__col">
              <h4>Verification</h4>
              <ul>
                <li><a href="#plots">DTCP Approved Plots</a></li>
                <li><a href="#plots">CMDA Approved Layouts</a></li>
                <li><a href="#about">Clear Title Guarantee</a></li>
                <li><a href="#about">Bank Loan Partnerships</a></li>
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

          <div className="footer-ref__bottom">
            <div className="footer-ref__legal">
              <span>© 2026 {business.name}. All rights reserved.</span>
              <span className="footer-ref__disclaimer">
                Plot details and prices are indicative — please confirm at the site office.
              </span>
            </div>
            <button
              onClick={scrollToTop}
              className="footer-ref__back-top"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp size={15} />
            </button>
          </div>
        </Container>
      </footer>

      {/* Floating WhatsApp Action Button */}
      <a
        className="wa-float"
        href={`https://wa.me/${business.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Crystal Estates on WhatsApp"
      >
        <WhatsAppIcon size={30} />
        <span className="wa-float__tooltip">Chat on WhatsApp</span>
      </a>
    </>
  )
}
