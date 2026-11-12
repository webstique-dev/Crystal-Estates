'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  MapPin,
  X,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Send,
} from 'lucide-react'
import { WhatsAppIcon } from './index'
import { business } from '../../data/site'
import './SiteVisitPopup.css'

export default function SiteVisitPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [projectList, setProjectList] = useState([])

  // Fetch real projects dynamically
  useEffect(() => {
    fetch('/api/plots')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.plots) && data.plots.length > 0) {
          const avail = data.plots.filter((p) => p.status !== 'Sold Out' && p.status !== 'Sold')
          if (avail.length > 0) {
            setProjectList(avail)
            setFormData((prev) => ({ ...prev, project: prev.project || avail[0].name }))
          }
        }
      })
      .catch(() => {})
  }, [])

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    project: '',
    datePreference: 'This Saturday',
    message: '',
  })

  const timerRef = useRef(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  // 1. Smoothly reveal floating CTA pill in bottom-right corner after initial delay
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true)
    }, 2500)

    return () => clearTimer()
  }, [])

  // 2. User dismisses the floating pill via close button
  const handleDismiss = (e) => {
    if (e) e.stopPropagation()
    clearTimer()
    setIsVisible(false)
  }

  // 3. User clicks to open the Site Visit Booking Modal
  const handleOpenModal = () => {
    clearTimer()
    setIsModalOpen(true)
  }

  // 4. Handle Modal Close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // 5. Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitted(true)

    // Save automatically to database under Site Visits & Leads in CRM
    try {
      const visitPayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        property: formData.project || 'General Site Visit',
        project: formData.project || 'General Site Visit',
        date: formData.datePreference || 'This Saturday',
        datePreference: formData.datePreference || 'This Saturday',
        notes: (formData.message || '').trim(),
        message: (formData.message || '').trim(),
        status: 'Pending',
        cabPickup: false,
        source: 'Website - Site Visit Popup',
      }

      // 1. Create site visit directly in CRM Site Visits section
      await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitPayload),
      }).catch((err) => {
        console.warn('Site visit POST failed:', err)
      })

      // 2. Also register enquiry for lead pipeline
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...visitPayload,
          interest: visitPayload.property,
          followUpDate: formData.datePreference || 'This Saturday',
          stage: 'sitevisit',
          isSiteVisit: true,
        }),
      }).catch((err) => {
        console.warn('Site visit enquiry POST failed:', err)
      })
    } catch (err) {
      console.warn('Site visit enquiry error:', err)
    }

    const msg = `*New Site Visit Request (Crystal Estates)*\n\n👤 *Name:* ${formData.name}\n📞 *Phone:* ${formData.phone}\n📍 *Project:* ${formData.project}\n📅 *Preferred Day:* ${formData.datePreference}${formData.message ? `\n💬 *Message:* ${formData.message}` : ''}\n\nPlease confirm our appointment and share the site location pin.`

    setTimeout(() => {
      window.open(
        `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(msg)}`,
        '_blank',
      )
    }, 900)
  }

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, handleCloseModal])

  return (
    <>
      {/* ── Floating Action Pill (No intrusive popup card - only clean bottom-right pill) ── */}
      <div
        className={`svp-fab-wrap ${isVisible ? 'svp-fab-wrap--visible' : ''}`}
        aria-hidden={!isVisible}
      >
        <div
          className="svp-fab-pill"
          onClick={handleOpenModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleOpenModal()
            }
          }}
          aria-label="Book a Site Visit - Click to open booking form"
          title="Click to Book a Free Site Visit"
        >
          {/* Animated Pin with Radar Beacon */}
          <div className="svp-fab-pill__icon-box" aria-hidden="true">
            <span className="svp-fab-pill__pulse svp-fab-pill__pulse--1" />
            <span className="svp-fab-pill__pulse svp-fab-pill__pulse--2" />
            <MapPin size={17} className="svp-fab-pill__pin" />
          </div>

          {/* Visible Text Content */}
          <div className="svp-fab-pill__content">
            <span className="svp-fab-pill__title">Book a Site Visit</span>
            <span className="svp-fab-pill__sub">
              <span className="svp-live-dot svp-live-dot--sm" />
              <span>Free Site Survey</span>
            </span>
          </div>

          {/* Embedded CTA Button */}
          <button
            type="button"
            className="svp-fab-pill__cta-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenModal()
            }}
            aria-label="Book a Site Visit Now"
            title="Open Site Visit Booking Form"
          >
            <span>Book Now</span>
            <ArrowRight size={13} />
          </button>

          {/* Close / Dismiss Button directly on the Floating Pill */}
          <button
            type="button"
            className="svp-fab-pill__close-btn"
            onClick={handleDismiss}
            aria-label="Close floating site visit reminder"
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Interactive Site Visit Booking Modal (Opens only on click) ── */}
      {isModalOpen && (
        <div
          className="svp-modal-overlay"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="svp-modal-title"
        >
          <div
            className="svp-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="svp-modal-header">
              <div className="svp-modal-header-text">
                <div className="svp-modal-badge">
                  <Navigation size={13} />
                  <span>Complimentary Guided Tour</span>
                </div>
                <h3 id="svp-modal-title" className="svp-modal-title">
                  Schedule Your Free Site Visit
                </h3>
                <p className="svp-modal-subtitle">
                  Inspect survey stones, sweet groundwater & mother deed records in person with Crystal Estates.
                </p>
              </div>

              <button
                type="button"
                className="svp-modal-close"
                onClick={handleCloseModal}
                aria-label="Close booking modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            {formSubmitted ? (
              <div className="svp-success-state">
                <div className="svp-success-icon">
                  <CheckCircle2 size={44} />
                </div>
                <h4>Site Visit Request Sent!</h4>
                <p>
                  Thank you, <strong>{formData.name}</strong>. Our senior land advisor will call you within 15 minutes to confirm your visit schedule and share the site location pin.
                </p>
                <div className="svp-success-actions">
                  <button
                    type="button"
                    className="svp-cta-btn"
                    onClick={() => {
                      setIsModalOpen(false)
                      setFormSubmitted(false)
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="svp-form">
                <div className="svp-form-row">
                  <div className="svp-field">
                    <label htmlFor="svp-name">Your Full Name *</label>
                    <input
                      id="svp-name"
                      type="text"
                      required
                      placeholder="e.g. Senthil Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="svp-field">
                    <label htmlFor="svp-phone">Phone / WhatsApp Number *</label>
                    <input
                      id="svp-phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="svp-form-row">
                  <div className="svp-field">
                    <label htmlFor="svp-project">Select Project / Layout *</label>
                    <select
                      id="svp-project"
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    >
                      {projectList.map((p) => (
                        <option key={p.id || p.slug || p.name} value={p.name}>
                          {p.name} ({p.location || 'Chennai'} {p.approval ? `• ${p.approval}` : ''})
                        </option>
                      ))}
                      <option value="All Available Chennai Land Projects">
                        All Available Chennai Land Projects
                      </option>
                    </select>
                  </div>

                  <div className="svp-field">
                    <label htmlFor="svp-date">Preferred Day *</label>
                    <select
                      id="svp-date"
                      value={formData.datePreference}
                      onChange={(e) => setFormData({ ...formData, datePreference: e.target.value })}
                    >
                      <option value="This Saturday">This Saturday (Morning Tour)</option>
                      <option value="This Sunday">This Sunday (Morning Tour)</option>
                      <option value="Upcoming Weekday">Upcoming Weekday (Custom Schedule)</option>
                    </select>
                  </div>
                </div>

                {/* Optional Message Field */}
                <div className="svp-field">
                  <label htmlFor="svp-notes">Additional Message / Note (Optional)</label>
                  <textarea
                    id="svp-notes"
                    rows={2}
                    placeholder="e.g. Need cab pickup, visiting with family of 3, specific plot interest..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                {/* Trust Points */}
                <div className="svp-modal-perks">
                  <span>
                    <CheckCircle2 size={13} /> 100% Free & No-Obligation
                  </span>
                  <span>
                    <CheckCircle2 size={13} /> Guided Boundary Verification
                  </span>
                  <span>
                    <CheckCircle2 size={13} /> Spot Document Inspection
                  </span>
                </div>

                {/* Form Actions */}
                <div className="svp-form-actions">
                  <button type="submit" className="svp-submit-btn">
                    <Send size={15} />
                    <span>Confirm Site Visit</span>
                  </button>

                  <a
                    href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                      'Hello Crystal Estates, I would like to book a site visit this weekend.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="svp-wa-direct-btn"
                  >
                    <WhatsAppIcon size={16} />
                    <span>Instant WhatsApp Booking</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
