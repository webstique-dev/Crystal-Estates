import { useState, useRef } from 'react'
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
import { Section, SectionHeading, Field, Button, LeafDecor, WhatsAppIcon } from '../ui'
import { business, plots } from '../../data/site'

const empty = { name: '', phone: '', email: '', plot: '', message: '' }

export function EnquiryForm({ selectedPlot }) {
  const [form, setForm] = useState({ ...empty, plot: selectedPlot?.name ?? '' })
  const [sent, setSent] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    const text = `Hi Crystal Estates, I'm ${form.name} (${form.phone}${form.email ? ', ' + form.email : ''}). ` +
      `${form.plot ? 'Interested in: ' + form.plot + '. ' : ''}${form.message}`
    window.open(`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    setSent(true)
    setForm(empty)
  }

  return (
    <div className="contact-card">
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="contact-form__header">
          <h3>Book a Free Site Visit</h3>
          <p>Tell us your preferred date and plot — we'll arrange a guided visit with free pick-up on request.</p>
        </div>

        <div className="contact-form__row">
          <Field label="Full Name">
            <input
              required
              value={form.name}
              onChange={set('name')}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Phone Number">
            <input
              required
              type="tel"
              pattern="[0-9+\s]{10,15}"
              value={form.phone}
              onChange={set('phone')}
              placeholder="e.g. 98400 12345"
            />
          </Field>
        </div>

        <Field label="Email Address (Optional)">
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Interested Plot / Layout">
          <select value={form.plot} onChange={set('plot')}>
            <option value="">Not decided yet / General Enquiry</option>
            {plots.filter((p) => p.status !== 'Sold Out').map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} ({p.location} · {p.approval})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Message or Questions">
          <textarea
            rows="3"
            value={form.message}
            onChange={set('message')}
            placeholder="Preferred visiting date, budget preferences, or specific questions…"
          />
        </Field>

        <Button type="submit" variant="primary" block size="sm">
          <WhatsAppIcon size={18} /> Send Enquiry via WhatsApp
        </Button>

        {sent && (
          <div className="contact-form__success">
            <CheckCircle2 size={18} />
            <span>Thank you! Your enquiry has opened in WhatsApp. Our team will assist you promptly.</span>
          </div>
        )}
      </form>
    </div>
  )
}

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
