import { useRef } from 'react'
import { CheckCircle2, Star, ShieldCheck, BadgeCheck, Landmark } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, Button, LeafDecor } from '../ui'
import { business } from '../../data/site'

export default function About() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion()) return

      // Header animation
      gsap.from('.excellence-sec__heading', {
        scrollTrigger: {
          trigger: '.excellence-sec__heading',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })

      // 3-Column balanced entrance
      gsap.from('.excellence-col--left > *', {
        scrollTrigger: {
          trigger: '.excellence-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      })

      gsap.from('.excellence-art', {
        scrollTrigger: {
          trigger: '.excellence-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        scale: 0.94,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      })

      gsap.from('.excellence-col--right > *', {
        scrollTrigger: {
          trigger: '.excellence-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef },
  )

  return (
    <Section id="about" className="excellence-sec" ref={sectionRef}>
      <LeafDecor variant="branch" className="excellence-sec__leaf excellence-sec__leaf--left" opacity={0.06} />

      {/* Centered Grand Editorial Heading matching reference */}
      <div className="excellence-sec__heading">
        <h2>
          Experience Excellence<br />
          In Real Estate
        </h2>
      </div>

      <div className="excellence-grid">
        {/* Left Column: Mission, Narrative & Approvals */}
        <div className="excellence-col excellence-col--left">
          <div className="excellence-col__lead">
            <h3>Your Trusted Partner in Finding the Perfect Plot</h3>
            <p>
              At {business.name}, we believe that buying land should be an exciting and stress-free experience.
              From our office in Sridevi Gardens, Valasaravakkam, we guide every buyer through plot selection,
              legal verification, and clear registration — with zero pressure and complete transparency.
            </p>
          </div>

          <div>
            <Button as="a" href="#contact" variant="dark" size="sm">
              Talk to Our Team
            </Button>
          </div>

          <div className="excellence-partners">
            <span className="excellence-partners__label">Recognized & Approved:</span>
            <div className="excellence-partners__list">
              <span className="excellence-partner-pill"><ShieldCheck size={14} /> DTCP</span>
              <span className="excellence-partner-pill"><BadgeCheck size={14} /> CMDA</span>
              <span className="excellence-partner-pill"><CheckCircle2 size={14} /> RERA</span>
              <span className="excellence-partner-pill"><Landmark size={14} /> Bank Approved</span>
            </div>
          </div>
        </div>

        {/* Center Column: Portrait Luxury Villa Image with Smooth Rounded Corners */}
        <div className="excellence-col excellence-col--center">
          <div className="excellence-art">
            <img
              src="/images/excellence-villa.jpg"
              alt="Luxury modern architectural estate at sunset"
              className="excellence-art__img"
              loading="lazy"
            />
          </div>
        </div>

        {/* Right Column: Expert Guidance, Wide Selection & Reviews Stack */}
        <div className="excellence-col excellence-col--right">
          <div className="excellence-feature">
            <h4>Expert Guidance</h4>
            <p>
              Our experienced property advisors provide professional title vetting, encumbrance certificate (EC) checks, and personalized support at every step.
            </p>
          </div>

          <div className="excellence-divider" />

          <div className="excellence-feature">
            <h4>Wide Property Selection</h4>
            <p>
              From prime residential plots in Valasaravakkam to fast-growing gated layouts in Porur, Mangadu, and Maduravoyal.
            </p>
          </div>

          <div className="excellence-divider" />

          <div className="excellence-reviews">
            <span className="excellence-reviews__title">Reviews:</span>
            <div className="excellence-reviews__stack">
              <div className="excellence-avatars">
                <span className="excellence-avatar excellence-avatar--1">R</span>
                <span className="excellence-avatar excellence-avatar--2">P</span>
                <span className="excellence-avatar excellence-avatar--3">A</span>
              </div>
              <div className="excellence-reviews__rating">
                <div className="excellence-stars">
                  <Star size={14} fill="#c9a24b" color="#c9a24b" />
                  <Star size={14} fill="#c9a24b" color="#c9a24b" />
                  <Star size={14} fill="#c9a24b" color="#c9a24b" />
                  <Star size={14} fill="#c9a24b" color="#c9a24b" />
                  <Star size={14} fill="#c9a24b" color="#c9a24b" />
                </div>
                <span><strong>4.9</strong> Customer Ratings · 500+ Buyers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
