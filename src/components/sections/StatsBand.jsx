'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, CountUp } from '../ui'
import { stats } from '../../data/site'

export default function StatsBand() {
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
    <Section variant="dark" className="stats-band" ref={sectionRef}>
      <div className="stats-band__grid">
        {stats.map((s) => (
          <div key={s.label} className="stats-band__item">
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
