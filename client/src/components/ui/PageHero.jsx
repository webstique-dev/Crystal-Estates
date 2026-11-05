'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Container } from './index'

/**
 * Reusable PageHero component
 * @param {string|React.ReactNode} title - Main page title
 * @param {string|React.ReactNode} [subtitle] - Optional descriptive text
 * @param {Array<{label: string, href?: string}>|Array<string>} [breadcrumb] - Breadcrumb hierarchy
 * @param {string} [background] - Optional background image URL
 * @param {string|React.ReactNode} [eyebrow] - Small badge/tag above the title
 * @param {string} [className] - Additional class names
 * @param {React.ReactNode} [children] - Optional slot for action buttons, stats, etc.
 */
export function PageHero({
  title,
  subtitle,
  breadcrumb,
  background,
  eyebrow = 'ASSETS CREATOR',
  className = '',
  children,
}) {
  // Normalize breadcrumbs: fallback to Home -> title if none provided
  const items = breadcrumb && breadcrumb.length > 0
    ? breadcrumb.map((item) => (typeof item === 'string' ? { label: item } : item))
    : [
        { label: 'Home', href: '/' },
        { label: typeof title === 'string' ? title : 'Page' },
      ]

  const style = background
    ? { backgroundImage: `url(${background})` }
    : undefined

  return (
    <section className={`page-hero ${background ? 'page-hero--has-bg' : ''} ${className}`.trim()} style={style}>
      <Container className="page-hero__container">
        {eyebrow && (
          <div className="page-hero__eyebrow-wrap">
            <span className="page-hero__eyebrow">{eyebrow}</span>
          </div>
        )}

        <h1 className="page-hero__title">{title}</h1>

        {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}

        <nav aria-label="Breadcrumb" className="page-hero__breadcrumb">
          <ol>
            {items.map((item, idx) => {
              const isLast = idx === items.length - 1
              return (
                <li key={idx} className={`page-hero__breadcrumb-item ${isLast ? 'page-hero__breadcrumb-item--active' : ''}`}>
                  {!isLast && item.href ? (
                    <Link href={item.href} className="page-hero__breadcrumb-link">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="page-hero__breadcrumb-current" aria-current={isLast ? 'page' : undefined}>
                      {item.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight size={13} className="page-hero__breadcrumb-sep" />}
                </li>
              )
            })}
          </ol>
        </nav>

        {children && <div className="page-hero__extra">{children}</div>}
      </Container>
    </section>
  )
}

export default PageHero

