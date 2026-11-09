import React from 'react'
import {
  ShieldCheck,
  BadgeCheck,
  FileCheck2,
  Receipt,
  Car,
  Landmark,
} from 'lucide-react'
import { Section, Container } from '../ui'

const defaultPoints = [
  {
    icon: ShieldCheck,
    title: '100% Clear Titles',
    description: 'Every property goes through exhaustive 30-year legal searches and high-court title scrutiny before being offered to buyers.',
  },
  {
    icon: BadgeCheck,
    title: 'DTCP & CMDA Approved',
    description: 'All layouts comply strictly with Chennai Metropolitan Development Authority (CMDA) and DTCP norms and guidelines.',
  },
  {
    icon: FileCheck2,
    title: 'Registration Support',
    description: 'Complete hands-on assistance through sub-registrar office scheduling, token generation, draft vetting, and spot patta transfer.',
  },
  {
    icon: Receipt,
    title: 'Transparent Pricing',
    description: 'Honest, all-inclusive sq.ft pricing with zero hidden development charges, brokerage surprises, or unrecorded fees.',
  },
  {
    icon: Car,
    title: 'Site Visit Assistance',
    description: 'Complimentary weekend cab pick-up from Chennai locations with accompanied on-site survey and boundary stone inspection.',
  },
  {
    icon: Landmark,
    title: 'Bank Loan Guidance',
    description: 'Tie-ups with leading nationalized and private banks for fast, seamless plot loans with minimal paperwork.',
  },
]

export default function WhyChooseUs({
  title = 'Why Choose Crystal Estates',
  subtitle = 'Six core pillars that make us Chennai’s most trusted land and plot asset creator.',
  points = defaultPoints,
  className = '',
}) {
  return (
    <Section
      title={title}
      subtitle={subtitle}
      variant="subtle"
      className={`why-choose-us ${className}`.trim()}
    >
      <Container>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {points.map((pt, idx) => {
            const Icon = pt.icon
            return (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  padding: '28px 24px',
                  borderRadius: '14px',
                  border: '1px solid rgba(15, 61, 46, 0.07)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    background: 'rgba(184, 150, 78, 0.12)',
                    color: 'var(--gold-700, #9A7B38)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading, "Playfair Display", Georgia, serif)',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'var(--green-950, #0a241b)',
                      marginBottom: '8px',
                    }}
                  >
                    {pt.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: '#4B5563',
                      margin: 0,
                    }}
                  >
                    {pt.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}

