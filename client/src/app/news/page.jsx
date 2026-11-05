import React from 'react'
import { PageHero, Container, Section } from '../../components/ui'
import NewsCard from '../../components/news/NewsCard'
import TestimonialsSection from '../../components/TestimonialsSection'
import { newsArticles } from '../../data/news'

export const metadata = {
  title: 'News & Updates | Land Investment Insights | Crystal Estates',
  description:
    'Stay updated with Chennai real estate regulations, CMDA and DTCP approvals, patta guidelines, and managed sandalwood farm land insights from Crystal Estates.',
  openGraph: {
    title: 'News & Updates | Crystal Estates Chennai',
    description:
      'Chennai real estate regulations, CMDA & DTCP approvals, and land investment insights.',
    url: 'https://crystalestates.in/news',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/hero-estate.jpg',
        width: 1200,
        height: 630,
        alt: 'Crystal Estates News & Updates',
      },
    ],
  },
}

export default function NewsPage() {
  return (
    <main>
      <PageHero
        title="News & Land Insights"
        subtitle="Market trends, legal guidelines, patta verification insights, and agro-forestry updates across Chennai and Tamil Nadu."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'News & Updates' },
        ]}
      />

      <Section>
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '32px',
            }}
          >
            {newsArticles.map((art) => (
              <NewsCard key={art.id} article={art} />
            ))}
          </div>
        </Container>
      </Section>

      <TestimonialsSection
        title="Trusted Land Advice"
        subtitle="Transparent insights and authentic buyer satisfaction have made Crystal Estates Chennai’s premier land asset creator."
      />
    </main>
  )
}
