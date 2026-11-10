'use client'

import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { WhatsAppIcon, Field, Button } from '../ui'
import { business } from '../../data/site'

export default function SellLandFormClient() {
  const [form, setForm] = useState({
    ownerName: '',
    phone: '',
    email: '',
    location: '',
    landType: 'Residential Plot',
    extent: '',
    expectedPrice: '',
    documents: {
      patta: true,
      saleDeed: true,
      ec: false,
      fmb: false,
      dtcpCmda: false,
    },
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleDocToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: !prev.documents[key] },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const docList = Object.entries(form.documents)
      .filter(([, val]) => val)
      .map(([k]) => k.toUpperCase())
      .join(', ')

    // Post to enquiry API to save automatically in CRM New Leads
    try {
      const payload = {
        name: form.ownerName.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || '',
        property: `Land Sale: ${form.location || form.landType}`,
        location: form.location,
        landType: form.landType,
        extent: form.extent,
        expectedPrice: form.expectedPrice,
        source: 'Website - Sell Land',
        stage: 'new',
        notes: [
          `Location: ${form.location}`,
          `Category: ${form.landType}`,
          `Extent/Size: ${form.extent}`,
          `Expected Price: ${form.expectedPrice}`,
          `Available Docs: ${docList || 'None specified'}`,
          form.notes ? `Owner Notes: ${form.notes}` : null,
        ].filter(Boolean).join(' | '),
      }

      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn('Sell Land enquiry POST failed:', err)
      })
    } catch (err) {
      console.warn('Sell Land enquiry error:', err)
    }

    const text =
      `*SELL LAND ENQUIRY — Crystal Estates*\n` +
      `Owner: ${form.ownerName}\n` +
      `Phone: ${form.phone}\n` +
      `Location: ${form.location}\n` +
      `Type: ${form.landType}\n` +
      `Extent/Size: ${form.extent}\n` +
      `Expected Price: ${form.expectedPrice}\n` +
      `Available Docs: ${docList || 'None specified'}\n` +
      `Notes: ${form.notes || 'Please connect for land valuation.'}`

    window.open(
      `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    )

    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div
      style={{
        maxWidth: '780px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid rgba(227, 221, 209, 0.9)',
        padding: 'clamp(28px, 4vw, 44px)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <Field label="Owner Full Name *">
            <input
              required
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              placeholder="e.g. S. Ramanathan"
            />
          </Field>

          <Field label="Contact Phone Number *">
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 98400 12345"
            />
          </Field>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <Field label="Land Location / Village / Taluk *">
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Somamangalam, Kundrathur Taluk"
            />
          </Field>

          <Field label="Land Category">
            <select
              value={form.landType}
              onChange={(e) => setForm({ ...form, landType: e.target.value })}
            >
              <option value="Residential Plot">Residential Plot</option>
              <option value="Agricultural Farmland">Agricultural / Farm Land</option>
              <option value="Bulk Acreage / Estate">Bulk Acreage / Estate Parcel</option>
              <option value="Commercial / Highway Land">Commercial / Highway Corridor</option>
            </select>
          </Field>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <Field label="Land Size / Extent (Sq.Ft / Cents / Acres) *">
            <input
              required
              value={form.extent}
              onChange={(e) => setForm({ ...form, extent: e.target.value })}
              placeholder="e.g. 2400 sq.ft OR 1.5 Acres"
            />
          </Field>

          <Field label="Expected Total Price (₹ Lakhs / Crores) *">
            <input
              required
              value={form.expectedPrice}
              onChange={(e) => setForm({ ...form, expectedPrice: e.target.value })}
              placeholder="e.g. ₹ 85 Lakhs negotiable"
            />
          </Field>
        </div>

        {/* Checkboxes: Available Documents */}
        <div style={{ margin: '16px 0 20px 0' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13.5px',
              fontWeight: '700',
              color: 'var(--green-900)',
              marginBottom: '10px',
            }}
          >
            Available Legal Documents (Select all that apply):
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
            }}
          >
            {[
              ['patta', 'Individual Patta in Owner Name'],
              ['saleDeed', 'Original Registered Sale Deed'],
              ['ec', '30-Year Encumbrance Cert.'],
              ['fmb', 'FMB Survey Sketch'],
              ['dtcpCmda', 'DTCP / CMDA Sanction Order'],
            ].map(([key, label]) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--line)',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.documents[key]}
                  onChange={() => handleDocToggle(key)}
                  style={{ accentColor: 'var(--green-900)' }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <Field label="Additional Land Notes / Survey Numbers / Boundaries">
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. Corner plot facing East, 30 ft road frontage, compound wall erected..."
          />
        </Field>

        {submitted ? (
          <div
            style={{
              background: 'var(--green-50)',
              border: '1px solid var(--green-200)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--green-900)',
              marginTop: '16px',
            }}
          >
            <CheckCircle2 size={20} color="var(--green-600)" />
            <span>
              Thank you! Details submitted. Our acquisitions team has also opened WhatsApp for instant coordination.
            </span>
          </div>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="md"
            style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
            disabled={submitting}
          >
            <WhatsAppIcon size={18} />
            <span>{submitting ? 'Submitting...' : 'Submit Land Details for Fast-Track Valuation'}</span>
          </Button>
        )}
      </form>
    </div>
  )
}
