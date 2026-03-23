'use client'

import Link from 'next/link'
import { useState } from 'react'

const upcomingStreams = [
  { id: 1, artist: 'Luna Eclipse', title: 'Dark Ambient Session', realm: 'inferno', date: 'Coming Soon', subscribers: '2.4K notify' },
  { id: 2, artist: 'Rising Soul', title: 'Acoustic Live Set', realm: 'purgatorio', date: 'Coming Soon', subscribers: '1.1K notify' },
  { id: 3, artist: 'Celestial Voices', title: 'Sacred Harmonies', realm: 'paradiso', date: 'Coming Soon', subscribers: '3.2K notify' },
]

export default function LivePage() {
  const [notified, setNotified] = useState<number[]>([])
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleNotify = (id: number) => {
    setNotified(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id])
  }

  const realmStyle = (realm: string) => {
    if (realm === 'inferno') return { color: '#c0392b', borderColor: '#c0392b44' }
    if (realm === 'purgatorio') return { color: '#888', borderColor: '#8884' }
    return { color: '#c9a84c', borderColor: '#c9a84c44' }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .live-cinzel { font-family: 'Cinzel', serif; }
        @keyframes live-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .live-dot { animation: live-pulse 1.5s ease-in-out infinite; }
        .stream-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 24px; transition: border-color .3s; }
        .stream-card:hover { border-color: #2a2a2a; }
        .notify-btn { font-family: 'Cinzel',serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 8px 18px; background: transparent; border: 1px solid #1e1e1e; color: #444; cursor: pointer; transition: all .2s; }
        .notify-btn:hover { border-color: #c9a84c; color: #c9a84c; }
        .notify-btn.active { border-color: #c9a84c; color: #c9a84c; background: #c9a84c11; }
        .live-input { width: 100%; padding: 12px 16px; background: #080808; border: 1px solid #1a1a1a; color: #e8e0d0; font-size: 13px; outline: none; }
        .live-input:focus { border-color: #c9a84c44; }
        .live-submit { font-family: 'Cinzel',serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 24px; background: #c9a84c; color: #000; border: none; cursor: pointer; font-weight: 700; transition: background .2s; }
        .live-submit:hover { background: #d4b85c; }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '80px 32px', textAlign: 'center', borderBottom: '1px solid #0f0f0f', position: 'relative' }}>
        <div className="live-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c0392b', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c0392b', display: 'inline-block' }} />
          Live Streaming
        </div>
        <h1 className="live-cinzel" style={{ fontSize: 'clamp(28px,5vw,48px)', color: '#fff', letterSpacing: '3px', marginBottom: '8px' }}>
          COMING SOON
        </h1>
        <div style={{ width: '48px', height: '1px', background: 'linear-gradient(to right,transparent,#c0392b,transparent)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '13px', color: '#3a3a3a', letterSpacing: '1px', maxWidth: '480px', margin: '0 auto 32px', lineHeight: 1.8 }}>
          Live concerts, acoustic sessions, and exclusive performances from artists across all three realms. Be the first to know when we launch.
        </p>
        <Link href="/browse" style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', padding: '12px 28px', border: '1px solid #1e1e1e', color: '#444', textDecoration: 'none', transition: 'all .2s' }}>
          Browse Content
        </Link>
      </section>

      {/* Notify form */}
      <section style={{ padding: '64px 32px', borderBottom: '1px solid #0f0f0f', maxWidth: '560px', margin: '0 auto' }}>
        <div className="live-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>
          Get Notified
        </div>
        <h2 className="live-cinzel" style={{ fontSize: '20px', color: '#fff', textAlign: 'center', marginBottom: '32px', letterSpacing: '2px' }}>
          Be First in the Stream
        </h2>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px', border: '1px solid #c9a84c44', background: '#0a0900' }}>
            <div className="live-cinzel" style={{ fontSize: '11px', letterSpacing: '2px', color: '#c9a84c', textTransform: 'uppercase' }}>
              You&apos;re on the list
            </div>
            <p style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>We&apos;ll notify you when live streaming launches.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0' }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="live-input"
              style={{ flex: 1 }}
            />
            <button className="live-submit" onClick={() => email && setSubmitted(true)}>
              Notify Me
            </button>
          </div>
        )}
      </section>

      {/* Upcoming streams */}
      <section style={{ padding: '64px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <div className="live-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>
          Upcoming
        </div>
        <h2 className="live-cinzel" style={{ fontSize: '20px', color: '#fff', textAlign: 'center', marginBottom: '40px', letterSpacing: '2px' }}>
          Artist Sessions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#111' }}>
          {upcomingStreams.map(stream => (
            <div key={stream.id} className="stream-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <h3 className="live-cinzel" style={{ fontSize: '14px', color: '#e8e0d0', letterSpacing: '1px' }}>{stream.title}</h3>
                    <span className="live-cinzel" style={{ fontSize: '8px', letterSpacing: '2px', padding: '2px 8px', border: `1px solid ${realmStyle(stream.realm).borderColor}`, color: realmStyle(stream.realm).color }}>
                      {stream.realm}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#555' }}>by {stream.artist} · {stream.date}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#333' }}>{stream.subscribers}</span>
                  <button
                    className={`notify-btn ${notified.includes(stream.id) ? 'active' : ''}`}
                    onClick={() => handleNotify(stream.id)}
                  >
                    {notified.includes(stream.id) ? '✓ Notified' : 'Notify Me'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What to expect */}
      <section style={{ padding: '32px 32px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', background: '#111' }}>
          {[
            { eyebrow: 'Inferno Sessions', title: 'Raw & Live', desc: 'Unfiltered performances from the darkest corners of independent music.' },
            { eyebrow: 'Purgatorio Stage', title: 'Rising Acts', desc: 'Watch artists ascend in real time. New voices, unpolished and honest.' },
            { eyebrow: 'Paradiso Hall', title: 'The Divine', desc: 'Elevated performances from verified artists at the peak of their craft.' },
          ].map(card => (
            <div key={card.title} style={{ background: '#0a0a0a', padding: '28px 22px' }}>
              <div className="live-cinzel" style={{ fontSize: '9px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '10px' }}>{card.eyebrow}</div>
              <div className="live-cinzel" style={{ fontSize: '14px', color: '#fff', marginBottom: '10px', letterSpacing: '1px' }}>{card.title}</div>
              <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.8 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
