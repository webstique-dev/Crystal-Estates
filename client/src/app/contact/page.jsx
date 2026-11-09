import React from 'react'
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react'
import { PageHero, Container, Section, Badge, WhatsAppIcon } from '../../components/ui'
import EnquiryForm from '../../components/forms/EnquiryForm'
import TestimonialsSection from '../../components/TestimonialsSection'
import { business } from '../../data/site'

export const metadata = {
  title: 'Contact Crystal Estates | Land Advisors in Valasaravakkam, Chennai',
  description:
    'Contact Crystal Estates at No. 9, A.K.R. Nagar Main Road, Crystal Tower, Valasaravakkam, Chennai. Call +91 94440 00000 or WhatsApp for verified plots and farm land.',
  openGraph: {
    title: 'Contact Crystal Estates | Chennai Land Specialists',
    description:
      'Visit our office at Valasaravakkam, Chennai or book a free weekend site visit for plots and farmland.',
    url: 'https://crystalestates.in/contact',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/hero-estate.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Crystal Estates',
      },
    ],
  },
}

export default function ContactPage() {
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <main>
      <PageHero
        title="Contact Crystal Estates"
        subtitle="Speak directly with our land advisors or schedule a guided weekend site visit with family pickup support."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Contact Us' },
        ]}
      />

      <Section>
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Office details, phone, email, hours, and map */}
            <div>
              <Badge tone="gold">HEADQUARTERS</Badge>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(26px, 3.5vw, 34px)',
                  color: 'var(--green-900)',
                  margin: '14px 0 16px',
                }}
              >
                Visit Our Valasaravakkam Office
              </h2>
              <p
                style={{
                  fontSize: '15.5px',
                  color: 'var(--ink-2)',
                  lineHeight: '1.7',
                  marginBottom: '28px',
                }}
              >
                We welcome prospective buyers and landowners to review original revenue records, parent title documents, and survey maps in person.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  marginBottom: '32px',
                }}
              >
                {/* Address */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--green-50)',
                      color: 'var(--green-900)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} color="var(--gold)" />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Registered Address
                    </span>
                    <address
                      style={{
                        fontStyle: 'normal',
                        fontSize: '15px',
                        color: 'var(--ink)',
                        lineHeight: '1.5',
                        marginTop: '3px',
                      }}
                    >
                      {business.address.line1},<br />
                      {business.address.line2},<br />
                      {business.address.city}
                    </address>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--green-50)',
                      color: 'var(--green-900)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={18} color="var(--gold)" />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Direct Phone Support
                    </span>
                    <div style={{ marginTop: '3px' }}>
                      <a
                        href={`tel:${business.phone.replace(/\s/g, '')}`}
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'var(--green-900)',
                          textDecoration: 'none',
                        }}
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--green-50)',
                      color: 'var(--green-900)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={18} color="var(--gold)" />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Email Correspondence
                    </span>
                    <div style={{ marginTop: '3px' }}>
                      <a
                        href={`mailto:${business.email}`}
                        style={{
                          fontSize: '15px',
                          color: 'var(--green-900)',
                          textDecoration: 'none',
                        }}
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--green-50)',
                      color: 'var(--green-900)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={18} color="var(--gold)" />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Office Working Hours
                    </span>
                    <div
                      style={{
                        fontSize: '15px',
                        color: 'var(--ink)',
                        marginTop: '3px',
                      }}
                    >
                      {business.hours}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Link */}
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                      "Hi Crystal Estates, I would like to enquire about plots and farm land in Chennai."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--gold btn--sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <WhatsAppIcon size={16} />
                    <span>Chat Directly on WhatsApp</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

              {/* Map Embed */}
              <div
                style={{
                  height: '240px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <iframe
                  title="Crystal Estates Chennai Headquarters"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={mapEmbedUrl}
                />
              </div>
            </div>

            {/* Right Column: Reusable EnquiryForm */}
            <div style={{ position: 'sticky', top: '96px' }}>
              <EnquiryForm
                title="Send an Online Enquiry"
                subtitle="Share your preferred plot budget, location, and requirement. Our senior land manager will get back to you within 2 hours."
              />
            </div>
          </div>
        </Container>
      </Section>

      <TestimonialsSection
        title="Landowner Confidence"
        subtitle="Trusted by over 500+ landowners across Chennai, Kanchipuram, and surrounding growth corridors."
      />
    </main>
  )
}
