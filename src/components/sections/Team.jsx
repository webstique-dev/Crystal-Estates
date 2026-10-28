import { useRef } from 'react'
import { ArrowRight, UserCheck } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, Button, LeafDecor } from '../ui'
import { teamMembers } from '../../data/site'

export default function Team() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion()) return

      // Left cards stagger
      gsap.from('.team-card', {
        scrollTrigger: {
          trigger: '.team-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 35,
        opacity: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: 'power3.out',
      })

      // Right content
      gsap.from('.team-content > *', {
        scrollTrigger: {
          trigger: '.team-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.75,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef },
  )

  return (
    <Section variant="dark" className="team-sec" ref={sectionRef}>
      <LeafDecor variant="single" className="team-sec__leaf" opacity={0.05} style={{ top: 20, right: 30 }} />

      <div className="team-grid">
        {/* Left Side: 3 Professional Real Estate Advisor Cards */}
        <div className="team-cards">
          {teamMembers.map((member) => (
            <div key={member.name} className="team-card">
              <div className="team-card__image-box">
                <img
                  src={member.image}
                  alt={member.name}
                  className="team-card__img"
                  loading="lazy"
                />
                <div className="team-card__overlay">
                  <h4 className="team-card__name">{member.name}</h4>
                  <span className="team-card__role">{member.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Editorial Heading & Supporting Text */}
        <div className="team-content">
          <span className="eyebrow" style={{ color: 'var(--green-500)' }}>
            <UserCheck size={14} style={{ display: 'inline', marginRight: 6 }} />
            Dedicated Guidance
          </span>
          <h2 className="team-content__title">Meet Our Expert Team</h2>
          <p className="team-content__desc">
            Our team of experienced real estate professionals is committed to helping you find the perfect plot or investment property with 100% verified documentation and honest market advisory.
          </p>
          <div className="team-content__cta">
            <Button as="a" href="#contact" variant="light" size="sm">
              Book a Site Visit <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
