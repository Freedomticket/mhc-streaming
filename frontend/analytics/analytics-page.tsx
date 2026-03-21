'use client'

import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .an-cinzel { font-family: 'Cinzel', serif; }
      `}</style>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <div className="an-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px' }}>
          Creator Tools
        </div>
        <h1 className="an-cinzel" style={{ fontSize: 'clamp(24px,4vw,40px)', color: '#fff', letterSpacing: '3px', marginBottom: '8px' }}>
          ANALYTICS
        </h1>
        <div style={{ width: '48px', height: '1px', background: 'linear-gradient(to right,transparent,#c9a84c,transparent)', margin: '0 auto 20px' }} />
        <p style={{ fontSize: '13px', color: '#3a3a3a', marginBottom: '48px', lineHeight: 1.8 }}>
          Detailed stream counts, listener demographics, and revenue insights are coming soon. Upload content now and your analytics will be waiting when this launches.
        </p>

        {/* Placeholder stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', background: '#111', marginBottom: '48px' }}>
          {[
            { label: 'Total Streams', value: '—' },
            { label: 'Unique Listeners', value: '—' },
            { label: 'Revenue', value: '—' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#0a0a0a', padding: '32px 20px' }}>
              <div className="an-cinzel" style={{ fontSize: '28px', color: '#2a2a2a', marginBottom: '8px' }}>{stat.value}</div>
              <div className="an-cinzel" style={{ fontSize: '9px', letterSpacing: '3px', color: '#333', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', padding: '12px 28px', background: '#c9a84c', color: '#000', textDecoration: 'none', fontWeight: 700 }}>
            Back to Dashboard
          </Link>
          <Link href="/upload" style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', padding: '12px 28px', border: '1px solid #1e1e1e', color: '#444', textDecoration: 'none' }}>
            Upload Content
          </Link>
        </div>
      </div>
    </main>
  )
}
