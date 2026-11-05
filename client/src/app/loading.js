import { Container } from '../components/ui'

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid rgba(15, 61, 46, 0.15)',
            borderTopColor: 'var(--gold)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--green-900)' }}>
          Crystal Estates
        </div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>
          ASSETS CREATOR
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>
          Loading verified land data…
        </p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

