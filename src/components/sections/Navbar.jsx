'use client'

import { useEffect, useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Container } from '../ui'
import { business, navLinks } from '../../data/site'

const LinkedInIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
)

const InstagramIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useGSAP(() => {
    if (isReducedMotion()) return
    gsap.from('.nav', {
      y: -20,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    })
  })

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <Container className="nav__container">
        {/* Brand Logo */}
        <a href="#home" className="nav__logo" aria-label={business.name}>
          <img src="/logo.png" alt={business.name} width="160" height="42" />
        </a>

        {/* Center Floating Pill Menu */}
        <nav className="nav__pill-menu" aria-label="Main">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="nav__pill-link">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Socials & Call Pill */}
        <div className="nav__actions">
          <div className="nav__socials" aria-label="Social media">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="nav__social-icon">
              <LinkedInIcon size={15} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="nav__social-icon">
              <InstagramIcon size={15} />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="nav__social-icon">
              <XIcon size={14} />
            </a>
          </div>

          <a
            href={`tel:${business.phone.replace(/\s/g, '')}`}
            className="nav__call-btn"
            aria-label={`Call us at ${business.phone}`}
          >
            <span className="nav__call-icon">
              <Phone size={14} />
            </span>
            <span className="nav__call-text">{business.phone}</span>
          </a>

          <button
            className="nav__burger"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {open && (
        <div className="nav__drawer">
          <div className="nav__drawer-links">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="nav__drawer-link"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="nav__drawer-footer">
            <a
              href={`tel:${business.phone.replace(/\s/g, '')}`}
              className="btn btn--primary btn--block"
              onClick={() => setOpen(false)}
            >
              <Phone size={16} /> Call {business.phone}
            </a>
            <div className="nav__drawer-socials">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <LinkedInIcon size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">
                <XIcon size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
