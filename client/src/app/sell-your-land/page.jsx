import React from 'react'
import {
  DollarSign,
  ShieldCheck,
  Users,
  FileCheck2,
} from 'lucide-react'
import { PageHero, Container, Section } from '../../components/ui'
import SellLandFormClient from '../../components/forms/SellLandFormClient'
import TestimonialsSection from '../../components/TestimonialsSection'

export const metadata = {
  title: 'Sell Your Land in Chennai | Direct Land Acquisition | Crystal Estates',
  description:
    'Sell your land or residential plots through Crystal Estates. Direct buyer matching, transparent valuation, clear-title due diligence, and spot registration in Chennai & Kanchipuram.',
  openGraph: {
    title: 'Sell Your Land in Chennai | Crystal Estates',
    description:
      'Sell your land or plots through Crystal Estates. Direct buyer matching, fair valuation, and spot registration.',
    url: 'https://crystalestates.in/sell-your-land',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/hero-estate.jpg',
        width: 1200,
        height: 630,
        alt: 'Sell Your Land Crystal Estates',
      },
    ],
  },
}

const benefits = [
  {
    icon: Users,
    title: 'Access to 2,000+ Verified Buyers',
    desc: 'Connect directly with pre-screened families, NRI investors, and corporate land purchasers ready for immediate transactions.',
  },
  {
    icon: DollarSign,
    title: 'Accurate Market Valuation',
    desc: 'We assess genuine market pricing derived from recent sub-registrar registered deeds rather than speculative estimates.',
  },
  {
    icon: ShieldCheck,
    title: 'Free Title & Revenue Audit',
    desc: 'Our legal and revenue experts review your parent deeds, survey records, and patta to prepare a clean, marketable document dossier.',
  },
  {
    icon: FileCheck2,
    title: 'Zero Distress, Total Transparency',
    desc: 'You maintain full control of terms with clear brokerage agreements, guaranteed milestone escrow safety, and zero hidden deductions.',
  },
]

const steps = [
  { num: '01', title: 'Submit Property Details', desc: 'Share your land location, survey number, extent, and available documentation online or via phone.' },
  { num: '02', title: 'Inspection & Due Diligence', desc: 'Our technical team conducts a discreet physical site survey and verifies revenue records.' },
  { num: '03', title: 'Pricing & Exclusive Marketing', desc: 'We align on a realistic target price and showcase your land to our qualified buyer base.' },
  { num: '04', title: 'Agreement & Registration', desc: 'Receive advance token, execute the formal sale agreement, and complete closing at the Sub-Registrar Office.' },
]

export default function SellYourLandPage() {
  return (
    <main>
      <PageHero
        title="Sell Your Land with Confidence"
        subtitle="ASSETS CREATOR — Partner with Chennai's trusted land specialists for transparent valuation, rapid buyer matching, and hassle-free registration."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Sell Your Land' },
        ]}
      />

      {/* Benefits */}
      <Section title="Why Sell Through Crystal Estates?" subtitle="We provide landowners with total safety, fair valuation, and end-to-end documentation assistance" center>
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
              marginTop: '20px',
            }}
          >
            {benefits.map((b, i) => {
              const Icon = b.icon
              return (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '28px 24px',
                    border: '1px solid rgba(227, 221, 209, 0.9)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'var(--green-50)',
                      color: 'var(--green-900)',
                      display: 'grid',
                      placeItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <Icon size={22} color="var(--gold)" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--green-900)', marginBottom: '8px' }}>
                    {b.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.6', margin: 0 }}>
                    {b.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* 4-Step Process */}
      <Section variant="light" title="Our 4-Step Selling Process" subtitle="Transparent, structured, and fast-track closure for landowners" center>
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            {steps.map((st) => (
              <div
                key={st.num}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '24px 20px',
                  border: '1.5px solid rgba(184, 150, 78, 0.3)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--gold)', marginBottom: '8px' }}>
                  {st.num}
                </div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--green-900)', marginBottom: '8px' }}>
                  {st.title}
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--muted)', lineHeight: '1.55', margin: 0 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Landowner Intake Form */}
      <Section title="Submit Your Property for Assessment" subtitle="Fill out your land specifications below to schedule an evaluation with our acquisitions team" center>
        <Container>
          <SellLandFormClient />
        </Container>
      </Section>

      <TestimonialsSection
        title="Verified Landowner Experiences"
        subtitle="Trusted by landowners, agriculturalists, and families across Chennai and Kanchipuram."
      />
    </main>
  )
}
