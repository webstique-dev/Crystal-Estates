import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import { Badge } from '../ui'

export default function NewsCard({ article }) {
  if (!article) return null

  return (
    <article
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid rgba(227, 221, 209, 0.85)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', height: '210px', background: '#ece7dd' }}>
        <Image
          src={article.image || '/images/hero-estate.jpg'}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          style={{ objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 1 }}>
          <Badge tone="gold">{article.category}</Badge>
        </div>
      </div>

      <div
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '12.5px',
              color: 'var(--muted)',
              marginBottom: '10px',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} color="var(--gold)" />
              {article.date}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} color="var(--gold)" />
              {article.readTime}
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              lineHeight: '1.35',
              color: 'var(--green-900)',
              marginBottom: '10px',
            }}
          >
            <Link
              href={`/news/${article.slug}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {article.title}
            </Link>
          </h3>

          <p style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.6', margin: 0 }}>
            {article.excerpt}
          </p>
        </div>

        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '12.5px',
              color: 'var(--muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <User size={13} />
            {article.author}
          </span>

          <Link
            href={`/news/${article.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--green-700)',
              fontWeight: '700',
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            <span>Read full update</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  )
}

