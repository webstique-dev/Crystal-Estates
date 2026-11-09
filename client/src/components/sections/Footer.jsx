'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { MapPin, Phone, Mail, Clock, ArrowUpRight, ArrowUp } from 'lucide-react'
import { Container, LeafDecor, WhatsAppIcon } from '../ui'
import { business } from '../../data/site'
import { mainNav } from '../../config/navigation'

export default function Footer() {
  const pathname = usePathname()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Dedicated full-page layout viewer renders clean without global footer
  if (pathname?.startsWith('/layout-viewer')) {
    return null
  }

  return (
    <footer className="footer-site">
      {/* Decorative Botanical Leaf Backgrounds */}
      <LeafDecor
        variant="branch"
        className="footer-site__leaf footer-site__leaf--left"
        opacity={0.06}
      />
      <LeafDecor
        variant="laurel"
        className="footer-site__leaf footer-site__leaf--right"
        opacity={0.05}
      />

      <Container className="footer-site__container">
        {/* 4 Columns Grid: 4 cols desktop, 2 cols tablet, 1 col mobile */}
        <div className="footer-site__grid">
          {/* Column 1: Company Info with Address */}
          <div className="footer-site__col footer-site__col--brand">
            <Link href="/" className="footer-site__brand" aria-label="Crystal Estates - ASSETS CREATOR">
              <div className="footer-site__brand-wrap">
                <Image
                  src="/logo-white.png"
                  alt="Crystal Estates"
                  width={172}
                  height={58}
                  className="footer-site__brand-img"
                />
                <span className="footer-site__brand-tagline">ASSETS CREATOR</span>
              </div>
            </Link>

            <p className="footer-site__about">
              Chennai&apos;s premier land and plot asset creator. We specialize exclusively in CMDA/DTCP approved residential plots, managed sandalwood farm lands, individual plots, and clear-titled acreage with 100% legal verification.
            </p>

            <div className="footer-site__address-box">
              <div className="footer-site__address-line">
                <MapPin size={16} className="footer-site__icon footer-site__icon--gold" />
                <address className="footer-site__address-text">
                  {business.address.line1},<br />
                  {business.address.line2},<br />
                  {business.address.city}
                </address>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-site__col">
            <h4 className="footer-site__heading">Quick Links</h4>
            <ul className="footer-site__links">
              {mainNav.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="footer-site__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services & Solutions */}
          <div className="footer-site__col">
            <h4 className="footer-site__heading">Our Services</h4>
            <ul className="footer-site__links">
              <li>
                <Link href="/services" className="footer-site__link">
                  Direct Land Sales
                </Link>
              </li>
              <li>
                <Link href="/services" className="footer-site__link">
                  Land Purchase &amp; Resale
                </Link>
              </li>
              <li>
                <Link href="/services" className="footer-site__link">
                  Land Brokerage
                </Link>
              </li>
              <li>
                <Link href="/sell-your-land" className="footer-site__link">
                  Sell Your Land
                </Link>
              </li>
              <li>
                <Link href="/faq" className="footer-site__link">
                  FAQ &amp; Buying Process
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Details & WhatsApp Link */}
          <div className="footer-site__col">
            <h4 className="footer-site__heading">Contact & Inquiries</h4>
            <div className="footer-site__contacts">
              <a
                href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                  "Hi Crystal Estates, I'm interested in purchasing land or residential plots in Chennai."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-site__whatsapp-btn"
              >
                <WhatsAppIcon size={18} />
                <span>Chat on WhatsApp</span>
                <ArrowUpRight size={14} />
              </a>

              <a
                href={`tel:${business.phone.replace(/\s/g, '')}`}
                className="footer-site__contact-row"
              >
                <Phone size={15} className="footer-site__icon" />
                <span>{business.phone}</span>
              </a>

              <a
                href={`mailto:${business.email}`}
                className="footer-site__contact-row"
              >
                <Mail size={15} className="footer-site__icon" />
                <span>{business.email}</span>
              </a>

              <div className="footer-site__contact-row">
                <Clock size={15} className="footer-site__icon" />
                <span>{business.hours}</span>
              </div>

              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(business.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-site__map-btn"
              >
                <span>View Office Location on Maps</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Mandatory Legal Disclaimer */}
        <div className="footer-site__disclaimer">
          <p>{business.disclaimer}</p>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="footer-site__bottom">
          <p className="footer-site__copyright">
            &copy; {new Date().getFullYear()} Crystal Estates. ASSETS CREATOR. All rights reserved. Land & Plot Sales across Chennai.
          </p>

          <button
            type="button"
            className="footer-site__top-btn"
            onClick={scrollToTop}
            aria-label="Scroll back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </Container>
    </footer>
  )
}
