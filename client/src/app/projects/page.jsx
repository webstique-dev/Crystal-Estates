import React from 'react'
import { PageHero } from '../../components/ui'
import ProjectsClientView from '../../components/projects/ProjectsClientView'
import TestimonialsSection from '../../components/TestimonialsSection'
import { fetchPlots } from '../../lib/api'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Plots & Land Projects in Chennai | Crystal Estates',
  description:
    'Explore verified residential plots, agricultural lands, and bulk land opportunities across Chennai and Kanchipuram. DTCP and CMDA approved layouts with 100% clear titles.',
  openGraph: {
    title: 'Plots & Land Projects in Chennai | Crystal Estates',
    description:
      'Explore verified residential plots, agricultural lands, and bulk land opportunities across Chennai. DTCP and CMDA approved layouts with 100% clear titles.',
    url: 'https://crystalestates.in/projects',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/hero-estate.jpg',
        width: 1200,
        height: 630,
        alt: 'Plots and Land in Chennai',
      },
    ],
  },
}

export default async function ProjectsPage() {
  const plots = await fetchPlots()

  return (
    <main>
      <PageHero
        title="Our Land & Plot Projects"
        subtitle="CMDA & DTCP approved residential plots, agricultural lands, and investment corridors across prime Chennai and Kanchipuram."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Projects' },
        ]}
      />

      <ProjectsClientView initialProjects={plots || []} />

      <TestimonialsSection
        title="Landowner Reviews"
        subtitle="Hear directly from families who secured their plots and farmland through Crystal Estates."
      />
    </main>
  )
}
