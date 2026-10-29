'use client'

import { useState, useRef } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, SectionHeading } from '../ui'
import { faqs } from '../../data/site'

export function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className={`faq-card ${open ? 'faq-card--open' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="faq-card__trigger"
      >
        <span className="faq-card__question">{q}</span>
        <span className="faq-card__icon">
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      {open && (
        <div className="faq-card__answer">
          <p>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function Faq() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion()) return

      // Heading animation
      gsap.from('.faq-sec .heading', {
        scrollTrigger: {
          trigger: '.faq-sec .heading',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      // FAQ accordion items stagger
      gsap.from('.faq-card', {
        scrollTrigger: {
          trigger: '.faq-sec__list',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef },
  )

  return (
    <Section className="faq-sec" ref={sectionRef}>
      <div className="faq-sec__container">
        <SectionHeading
          center
          eyebrow="FAQ"
          title="Frequently asked questions"
          text="Everything you need to know about approvals, registration, and site visits."
        />
        <div className="faq-sec__list">
          {faqs.map((f, i) => (
            <FaqItem key={f.q} index={i} {...f} />
          ))}
        </div>
      </div>
    </Section>
  )
}
