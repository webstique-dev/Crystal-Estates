import React from 'react'
import { PageHero } from '../../components/ui'
import FaqClientAccordion from '../../components/faq/FaqClientAccordion'
import TestimonialsSection from '../../components/TestimonialsSection'

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | Crystal Estates Chennai',
  description:
    'Answers to questions about buying land in Chennai: DTCP & CMDA approvals, clear patta titles, 30-year EC verification, spot registration, and sandalwood farm land management.',
  openGraph: {
    title: 'Frequently Asked Questions | Crystal Estates Chennai',
    description:
      'Clear answers to questions about buying land, approvals, registration, and documentation in Chennai.',
    url: 'https://crystalestates.in/faq',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/hero-estate.jpg',
        width: 1200,
        height: 630,
        alt: 'Crystal Estates FAQ',
      },
    ],
  },
}

export default function FaqPage() {
  return (
    <main>
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Transparent answers regarding land title verification, DTCP/CMDA approvals, sub-registrar registration, and guided site visits in Chennai."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'FAQ' },
        ]}
      />

      <FaqClientAccordion />

      <TestimonialsSection
        title="Landowner Confidence"
        subtitle="Trusted by over 500+ landowners across Chennai, Kanchipuram, and surrounding growth corridors."
      />
    </main>
  )
}
