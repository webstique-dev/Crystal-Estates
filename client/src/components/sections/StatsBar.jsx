'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, CountUp } from '../ui'

const defaultStats = [
  { value: 15, suffix: '+', label: 'Years of Trust' },
  { value: 50, suffix: '+', label: 'Projects' },
  { value: 2000, suffix: '+', label: 'Happy Families' },
  { value: 100, suffix: '%', label: 'Clear Titles' },
]

/**
 * Reusable StatsBar component
 * @param {Array<{value: number, suffix: string, label: string}>} [items]
 * @param {string} [className=""]
 */
export default function StatsBar({ items = defaultStats, className = '' }) {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion()) return

      gsap.from('.stats-band__item', {
        scrollTrigger: {
          trigger: '.stats-band__grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef },
  )

  return (
    <Section variant="dark" className={`stats-band ${className}`.trim()} ref={sectionRef}>
      <div className="stats-band__grid">
        {items.map((s, idx) => (
          <div key={idx} className="stats-band__item">
            <div className="stats-band__number">
              <CountUp to={s.value} suffix={s.suffix} />
            </div>
            <div className="stats-band__label">{s.label}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

