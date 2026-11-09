'use client'

import React, { useState } from 'react'
import { Plus, Minus, HelpCircle, Phone } from 'lucide-react'
import { Container, Section, Button } from '../ui'
import { faqCategories, allFaqs } from '../../data/faqsData'

function FaqAccordionItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`faq-card ${isOpen ? 'faq-card--open' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="faq-card__trigger"
      >
        <span className="faq-card__question">{faq.q}</span>
        <span className="faq-card__icon">
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      {isOpen && (
        <div className="faq-card__answer">
          <p>{faq.a}</p>
        </div>
      )}
    </div>
  )
}

export default function FaqClientAccordion() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [openIndex, setOpenIndex] = useState(0)

  const filteredFaqs =
    activeCategory === 'All'
      ? allFaqs
      : allFaqs.filter((f) => f.category === activeCategory)

  return (
    <Section>
      <Container>
        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '36px',
          }}
        >
          {faqCategories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat)
                  setOpenIndex(0)
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  border: isActive ? '1.5px solid var(--gold)' : '1px solid var(--line)',
                  background: isActive ? 'var(--green-900)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--ink)',
                  fontSize: '13.5px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(15, 61, 46, 0.2)' : 'none',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* FAQ Accordion List */}
        <div
          style={{
            maxWidth: '880px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {filteredFaqs.map((faq, idx) => (
            <FaqAccordionItem
              key={idx}
              faq={faq}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
            />
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div
          style={{
            maxWidth: '680px',
            margin: '48px auto 0',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px 24px',
            border: '1px solid rgba(227, 221, 209, 0.9)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <HelpCircle size={32} color="var(--gold)" style={{ margin: '0 auto 10px' }} />
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              color: 'var(--green-900)',
              marginBottom: '8px',
            }}
          >
            Have a Specific Question About a Land Parcel?
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--muted)',
              marginBottom: '18px',
              lineHeight: '1.6',
            }}
          >
            Our legal desk and property consultants are available to explain survey records, parent deeds, or loan eligibility directly.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Button href="/contact" variant="primary" size="sm">
              Contact Legal Desk
            </Button>
            <Button href="tel:+919444000000" variant="outline" size="sm">
              <Phone size={14} /> Call +91 94440 00000
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}

