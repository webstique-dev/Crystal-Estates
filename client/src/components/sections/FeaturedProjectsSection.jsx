import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section, Container, Button } from '../ui'
import { ProjectGrid } from '../projects/ProjectGrid'
import { fetchPlots } from '../../lib/api'

export default async function FeaturedProjectsSection({
  title = 'Featured Land & Plot Projects',
  subtitle = 'CMDA & DTCP approved residential plots, agricultural lands, and investment corridors across prime Chennai corridors.',
  className = '',
}) {
  const plots = await fetchPlots()
  const featured =
    Array.isArray(plots) && plots.length > 0
      ? plots.filter((p) => p.featured !== false).slice(0, 4)
      : []

  return (
    <Section
      title={title}
      subtitle={subtitle}
      variant="light"
      className={`featured-projects ${className}`.trim()}
    >
      <Container>
        <ProjectGrid projects={featured} />
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Button href="/projects" variant="primary" size="md">
            <span>Explore All Projects</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </Container>
    </Section>
  )
}
