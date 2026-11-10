'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Field, Button, WhatsAppIcon } from '../ui'
import { business } from '../../data/site'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  interest: '',
  message: '',
}

export default function EnquiryForm({
  selectedPlot,
  prefillInterest,
  title = 'Book a Guided Site Visit',
  subtitle = 'Inspect demarcated boundaries, physical road access, and verify original patta documents.',
  className = '',
  onSuccess,
}) {
  const initialInterest =
    typeof selectedPlot === 'string'
      ? selectedPlot
      : selectedPlot?.name || prefillInterest || ''

  const [form, setForm] = useState({ ...initialForm, interest: initialInterest })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [availablePlots, setAvailablePlots] = useState([])

  useEffect(() => {
    fetch('/api/plots')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.plots)) {
          setAvailablePlots(data.plots.filter((p) => p.status !== 'Sold Out' && p.status !== 'Sold'))
        }
      })
      .catch(() => {})
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Please provide your full name.'
    }
    const cleanPhone = form.phone.replace(/[\s+-]/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please provide a valid 10-digit mobile number.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      property: form.interest.trim() || 'General Enquiry',
      interest: form.interest.trim() || 'General Enquiry',
      message: form.message.trim(),
      source: 'Website - Enquiry Form',
      stage: 'new',
      timestamp: new Date().toISOString(),
    }

    // Post to enquiry endpoint to store automatically in MongoDB leads collection
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn('Enquiry POST failed:', err)
      })
    } catch (err) {
      console.warn('Enquiry error:', err)
    }

    // Also dispatch to WhatsApp to guarantee lead delivery
    const text =
      `Hi Crystal Estates, I'm ${payload.name} (${payload.phone}${payload.email ? ', ' + payload.email : ''}). ` +
      `${payload.interest ? 'Interested in: ' + payload.interest + '. ' : ''}` +
      `${payload.message ? payload.message : 'Please share available plots & guided visit details.'}`

    window.open(
      `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    )

    setSubmitting(false)
    setSent(true)
    if (onSuccess) onSuccess(payload)
  }

  return (
    <div className={`contact-card ${className}`.trim()}>
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="contact-form__header">
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="contact-form__row">
          <Field label="Full Name *">
            <input
              required
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. Ramesh Kumar"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <span className="field-error" style={{ color: '#d9534f', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} /> {errors.name}
              </span>
            )}
          </Field>

          <Field label="Phone Number *">
            <input
              required
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="e.g. 98400 12345"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <span className="field-error" style={{ color: '#d9534f', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} /> {errors.phone}
              </span>
            )}
          </Field>
        </div>

        <Field label="Email Address (Optional)">
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Interested Plot or Layout">
          <select value={form.interest} onChange={handleChange('interest')}>
            <option value="">General Enquiry / Not Decided</option>
            {availablePlots.map((p) => (
              <option key={p.id || p.projectId || p.name} value={p.name}>
                {p.name} ({p.location || 'Chennai'}{p.approval ? ` • ${p.approval}` : ''})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Preferred Visit Date or Questions">
          <textarea
            rows="3"
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Preferred weekend date for visit, budget range, or specific questions…"
          />
        </Field>

        <Button type="submit" variant="primary" block size="sm" disabled={submitting}>
          <WhatsAppIcon size={18} />
          <span>{submitting ? 'Connecting…' : 'Send Enquiry via WhatsApp'}</span>
        </Button>

        {sent && (
          <div className="contact-form__success" role="alert" style={{ marginTop: '14px' }}>
            <CheckCircle2 size={18} />
            <span>Thank you! Your enquiry has opened in WhatsApp. Our property advisor will connect with you shortly.</span>
          </div>
        )}
      </form>
    </div>
  )
}

