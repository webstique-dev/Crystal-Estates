'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { Section, Container, Button } from '../ui'
import { newsArticles } from '../../data/news'

export default function LatestUpdatesSection({
  title = 'Latest Property Updates',
  subtitle = 'Market trends, regulatory updates, CMDA/DTCP insights, and land appreciation analysis across Chennai.',
  className = '',
}) {
  const updates = newsArticles.slice(0, 3)

  return (
    <Section
      title={title}
      subtitle={subtitle}
      variant="light"
      className={`latest-updates-sec ${className}`.trim()}
    >
      <Container>
        <div className="updates-grid">
          {updates.map((item) => (
            <article key={item.id} className="update-card">
              <Link href={`/news/${item.slug}`} className="update-card__media-link">
                <div className="update-card__media">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="update-card__img"
                  />
                  <span className="update-card__category">{item.category}</span>
                </div>
              </Link>

              <div className="update-card__body">
                <div className="update-card__meta">
                  <span className="update-card__meta-item">
                    <Calendar size={13} />
                    <span>{item.date}</span>
                  </span>
                  <span className="update-card__meta-sep">•</span>
                  <span className="update-card__meta-item">
                    <Clock size={13} />
                    <span>{item.readTime}</span>
                  </span>
                </div>

                <h3 className="update-card__title">
                  <Link href={`/news/${item.slug}`}>
                    {item.title}
                  </Link>
                </h3>

                <p className="update-card__excerpt">{item.excerpt}</p>

                <div className="update-card__footer">
                  <Link href={`/news/${item.slug}`} className="update-card__read-link">
                    <span>Read Full Update</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Button href="/news" variant="primary" size="md">
            <span>View All Property Updates</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </Container>
    </Section>
  )
}

