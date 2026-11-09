'use client'

import React from 'react'
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react'
import { Section, Container, WhatsAppIcon } from '../ui'
import { business } from '../../data/site'

export default function ContactInfoSection({
  title = 'Contact Information',
  subtitle = 'Visit our registered office in Valasaravakkam, Chennai or schedule a private site inspection tour with our land advisors.',
  className = '',
}) {
  return (
    <Section
      id="contact-info"
      title={title}
      subtitle={subtitle}
      variant="subtle"
      className={`contact-info-sec ${className}`.trim()}
    >
      <Container>
        <div className="contact-info-strip-grid">
          {/* Card 1: Office Address */}
          <div className="contact-strip-card">
            <div className="contact-strip-card__icon-wrap">
              <MapPin size={22} />
            </div>
            <div className="contact-strip-card__content">
              <span className="contact-strip-card__label">Registered Office</span>
              <h4 className="contact-strip-card__title">Crystal Tower, Chennai</h4>
              <p className="contact-strip-card__text">{business.address.full}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(business.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-strip-card__action-link"
              >
                <span>Get Driving Directions</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          {/* Card 2: Phone & WhatsApp */}
          <div className="contact-strip-card">
            <div className="contact-strip-card__icon-wrap">
              <Phone size={22} />
            </div>
            <div className="contact-strip-card__content">
              <span className="contact-strip-card__label">Phone & WhatsApp</span>
              <h4 className="contact-strip-card__title">Direct Land Consultation</h4>
              <p className="contact-strip-card__text">
                Speak directly with our senior acquisition & legal desk for immediate plot availability.
              </p>
              <div className="contact-strip-card__btn-group">
                <a
                  href={`tel:${business.phone.replace(/\s/g, '')}`}
                  className="contact-strip-btn contact-strip-btn--call"
                >
                  <Phone size={14} />
                  <span>{business.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                    'Hello Crystal Estates, I would like to enquire about your land and plot projects.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-strip-btn contact-strip-btn--wa"
                >
                  <WhatsAppIcon size={14} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Email & Hours */}
          <div className="contact-strip-card">
            <div className="contact-strip-card__icon-wrap">
              <Mail size={22} />
            </div>
            <div className="contact-strip-card__content">
              <span className="contact-strip-card__label">Email & Working Hours</span>
              <h4 className="contact-strip-card__title">Official Correspondence</h4>
              <p className="contact-strip-card__text">
                <strong>Email:</strong>{' '}
                <a href={`mailto:${business.email}`} className="contact-strip-link">
                  {business.email}
                </a>
              </p>
              <div className="contact-strip-card__hours">
                <Clock size={14} />
                <span>{business.hours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Interactive Office Map */}
        <div className="contact-strip-map-wrap">
          <iframe
            title="Crystal Estates Registered Office Location"
            loading="lazy"
            src={`https://www.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&output=embed`}
            className="contact-strip-map-iframe"
          />
        </div>
      </Container>
    </Section>
  )
}

