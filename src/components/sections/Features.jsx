'use client'

import { useRef } from 'react'
import {
  Trees,
  Sprout,
  ShieldCheck,
  Fence,
  Route,
  Handshake,
  Check,
} from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, SectionHeading, LeafDecor } from '../ui'
import { whySandalwood } from '../../data/site'

const Icons = {
  TreePine: Trees,
  Sprout: Sprout,
  ShieldCheck: ShieldCheck,
  Fence: Fence,
  Road: Route,
  Handshake: Handshake,
}

export function FeatureCard({ icon, title, text }) {
  const Icon = Icons[icon] || Check
  return (
    <div className="feature-card-wrap">
      <div className="feature-card">
        <div className="feature-card__icon-box">
          <Icon size={24} />
        </div>
        <h3 className="feature-card__title">{title}</h3>
        <p className="feature-card__text">{text}</p>
      </div>
    </div>
  )
}

export default function Features() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion()) return

      // Heading animation
      gsap.from('.features-sec .heading', {
        scrollTrigger: {
          trigger: '.features-sec .heading',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      // Cards stagger
      gsap.from('.feature-card-wrap', {
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef },
  )

  return (
    <Section id="why-sandalwood" variant="soft" className="features-sec" ref={sectionRef}>
      <LeafDecor variant="branch" className="features-sec__leaf" opacity={0.06} style={{ bottom: 20, left: 10 }} />
      <SectionHeading
        center
        eyebrow="Why Sandalwood & Farm Land"
        title="Invest in High-Value Nature & Lasting Wealth"
        text="Everything you need to feel confident and secure about your farmland and plot investment — with 100% legal clarity, professional farm care, and zero guesswork."
      />
      <div className="features-grid">
        {whySandalwood.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </Section>
  )
}
