import React from 'react'
import { PageHero } from '../../components/ui'
import GalleryClientView from '../../components/gallery/GalleryClientView'
import TestimonialsSection from '../../components/TestimonialsSection'

export const metadata = {
  title: 'Project Gallery | Site Photos & Layouts | Crystal Estates Chennai',
  description:
    'Visual project gallery of Crystal Estates: on-ground site photographs, drone aerial panoramas, approved master layout plans, and guided walkthrough videos across Chennai & Kanchipuram.',
  openGraph: {
    title: 'Project Gallery | Site Photos & Layouts | Crystal Estates',
    description:
      'On-ground site photographs, drone views, and approved layout plans across Chennai.',
    url: 'https://crystalestates.in/gallery',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/hero-estate.jpg',
        width: 1200,
        height: 630,
        alt: 'Crystal Estates Gallery',
      },
    ],
  },
}

export default function GalleryPage() {
  return (
    <main>
      <PageHero
        title="Visual Project Gallery"
        subtitle="On-ground site photographs, drone aerial panoramas, approved master layout plans, and guided walkthrough videos across Chennai & Kanchipuram."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Gallery' },
        ]}
      />

      <GalleryClientView />

      <TestimonialsSection
        title="Verified Landowner Confidence"
        subtitle="Every plot in our gallery is supported by clear titles, DTCP/CMDA approvals, and satisfied buyers."
      />
    </main>
  )
}
