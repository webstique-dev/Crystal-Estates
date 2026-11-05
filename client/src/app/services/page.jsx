import React from 'react'
import {
  CheckCircle2,
} from 'lucide-react'
import { PageHero, Section, Badge } from '../../components/ui'
import EnquiryForm from '../../components/forms/EnquiryForm'
import TestimonialsSection from '../../components/TestimonialsSection'

export const metadata = {
  title: 'Land Services in Chennai | Direct Sales, Resale & Brokerage | Crystal Estates',
  description:
    'Explore Crystal Estates land solutions: Direct sales of CMDA/DTCP approved plots and managed sandalwood farmland, land purchase & resale, and transparent land brokerage.',
  openGraph: {
    title: 'Land Services in Chennai | Crystal Estates',
    description:
      'Direct sales of approved plots and managed sandalwood farmland, land purchase & resale, and land brokerage.',
    url: 'https://crystalestates.in/services',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/hero-estate.jpg',
        width: 1200,
        height: 630,
        alt: 'Crystal Estates Services',
      },
    ],
  },
}

const serviceBlocks = [
  {
    id: 'direct-sales',
    badge: 'Core Competency',
    title: 'Direct Land Sales',
    subtitle: 'DTCP / CMDA Approved Plotted Layouts & Managed Sandalwood Farmland',
    description:
      'Purchase clear-title residential plots and high-value agro-forestry farm land directly from Crystal Estates with verified parent documents, individual patta, and physical demarcation stones.',
    howItWorks: [
      { step: '01', title: 'Plot Selection', desc: 'Browse available plotted layouts, extent measurements, and facing orientations.' },
      { step: '02', title: 'Guided Site Visit', desc: 'Complimentary weekend family pick-up to physically walk the land, inspect road access, and boundary stones.' },
      { step: '03', title: 'Legal Title Review', desc: 'Review 30-year parent deeds, nil-encumbrance certificate, and layout sanction copies with our legal team.' },
      { step: '04', title: 'Registration & Patta', desc: 'Execute spot sale deed registration at the SRO, followed by computerized online Patta name transfer.' },
    ],
    benefits: [
      'Zero brokerage fee on direct company developments',
      'Transparent pricing based on actual square-foot guide value',
      'Partnered with leading national banks for plot purchase loans',
      'Demarcated individual boundaries with permanent corner stones',
    ],
  },
  {
    id: 'purchase-resale',
    badge: 'Owner & Investor Solutions',
    title: 'Land Purchase & Resale',
    subtitle: 'Strategic Land Acquisition, Valuation Assessment & Structured Resale',
    description:
      'Whether you wish to liquidate an existing land parcel or rebalance your land portfolio, our property desk provides fair market valuations, document clearance, and seamless resale execution.',
    howItWorks: [
      { step: '01', title: 'Property Assessment', desc: 'Submit your survey number, location, and patta details for on-ground physical inspection.' },
      { step: '02', title: 'Valuation & Pricing', desc: 'Receive a fair market price assessment cross-referenced against recent sub-registrar registered transaction values.' },
      { step: '03', title: 'Title Due Diligence', desc: 'We verify revenue records, resolve minor document encumbrances, and prepare ready-to-sell document binders.' },
      { step: '04', title: 'Settlement & Resale', desc: 'Connect with verified cash buyers from our qualified investor network for transparent, timely closure.' },
    ],
    benefits: [
      'Realistic, data-backed land valuation with zero inflated false promises',
      'Rapid matchmaking with pre-vetted HNIs and institutional land buyers',
      'Complete resolution support for patta discrepancies and boundary rectifications',
      'Transparent settlement process with guaranteed legal safety',
    ],
  },
  {
    id: 'brokerage-advisory',
    badge: 'Ethical Intermediation',
    title: 'Land Brokerage & Title Advisory',
    subtitle: 'Transparent Brokerage, Boundary Survey Verification & Sub-Registrar Support',
    description:
      'Navigating unorganized land markets requires experienced stewardship. Our licensed land brokerage desk represents buyers and sellers with rigorous legal vetting, zero hidden commissions, and total documentation transparency.',
    howItWorks: [
      { step: '01', title: 'Requirement Profiling', desc: 'Define your desired land extent, budget limit, proximity to highways, and intended use.' },
      { step: '02', title: 'Curated Land Matching', desc: 'We source exclusively legally verified registered plots and acreage matching your parameters.' },
      { step: '03', title: 'Legal & Survey Audit', desc: 'Complete scrutiny of FMB sketches, revenue records, and physical boundary measurements prior to token.' },
      { step: '04', title: 'Registration Facilitation', desc: 'Drafting compliant sale deeds, calculating accurate stamp duty, and representing you through final execution.' },
    ],
    benefits: [
      '100% verified parent title link deeds before any agreement is signed',
      'Strictly zero hidden surcharges or middleman markups',
      'Direct assistance with Tamil Nadu revenue department & Taluk offices',
      'End-to-end liaison with qualified legal advocates specializing in land law',
    ],
  },
]

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        title="Land & Plot Services"
        subtitle="ASSETS CREATOR — Specialized land solutions across Chennai: Direct developer plot sales, land purchase & resale, and transparent land brokerage."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Services' },
        ]}
      />

      {/* 3 Detailed Service Blocks */}
      <Section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
          {serviceBlocks.map((svc, sIdx) => (
            <div
              key={svc.id}
              id={svc.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1.5px solid rgba(227, 221, 209, 0.9)',
                padding: 'clamp(28px, 4vw, 48px)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <Badge tone={sIdx === 0 ? 'gold' : 'primary'}>{svc.badge}</Badge>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--muted)' }}>
                    SERVICE 0{sIdx + 1}
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 36px)', color: 'var(--green-900)', margin: '0 0 6px 0' }}>
                  {svc.title}
                </h2>
                <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gold-hover)', marginBottom: '14px' }}>
                  {svc.subtitle}
                </p>
                <p style={{ fontSize: '15.5px', color: 'var(--ink-2)', lineHeight: '1.7', maxWidth: '880px', margin: 0 }}>
                  {svc.description}
                </p>
              </div>

              {/* How It Works Steps Grid */}
              <div style={{ marginBottom: '32px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--green-900)', marginBottom: '18px' }}>
                  How It Works — Step-by-Step
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {svc.howItWorks.map((st) => (
                    <div
                      key={st.step}
                      style={{
                        background: 'var(--bg-soft)',
                        borderRadius: '12px',
                        padding: '18px',
                        border: '1px solid rgba(227, 221, 209, 0.7)',
                      }}
                    >
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gold)', marginBottom: '6px' }}>
                        {st.step}
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--green-900)', marginBottom: '6px' }}>
                        {st.title}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.55', margin: 0 }}>
                        {st.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits Checklist */}
              <div
                style={{
                  background: 'var(--green-50)',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid var(--green-100)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--green-900)', margin: 0 }}>
                  Key Benefits &amp; Guarantees:
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '10px',
                  }}
                >
                  {svc.benefits.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: 'var(--ink)' }}>
                      <CheckCircle2 size={16} color="var(--green-600)" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Reusable EnquiryForm */}
      <Section title="Consult with a Land Specialist" subtitle="Tell us your requirements and our land advisors will assist you promptly" center>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <EnquiryForm
            title="Book a Free Consultation"
            subtitle="Explore available plots, request document copies, or enquire about selling land."
          />
        </div>
      </Section>

      {/* Testimonials placed directly above Footer */}
      <TestimonialsSection
        title="Landowner Confidence"
        subtitle="See why over 500+ landowners trust Crystal Estates for clear-titled land acquisition in Chennai."
      />
    </main>
  )
}
