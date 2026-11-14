'use client'

import React from 'react'
import { Calendar, Phone, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react'
import { Container, WhatsAppIcon } from '../ui'
import { business } from '../../data/site'

/**
 * Final Risk Reversal & Action Section per landing-page-design A2 & B8
 * Mirror of primary hero action with risk reversal commitments.
 */
export default function FinalCta() {
  const handleOpenSiteVisit = (e) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-site-visit'))
    }
  }

  const waLink = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    'Hello Crystal Estates, I would like to schedule a free site visit to inspect verified land plots.'
  )}`

  return (
    <section className="final-cta-section">
      <Container>
        <div className="final-cta-card">
          <div className="final-cta-content">
            <span className="final-cta-eyebrow caption-3">
              ZERO RISK · GUIDED ON SITE INSPECTION
            </span>

            <h2 className="final-cta-title heading-2">
              Ready to inspect verified land plots in person?
            </h2>

            <p className="final-cta-lead body-2">
              Join our weekend site tour with complimentary pickup across Chennai. Verify physical boundary stones, groundwater potability, and parent title deeds before committing a single rupee.
            </p>

            {/* Risk Reversals */}
            <div className="final-cta-reversals">
              <div className="final-cta-reversal-item">
                <CheckCircle2 size={15} className="reversal-check" />
                <span>100% free and zero obligation</span>
              </div>
              <div className="final-cta-reversal-item">
                <CheckCircle2 size={15} className="reversal-check" />
                <span>Complimentary door step cab pickup</span>
              </div>
              <div className="final-cta-reversal-item">
                <CheckCircle2 size={15} className="reversal-check" />
                <span>Full parent document kit for private lawyer vetting</span>
              </div>
            </div>

            {/* Actions */}
            <div className="final-cta-actions">
              <button
                type="button"
                onClick={handleOpenSiteVisit}
                className="final-cta-btn-primary"
                aria-label="Schedule Free Site Visit"
              >
                <Calendar size={16} />
                <span>Schedule Free Site Visit</span>
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="final-cta-btn-wa"
                aria-label="Instant WhatsApp Booking"
              >
                <WhatsAppIcon size={16} />
                <span>Instant WhatsApp Booking</span>
              </a>

              <a
                href={`tel:${business.phone}`}
                className="final-cta-btn-phone"
                aria-label={`Call office ${business.phone}`}
              >
                <Phone size={15} />
                <span>{business.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

