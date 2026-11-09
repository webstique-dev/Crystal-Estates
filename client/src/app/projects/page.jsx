import React from 'react'
import { PageHero } from '../../components/ui'
import ProjectsClientView from '../../components/projects/ProjectsClientView'
import TestimonialsSection from '../../components/TestimonialsSection'

export const metadata = {
  title: 'Plots & Land Projects in Chennai | Crystal Estates',
  description:
    'Explore verified residential plots and managed sandalwood farm land across Chennai and Kanchipuram. DTCP and CMDA approved layouts with 100% clear titles.',
  openGraph: {
    title: 'Plots & Land Projects in Chennai | Crystal Estates',
    description:
      'Explore verified residential plots and managed sandalwood farm land across Chennai. DTCP and CMDA approved layouts with 100% clear titles.',
    url: 'https://crystalestates.in/projects',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/kolapakkam.jpg',
        width: 1200,
        height: 630,
        alt: 'Plots and Land in Chennai',
      },
    ],
  },
}

export default function ProjectsPage() {
  return (
    <main>
      <PageHero
        title="Our Land & Plot Projects"
        subtitle="CMDA & DTCP approved residential plots and managed sandalwood farm lands across prime Chennai and Kanchipuram growth corridors."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Projects' },
        ]}
      />

      <ProjectsClientView />

      <TestimonialsSection
        title="Landowner Reviews"
        subtitle="Hear directly from families who secured their plots and farmland through Crystal Estates."
      />
    </main>
  )
}
