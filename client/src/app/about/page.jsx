import React from 'react'
import Image from 'next/image'
import { Target, Compass } from 'lucide-react'
import { PageHero, Section, Badge } from '../../components/ui'
import StatsBar from '../../components/sections/StatsBar'
import TestimonialsSection from '../../components/TestimonialsSection'

export const metadata = {
  title: 'About Crystal Estates | Land & Plot Asset Creators in Chennai',
  description:
    'Learn about Crystal Estates, Chennai’s trusted land sales specialist. Our vision: To be the most trusted name in land transactions in Tamil Nadu. Our mission: Clear-title land, honest pricing, complete documentation.',
  openGraph: {
    title: 'About Crystal Estates | Land & Plot Asset Creators in Chennai',
    description:
      'Learn about Crystal Estates, Chennai’s trusted land sales specialist. Vision: To be the most trusted name in land transactions in Tamil Nadu.',
    url: 'https://crystalestates.in/about',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/hero-estate.jpg',
        width: 1200,
        height: 630,
        alt: 'About Crystal Estates Chennai',
      },
    ],
  },
}

export default function AboutPage() {
  return (
    <main>
      <PageHero
        title="About Crystal Estates"
        subtitle="ASSETS CREATOR — Over a decade of verified clear-titled land transactions, DTCP/CMDA approvals, and generational agro-forestry investments across Chennai."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'About Us' },
        ]}
      />

      {/* 1. Company Profile Section */}
      <Section
        title="The Assets Creator Story"
        subtitle="Bridging the gap between discerning land buyers and 100% legally transparent plots and farmland across Tamil Nadu."
        center
      >
        <div style={{ maxWidth: '860px', margin: '0 auto', fontSize: '16px', lineHeight: '1.8', color: 'var(--ink-2)' }}>
          <p style={{ marginBottom: '18px' }}>
            Established with an uncompromising ethos of transparency, <strong>Crystal Estates</strong> operates with a singular focus: <em>land and plot sales only</em>. In an industry often clouded by ambiguous titles, unverified layouts, and hidden fees, we set out to build a safe haven for family investors, NRI buyers, and agricultural land stewards.
          </p>
          <p style={{ marginBottom: '18px' }}>
            Headquartered in Valasaravakkam, Chennai, we curate premium residential plotted developments approved by CMDA and DTCP, alongside flagship managed sandalwood farm lands near Vedanthangal. Every piece of land we offer is preceded by rigorous legal vetting, revenue record verification, individual patta, and physical demarcation stones.
          </p>
        </div>
      </Section>

      {/* 2. Vision & Mission Cards */}
      <Section variant="light" style={{ background: '#fcfaf6' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Vision */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '36px 32px',
              border: '1.5px solid rgba(184, 150, 78, 0.35)',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--green-50)',
                  color: 'var(--green-900)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Compass size={22} />
              </div>
              <Badge tone="gold">Our Vision</Badge>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--green-900)', margin: 0 }}>
              &ldquo;To be the most trusted name in land transactions in Tamil Nadu.&rdquo;
            </h3>

            <p style={{ fontSize: '14.5px', color: 'var(--ink-2)', lineHeight: '1.7', margin: 0 }}>
              We envision a future where every landowner steps onto their property with complete certainty, knowing their asset is secured by bulletproof legal titles, strategic growth locations, and enduring generational value.
            </p>
          </div>

          {/* Mission */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '36px 32px',
              border: '1.5px solid rgba(15, 61, 46, 0.25)',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--gold-light)',
                  color: 'var(--gold-hover)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Target size={22} />
              </div>
              <Badge tone="primary">Our Mission</Badge>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--green-900)', margin: 0 }}>
              &ldquo;Clear-title land, honest pricing, complete documentation.&rdquo;
            </h3>

            <p style={{ fontSize: '14.5px', color: 'var(--ink-2)', lineHeight: '1.7', margin: 0 }}>
              We dedicate our expertise to providing frictionless land ownership through strict legal due diligence, zero hidden surcharges, spot registration guidance, and end-to-end patta transfer support for every client.
            </p>
          </div>
        </div>
      </Section>

      {/* 3. Management Message with Photo */}
      <Section title="Leadership Perspective" subtitle="Direct from the founders and management desk" center>
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(227, 221, 209, 0.9)',
            padding: 'clamp(28px, 4vw, 48px)',
            boxShadow: 'var(--shadow-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '36px',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                aspectRatio: '4 / 5',
                maxHeight: '380px',
                background: 'var(--green-900)',
                border: '3px solid var(--gold-border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              <Image
                src="/images/vedanthangal.jpg"
                alt="Crystal Estates Management"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-14px',
                left: '20px',
                right: '20px',
                background: 'var(--green-900)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.04em',
              }}
            >
              MANAGEMENT & TITLE ADVISORY
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              MANAGEMENT MESSAGE
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 28px)', color: 'var(--green-900)', margin: '8px 0 16px' }}>
              Building Generational Security on Clear Soil
            </h3>
            <blockquote style={{ fontSize: '15px', color: 'var(--ink-2)', lineHeight: '1.75', fontStyle: 'italic', marginBottom: '18px' }}>
              &ldquo;Land is not merely an investment; it is the physical foundation upon which families build their future and pass down wealth. At Crystal Estates, our promise as ASSETS CREATORS is simple: we never compromise on parent deeds, we never sell land we wouldn’t proudly buy ourselves, and we stand beside every landowner from first site visit to the final patta transfer.&rdquo;
            </blockquote>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: 'var(--green-900)' }}>
                Ramesh Kumar &amp; Directors
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Crystal Estates — Chennai, Tamil Nadu
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. StatsBar */}
      <StatsBar />

      {/* 5. TestimonialsSection directly above Footer */}
      <TestimonialsSection
        title="What Our Landowners Say"
        subtitle="Verified experiences from families and investors who have built lasting land assets with Crystal Estates across Chennai & Kanchipuram."
      />
    </main>
  )
}
