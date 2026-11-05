import React from 'react'
import { notFound } from 'next/navigation'
import { PageHero } from '../../../components/ui'
import PropertyDetailClient from '../../../components/projects/PropertyDetailClient'
import TestimonialsSection from '../../../components/TestimonialsSection'
import { projects } from '../../../data/site'

export function generateStaticParams() {
  const params = []
  for (const p of projects) {
    if (p.slug) params.push({ slug: p.slug })
    if (p.id && p.id !== p.slug) params.push({ slug: p.id })
  }
  return params
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const { slug } = resolvedParams || {}
  const project = projects.find((p) => p.slug === slug || p.id === slug)

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
          url: project.image || '/images/vedanthangal.jpg',
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
  const project = projects.find((p) => p.slug === slug || p.id === slug)

  if (!project) {
    notFound()
  }

  return (
    <main>
      <PageHero
        title={project.name}
        subtitle={`${project.type} in ${project.location} • ${project.approval}`}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: project.name },
        ]}
      />

      <PropertyDetailClient initialProject={project} staticAllProjects={projects} />

      <TestimonialsSection
        title="Landowner Experiences"
        subtitle="Trusted by over 500+ landowners across Chennai, Kanchipuram, and surrounding growth corridors."
      />
    </main>
  )
}

