import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section, Container, Button } from '../ui'
import { ProjectGrid } from '../projects/ProjectGrid'
import { projects } from '../../data/site'

export default function FeaturedProjectsSection({
  title = 'Featured Land & Plot Projects',
  subtitle = 'CMDA & DTCP approved plots and managed sandalwood farm lands across prime Chennai corridors.',
  className = '',
}) {
  const featured = projects.filter((p) => p.featured).slice(0, 4)

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

