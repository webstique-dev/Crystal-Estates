'use client'

import { useRef } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, SectionHeading, LeafDecor, WhatsAppIcon } from '../ui'
import { business } from '../../data/site'
import EnquiryForm from '../forms/EnquiryForm'
export { EnquiryForm }

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="contact-info-row">
    <div className="contact-info-row__icon">
      <Icon size={20} />
    </div>
    <div className="contact-info-row__content">
      <span className="contact-info-row__label">{label}</span>
      <div className="contact-info-row__value">{children}</div>
    </div>
  </div>
)

export default function Contact({ selectedPlot }) {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion()) return

      gsap.from('.contact-col--left > *', {
        scrollTrigger: {
          trigger: '.contact-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })

      gsap.from('.contact-col--right', {
        scrollTrigger: {
          trigger: '.contact-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        y: 35,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef },
  )

  return (
    <Section id="contact" className="contact-sec" ref={sectionRef}>
      <LeafDecor variant="branch" className="contact-sec__leaf" opacity={0.06} style={{ top: 10, left: 20 }} />
      <div className="contact-grid">
        <div className="contact-col contact-col--left">
          <SectionHeading
            eyebrow="Contact & Location"
            title="Visit our office or schedule a tour"
            text="We'd love to walk you through our layouts and answer any documentation questions. Drop by or book a site visit."
          />

          <div className="contact-info-list">
            <InfoRow icon={MapPin} label="Office Address">
              <span>{business.address.full}</span>
            </InfoRow>

            <InfoRow icon={Phone} label="Call Directly">
              <a href={`tel:${business.phone.replace(/\s/g, '')}`}>{business.phone}</a>
            </InfoRow>

            <InfoRow icon={Mail} label="Email Address">
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </InfoRow>

            <InfoRow icon={Clock} label="Office Hours">
              <span>{business.hours}</span>
            </InfoRow>
          </div>

          <div className="contact-map-frame">
            <iframe
              title="Crystal Estates office location"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&output=embed`}
            />
          </div>
        </div>

        <div className="contact-col contact-col--right">
          <EnquiryForm key={selectedPlot?.id ?? 'none'} selectedPlot={selectedPlot} />
        </div>
      </div>
    </Section>
  )
}
