import Link from 'next/link'
import Image from 'next/image'
import { MapPinOff, ArrowLeft, Home, Search, Phone } from 'lucide-react'
import { Container, Button } from '../components/ui'

export default function NotFound() {
  return (
    <main style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', background: 'var(--bg)' }}>
      <Container style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid rgba(227, 221, 209, 0.9)',
            padding: 'clamp(36px, 6vw, 64px) clamp(24px, 4vw, 44px)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Link href="/" aria-label="Crystal Estates Home">
              <Image
                src="/logo.png"
                alt="Crystal Estates"
                width={160}
                height={54}
                style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '9px',
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
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--green-50)',
              color: 'var(--green-900)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 20px',
              border: '2px solid var(--gold-border)',
            }}
          >
            <MapPinOff size={32} color="var(--gold)" />
          </div>

          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gold)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            ERROR 404 • UNMAPPED BOUNDARY
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4.5vw, 42px)',
              color: 'var(--green-900)',
              margin: '10px 0 16px',
            }}
          >
            Land Parcel Not Found
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--ink-2)', lineHeight: '1.65', marginBottom: '32px' }}>
            The page or property listing you are seeking may have been updated, sold, or relocated. Explore our verified Chennai land portfolio or return to our homepage.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Button href="/" variant="primary">
              <Home size={16} /> Return to Home
            </Button>
            <Button href="/projects" variant="outline">
              <Search size={16} /> Browse Projects
            </Button>
            <Button href="/contact" variant="outline" className="btn--outline-gold">
              <Phone size={16} /> Contact Legal Desk
            </Button>
          </div>
        </div>
      </Container>
    </main>
  )
}

