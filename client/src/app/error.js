'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Container, Button } from '../components/ui'

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log unexpected client error to monitoring service if needed
    console.error('Crystal Estates Application Error:', error)
  }, [error])

  return (
    <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', background: 'var(--bg)' }}>
      <Container style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid rgba(227, 221, 209, 0.9)',
            padding: '40px 28px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Image
              src="/logo.png"
              alt="Crystal Estates"
              width={140}
              height={48}
              style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '8.5px',
                fontWeight: 700,
                color: 'var(--gold)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginTop: '4px',
              }}
            >
              ASSETS CREATOR
            </span>
          </div>

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(192, 57, 43, 0.1)',
              color: '#c0392b',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--gold)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            APPLICATION NOTICE
          </span>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--green-900)', margin: '8px 0 12px' }}>
            Temporary Technical Difficulty
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.6', marginBottom: '28px' }}>
            We encountered an unexpected issue while loading this page. Please try refreshing or return to the homepage to continue exploring our land assets.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Button onClick={() => reset()} variant="primary">
              <RotateCcw size={16} /> Try Again
            </Button>
            <Button href="/" variant="outline">
              <Home size={16} /> Return to Home
            </Button>
          </div>
        </div>
      </Container>
    </main>
  )
}

