'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Calendar } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Container } from '../ui'
import { business, navLinks } from '../../data/site'

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
    if (!isHome) return

    const sectionIds = ['home', 'about', 'projects', 'gallery', 'why-sandalwood', 'contact']
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 200
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
        {/* Brand Logo */}
        <Link href="/" className="nav__logo" aria-label={business.name} onClick={() => setOpen(false)}>
          <img
            src={scrolled ? '/logo-white.png' : '/logo.png'}
            alt={business.name}
            width="160"
            height="42"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/logo.png'
            }}
          />
        </Link>

        {/* Center Floating Pill Menu - Clean, uncluttered, no-wrap */}
        <nav className="nav__pill-menu" aria-label="Main Navigation">
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

        {/* Right Actions: Book Site Visit & Mobile Burger (Phone removed from menu bar) */}
        <div className="nav__actions">
          <Link
            href={getHref('#contact')}
            className="nav__book-btn"
            onClick={(e) => handleNavClick(e, '#contact')}
          >
            <Calendar size={14} />
            <span>Book Site Visit</span>
          </Link>

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
            <Link
              href={getHref('#contact')}
              className="btn btn--gold btn--block"
              onClick={(e) => handleNavClick(e, '#contact')}
            >
              <Calendar size={15} /> Book Site Visit
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
