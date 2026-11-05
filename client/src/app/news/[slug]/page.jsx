import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, Clock, User, ArrowLeft, Tag } from 'lucide-react'
import { PageHero, Container, Section, Badge } from '../../../components/ui'
import TestimonialsSection from '../../../components/TestimonialsSection'
import { newsArticles } from '../../../data/news'

export function generateStaticParams() {
  return newsArticles.map((a) => ({
    slug: a.slug,
  }))
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const { slug } = resolvedParams || {}
  const article = newsArticles.find((a) => a.slug === slug)

  if (!article) {
    return {
      title: 'Article Not Found | Crystal Estates',
      description: 'The requested article could not be found.',
    }
  }

  return {
    title: `${article.title} | Crystal Estates`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://crystalestates.in/news/${article.slug}`,
      siteName: 'Crystal Estates',
      images: [
        {
          url: article.image || '/images/hero-estate.jpg',
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
  }
}

export default async function NewsArticleDetailPage({ params }) {
  const resolvedParams = await params
  const { slug } = resolvedParams || {}
  const article = newsArticles.find((a) => a.slug === slug)

  if (!article) {
    notFound()
  }

  const otherArticles = newsArticles.filter((a) => a.slug !== article.slug).slice(0, 2)

  return (
    <main>
      <PageHero
        title={article.title}
        subtitle={`${article.category} • Published on ${article.date} • ${article.readTime}`}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'News', href: '/news' },
          { label: article.category },
        ]}
      />

      <Section>
        <Container>
          <div style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <Link
                href="/news"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--green-700)',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                <ArrowLeft size={16} /> Back to All Articles
              </Link>
            </div>

            <div
              style={{
                position: 'relative',
                height: '360px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '32px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--line)',
              }}
            >
              <Image
                src={article.image || '/images/hero-estate.jpg'}
                alt={article.title}
                fill
                sizes="(max-width: 900px) 100vw, 840px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}
            >
              <Badge tone="gold">{article.category}</Badge>
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Calendar size={14} color="var(--gold)" />
                {article.date}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Clock size={14} color="var(--gold)" />
                {article.readTime}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <User size={14} />
                By {article.author}
              </span>
            </div>

            {/* Article Content */}
            <div
              style={{
                fontSize: '16.5px',
                lineHeight: '1.8',
                color: 'var(--ink)',
                borderBottom: '1px solid var(--line)',
                paddingBottom: '40px',
                marginBottom: '40px',
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Article Tags */}
            {article.tags && article.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '40px',
                }}
              >
                <Tag size={15} color="var(--gold)" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'var(--bg-soft)',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      color: 'var(--ink-2)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Related Articles */}
            {otherArticles.length > 0 && (
              <div style={{ marginTop: '48px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    color: 'var(--green-900)',
                    marginBottom: '20px',
                  }}
                >
                  More Updates from Crystal Estates
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {otherArticles.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/news/${rel.slug}`}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        padding: '16px',
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <Badge tone="dark">{rel.category}</Badge>
                      <h4
                        style={{
                          fontSize: '15px',
                          color: 'var(--green-900)',
                          margin: 0,
                          lineHeight: '1.4',
                        }}
                      >
                        {rel.title}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {rel.date}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>

      <TestimonialsSection
        title="Landowner Confidence"
        subtitle="Transparent documentation and verified guidance are at the heart of our service."
      />
    </main>
  )
}
