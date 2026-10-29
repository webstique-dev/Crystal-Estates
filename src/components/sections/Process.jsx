'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, SectionHeading, LeafDecor } from '../ui'
import { steps } from '../../data/site'

export default function Process() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion()) return

      // Heading animation
      gsap.from('.process-sec .heading', {
        scrollTrigger: {
          trigger: '.process-sec .heading',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      // Step cards stagger
      gsap.from('.process-step', {
        scrollTrigger: {
          trigger: '.process-steps',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef },
  )

  return (
    <Section id="process" className="process-sec" ref={sectionRef}>
      <LeafDecor variant="single" className="process-sec__leaf" opacity={0.05} style={{ top: 20, right: 30 }} />
      <SectionHeading
        center
        eyebrow="How It Works"
        title="From enquiry to handover in 5 simple steps"
        text="A transparent, hassle-free path to owning your approved residential plot in Chennai."
      />
      <div className="process-steps">
        {steps.map((s, i) => (
          <div key={s.title} className="process-step">
            <div className="process-step__header">
              <span className="process-step__num">{String(i + 1).padStart(2, '0')}</span>
              {i < steps.length - 1 && <span className="process-step__connector" />}
            </div>
            <h3 className="process-step__title">{s.title}</h3>
            <p className="process-step__text">{s.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
