'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowUpRight, Phone } from 'lucide-react'
import { Container, WhatsAppIcon } from '../ui'
import { business } from '../../data/site'
import { mainNav } from '../../config/navigation'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Track scroll position for sticky styling
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    // Closes mobile menu on route changes
    const timer = setTimeout(() => {
      setOpen(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [pathname])

  // Close mobile drawer on resize above 1024px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Dedicated full-page layout viewer renders clean without global navigation menu
  if (pathname?.startsWith('/layout-viewer')) {
    return null
  }

  // Check if a nav link is active
  const isItemActive = (href) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href === '/projects') {
      return pathname === '/projects' || pathname?.startsWith('/projects/')
    }
    if (href === '/news') {
      return pathname === '/news' || pathname?.startsWith('/news/')
    }
    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <Container className="header__container">
        {/* Brand Logo with "ASSETS CREATOR" below */}
        <Link href="/" className="header__brand" onClick={() => setOpen(false)} aria-label="Crystal Estates - ASSETS CREATOR">
          <div className="header__brand-wrap">
            <Image
              src="/logo.png"
              alt="Crystal Estates"
              width={150}
              height={51}
              priority
              className="header__brand-img header__brand-img--default"
            />
            <Image
              src="/logo-white.png"
              alt="Crystal Estates"
              width={150}
              height={51}
              priority
              className="header__brand-img header__brand-img--scrolled"
            />
            <span className="header__brand-tagline">ASSETS CREATOR</span>
          </div>
        </Link>

        {/* Desktop Navigation Links (>= 1024px) */}
        <nav className="header__nav" aria-label="Main Navigation">
          {mainNav.map((item) => {
            const active = isItemActive(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`header__nav-link ${active ? 'header__nav-link--active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions: Enquire Now Button & Mobile Hamburger */}
        <div className="header__actions">
          <Link
            href="/contact"
            className="header__enquire-btn"
            onClick={() => setOpen(false)}
          >
            <span>Enquire Now</span>
            <ArrowUpRight size={15} />
          </Link>

          <button
            type="button"
            className="header__burger"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </Container>

      {/* Mobile Slide-Down Panel (< 1024px) */}
      {open && (
        <div className="header__drawer" role="dialog" aria-modal="true">
          <div className="header__drawer-brand">
            <Image
              src="/logo.png"
              alt="Crystal Estates"
              width={132}
              height={45}
              className="header__drawer-logo header__drawer-logo--default"
            />
            <Image
              src="/logo-white.png"
              alt="Crystal Estates"
              width={132}
              height={45}
              className="header__drawer-logo header__drawer-logo--scrolled"
            />
            <span className="header__drawer-tagline">ASSETS CREATOR</span>
          </div>

          <div className="header__drawer-links">
            {mainNav.map((item) => {
              const active = isItemActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`header__drawer-link ${active ? 'header__drawer-link--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span>{item.label}</span>
                  {active && <span className="header__drawer-dot" />}
                </Link>
              )
            })}
            <Link
              href="/sell-your-land"
              className={`header__drawer-link ${pathname === '/sell-your-land' ? 'header__drawer-link--active' : ''}`}
              aria-current={pathname === '/sell-your-land' ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <span>Sell Your Land</span>
              {pathname === '/sell-your-land' && <span className="header__drawer-dot" />}
            </Link>
          </div>

          <div className="header__drawer-cta">
            <Link
              href="/contact"
              className="btn btn--gold btn--block"
              onClick={() => setOpen(false)}
            >
              Enquire Now
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="header__drawer-info">
            <div className="header__drawer-info-row">
              <a href={`tel:${business.phone.replace(/\s/g, '')}`} className="header__drawer-contact-item">
                <Phone size={14} />
                <span>{business.phone}</span>
              </a>
              <a
                href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent("Hi Crystal Estates, I'm interested in plots and farm land in Chennai.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="header__drawer-contact-item"
              >
                <WhatsAppIcon size={14} />
                <span>WhatsApp</span>
              </a>
            </div>
            <p className="header__drawer-address">
              {business.address.full}
            </p>
          </div>
        </div>
      )}
    </header>
  )
}
