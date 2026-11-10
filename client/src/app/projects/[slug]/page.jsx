import React from 'react'
import { notFound } from 'next/navigation'
import { PageHero } from '../../../components/ui'
import PropertyDetailClient from '../../../components/projects/PropertyDetailClient'
import TestimonialsSection from '../../../components/TestimonialsSection'
import { fetchPlotBySlugOrId, fetchPlots } from '../../../lib/api'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const { slug } = resolvedParams || {}
  const project = await fetchPlotBySlugOrId(slug)

  if (!project) {
    return {
      title: 'Property Not Found | Crystal Estates',
      description: 'The requested land or plot listing could not be found.',
    }
  }

  return {
    title: `${project.name} | Crystal Estates Chennai`,
    description:
      project.description ||
      `Verified ${project.type} in ${project.location}. 100% clear title patta with complete legal documentation.`,
    openGraph: {
      title: `${project.name} | Crystal Estates`,
      description: project.description,
      url: `https://crystalestates.in/projects/${project.slug || project.id}`,
      siteName: 'Crystal Estates',
      images: [
        {
          url: project.image || '/images/hero-estate.jpg',
          width: 1200,
          height: 630,
          alt: project.name,
        },
      ],
    },
  }
}

export default async function PropertyDetailPage({ params }) {
  const resolvedParams = await params
  const { slug } = resolvedParams || {}
  const [project, allProjects] = await Promise.all([
    fetchPlotBySlugOrId(slug),
    fetchPlots(),
  ])

  if (!project) {
    notFound()
  }

  return (
    <main>
      <PageHero
        title={project.name}
        subtitle={`${project.type || 'Property'} in ${project.location} • ${project.approval || 'Verified'}`}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: project.name },
        ]}
      />

      <PropertyDetailClient initialProject={project} staticAllProjects={allProjects || []} />

      <TestimonialsSection
        title="Landowner Experiences"
        subtitle="Trusted by over 500+ landowners across Chennai, Kanchipuram, and surrounding growth corridors."
      />
    </main>
  )
}
