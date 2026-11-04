'use client'

import { useRef } from 'react'
import { Star, CheckCircle } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, SectionHeading, LeafDecor } from '../ui'
import { testimonials } from '../../data/site'

export function QuoteCard({ name, place, text }) {
  return (
    <div className="quote-card-wrap">
      <div className="quote-card">
        <div className="quote-card__stars">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />
          ))}
        </div>
        <p className="quote-card__text">“{text}”</p>
        <div className="quote-card__author">
          <div className="quote-card__avatar">{name[0]}</div>
          <div>
            <div className="quote-card__name-row">
              <strong>{name}</strong>
              <span className="quote-card__verified">
                <CheckCircle size={12} /> Verified Buyer
              </span>
            </div>
            <span className="quote-card__place">{place}, Chennai</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion()) return

      // Heading animation
      gsap.from('.reviews-sec .heading', {
        scrollTrigger: {
          trigger: '.reviews-sec .heading',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      // Cards stagger
      gsap.from('.quote-card-wrap', {
        scrollTrigger: {
          trigger: '.reviews-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef },
  )

  return (
    <Section id="reviews" variant="soft" className="reviews-sec" ref={sectionRef}>
      <LeafDecor variant="branch" className="reviews-sec__leaf" opacity={0.06} style={{ top: 20, right: 20 }} />
      <SectionHeading
        center
        eyebrow="Reviews"
        title="What our plot buyers say"
        text="Real experiences from families and investors who bought approved land with Crystal Estates."
      />
      <div className="reviews-grid">
        {testimonials.map((t) => (
          <QuoteCard key={t.name} {...t} />
        ))}
      </div>
    </Section>
  )
}
