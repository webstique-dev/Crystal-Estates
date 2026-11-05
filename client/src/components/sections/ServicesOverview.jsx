import React from 'react'
import Link from 'next/link'
import { Landmark, ArrowLeftRight, Briefcase, ArrowUpRight } from 'lucide-react'
import { Section, Container } from '../ui'

const defaultServices = [
  {
    icon: Landmark,
    title: 'Direct Land Sales',
    description:
      'DTCP and CMDA approved residential plots and managed sandalwood farmland with 100% verified legal documents, clear parent titles, and immediate spot registration.',
    href: '/services',
  },
  {
    icon: ArrowLeftRight,
    title: 'Land Purchase & Resale',
    description:
      'Strategic land acquisition, fair market valuation, encumbrance due diligence, and reliable resale facilitation for individual landowners and property investors.',
    href: '/services',
  },
  {
    icon: Briefcase,
    title: 'Land Brokerage',
    description:
      'Professional land advisory and ethical brokerage across Chennai & Kanchipuram with complete transparency, zero hidden charges, and end-to-end documentation.',
    href: '/services',
  },
]

export default function ServicesOverview({
  title = 'Our Land Solutions',
  subtitle = 'Exclusively focused on verified residential plots, farmland, and acreage across Chennai.',
  services = defaultServices,
  className = '',
}) {
  return (
    <Section
      title={title}
      subtitle={subtitle}
      variant="light"
      className={`services-overview ${className}`.trim()}
    >
      <Container>
        <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {services.map((svc, idx) => {
            const Icon = svc.icon
            return (
              <div
                key={idx}
                className="service-card"
                style={{
                  background: '#FFFFFF',
                  padding: '32px 28px',
                  borderRadius: '16px',
                  border: '1px solid rgba(15, 61, 46, 0.08)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: 'rgba(15, 61, 46, 0.08)',
                      color: 'var(--green-900, #0F3D2E)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <Icon size={26} />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading, "Playfair Display", Georgia, serif)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: 'var(--green-950, #0a241b)',
                      marginBottom: '12px',
                    }}
                  >
                    {svc.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.925rem',
                      lineHeight: 1.6,
                      color: '#4B5563',
                      marginBottom: '24px',
                    }}
                  >
                    {svc.description}
                  </p>
                </div>

                <Link
                  href={svc.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--gold-600, #B8964E)',
                    textDecoration: 'none',
                  }}
                >
                  <span>Learn more</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}

