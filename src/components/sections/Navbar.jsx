'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  const [activeSection, setActiveSection] = useState('home')
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Spy on scroll sections on the homepage to highlight the active link
  useEffect(() => {
    if (!isHome) {
      return
    }

    const sectionIds = ['home', 'plots', 'about', 'process', 'reviews', 'contact']
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 180
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i]
        const el = document.getElementById(id)
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id)
          return
        }
      }
      setActiveSection('home')
    }

    handleScrollSpy()
    window.addEventListener('scroll', handleScrollSpy, { passive: true })
    return () => window.removeEventListener('scroll', handleScrollSpy)
  }, [isHome])

  useGSAP(() => {
    if (isReducedMotion()) return
    gsap.from('.nav', {
      y: -20,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    })
  })

  // Helper to compute correct target URL across routes
  const getHref = useCallback((rawHref) => {
    const hash = rawHref.startsWith('#') ? rawHref : `#${rawHref}`
    if (isHome) {
      return hash
    }
    // When navigating from other pages (e.g. /layout-viewer)
    if (hash === '#home') {
      return '/'
    }
    return `/${hash}`
  }, [isHome])

  const handleNavClick = (e, rawHref) => {
    if (isHome) {
      const targetId = rawHref.replace(/^#/, '')
      const targetEl = document.getElementById(targetId)
      if (targetEl) {
        e.preventDefault()
        targetEl.scrollIntoView({ behavior: 'smooth' })
        setActiveSection(targetId)
      }
    }
    setOpen(false)
  }

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <Container className="nav__container">
        {/* Brand Logo - clicking redirects to Homepage from any page */}
        <Link href="/" className="nav__logo" aria-label={business.name} onClick={() => setOpen(false)}>
          <img src="/logo.png" alt={business.name} width="160" height="42" />
        </Link>

        {/* Center Floating Pill Menu */}
        <nav className="nav__pill-menu" aria-label="Main">
          {navLinks.map((l) => {
            const sectionId = l.href.replace(/^#/, '')
            const isActive = isHome && activeSection === sectionId

            return (
              <Link
                key={l.href}
                href={getHref(l.href)}
                className={`nav__pill-link ${isActive ? 'nav__pill-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, l.href)}
              >
                {l.label}
              </Link>
            )
          })}
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
            {navLinks.map((l) => {
              const sectionId = l.href.replace(/^#/, '')
              const isActive = isHome && activeSection === sectionId

              return (
                <Link
                  key={l.href}
                  href={getHref(l.href)}
                  className={`nav__drawer-link ${isActive ? 'nav__drawer-link--active' : ''}`}
                  onClick={(e) => handleNavClick(e, l.href)}
                >
                  {l.label}
                </Link>
              )
            })}
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
