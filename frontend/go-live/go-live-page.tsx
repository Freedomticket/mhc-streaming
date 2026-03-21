'use client'

import Link from 'next/link'

export default function GoLivePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .gl-cinzel { font-family: 'Cinzel', serif; }
        @keyframes gl-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .gl-dot { animation: gl-pulse 1.5s ease-in-out infinite; }
      `}</style>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="gl-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c0392b', display: 'inline-block' }} />
          <div className="gl-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c0392b', textTransform: 'uppercase' }}>
            Live Studio
          </div>
        </div>
        <h1 className="gl-cinzel" style={{ fontSize: 'clamp(24px,4vw,40px)', color: '#fff', letterSpacing: '3px', marginBottom: '8px' }}>
          GO LIVE
        </h1>
        <div style={{ width: '48px', height: '1px', background: 'linear-gradient(to right,transparent,#c0392b,transparent)', margin: '0 auto 20px' }} />
        <p style={{ fontSize: '13px', color: '#3a3a3a', marginBottom: '48px', lineHeight: 1.8 }}>
          Broadcast live to your fans across all three realms. Real-time streaming, live chat, and ticket sales are coming soon. Artists on Pro and Studio tiers will get early access.
        </p>

        <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '32px', marginBottom: '40px', textAlign: 'left' }}>
          <div className="gl-cinzel" style={{ fontSize: '10px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '20px' }}>
            What&apos;s Coming
          </div>
          {[
            'HD live streaming directly to your fans',
            'Real-time chat with realm-themed UI',
            'Pay-per-view ticketing system',
            'Replay recordings saved to your channel',
            'Multi-camera stream switching',
          ].map(item => (
            <div key={item} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #0f0f0f', fontSize: '13px', color: '#555' }}>
              <span style={{ color: '#c9a84c', flexShrink: 0 }}>✓</span>
              {item}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/settings/subscription" style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', padding: '12px 28px', background: '#c9a84c', color: '#000', textDecoration: 'none', fontWeight: 700 }}>
            Upgrade to Pro
          </Link>
          <Link href="/dashboard" style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', padding: '12px 28px', border: '1px solid #1e1e1e', color: '#444', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
