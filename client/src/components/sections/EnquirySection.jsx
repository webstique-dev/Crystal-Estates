import React from 'react'
import { Section, Container } from '../ui'
import EnquiryForm from '../forms/EnquiryForm'

export default function EnquirySection({
  title = 'Ready to Find Your Ideal Land in Chennai?',
  subtitle = 'Connect with our land advisors for clear-title documentation, site visits, and transparent pricing.',
  defaultInterest = 'General Inquiry',
  className = '',
}) {
  return (
    <Section
      title={title}
      subtitle={subtitle}
      variant="light"
      className={`enquiry-section ${className}`.trim()}
    >
      <Container size="md">
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '36px 32px',
            border: '1px solid rgba(15, 61, 46, 0.08)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
          }}
        >
          <EnquiryForm defaultInterest={defaultInterest} />
        </div>
      </Container>
    </Section>
  )
}

