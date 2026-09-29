'use client'

import { useState } from 'react'
import Link from 'next/link'

const features = [
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Plain-English Licensing',
    body: 'Film. TV. Podcast. Ad. YouTube. Pick your use, pay once, done. No annual subscription traps. No legal maze. One license per project, clear terms, instant delivery.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    title: 'Direct Artist Access',
    body: 'Message the creator. Request a custom edit, stems, an alternate mix, or a version built for your exact scene. No middleman. No 6-week turnaround. Real peer-to-peer collaboration.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Exclusivity Windows',
    body: 'Own the track for your project. Exclusivity licenses lock a song out of new deals for 3 or 6 months — so your festival film doesn\'t share its score with a car commercial.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: 'A Catalog Unlike Any Other',
    body: 'Three realms. Inferno\'s dark cinematic fire. Purgatorio\'s raw experimental transition. Paradiso\'s transcendent orchestral light. Music that sounds like something — not like everything else.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Artists Get Paid Fairly',
    body: '70% of every licensing fee goes directly to the artist. Because when creators are paid right, they keep creating — and your catalog keeps growing with original work.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant License Delivery',
    body: 'License agreement in your inbox within minutes. No waiting for a sales rep to call back. No contracts that require a lawyer. Download, sign, use. That\'s it.',
  },
]

const useCases = [
  { realm: 'inferno', label: 'Independent Film', desc: 'Dark scores, tension music, raw emotional underscoring for narrative and documentary.' },
  { realm: 'purgatorio', label: 'Podcast & Audio', desc: 'Atmospheric beds, transitional music, original themes for serialized audio storytelling.' },
  { realm: 'paradiso', label: 'Advertising & Brand', desc: 'Elevated, original compositions that set your brand apart from stock music libraries.' },
  { realm: 'inferno', label: 'Game Audio', desc: 'Combat themes, ambient soundscapes, and boss music that feels like it was built for the moment.' },
  { realm: 'paradiso', label: 'TV & Streaming', desc: 'Series title sequences, episodic underscoring, and sync placements for premium content.' },
  { realm: 'purgatorio', label: 'YouTube & Creator', desc: 'Original music without Content ID claims. Use it. Keep your revenue. No flagging, no strikes.' },
]

const realmColor = (realm: string) => {
  if (realm === 'inferno') return '#c0392b'
  if (realm === 'purgatorio') return '#888'
  return '#c9a84c'
}

const steps = [
  { num: '01', title: 'Browse the Catalog', desc: 'Filter by realm, mood, tempo, or instrumentation. Preview full tracks — no 30-second clips.' },
  { num: '02', title: 'Contact the Artist', desc: 'Found something close but not perfect? Message the creator directly. Custom edits are real here.' },
  { num: '03', title: 'Choose Your License', desc: 'Select the use that matches your project. Film, TV, podcast, ad, game. See the exact terms before you pay.' },
  { num: '04', title: 'Pay & Download', desc: 'License agreement delivered instantly. Files in your inbox. No waiting, no back-and-forth.' },
]

export default function SupervisorsPage() {
  const [activeUse, setActiveUse] = useState<string | null>(null)

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        .sup-cinzel { font-family: 'Cinzel', serif; }
        .sup-garamond { font-family: 'EB Garamond', serif; }

        .sup-feature-card {
          background: #080808;
          border: 1px solid #111;
          padding: 32px 28px;
          transition: border-color .3s, background .3s;
        }
        .sup-feature-card:hover {
          border-color: #222;
          background: #0c0c0c;
        }

        .sup-use-card {
          background: #080808;
          border: 1px solid #111;
          padding: 20px 22px;
          cursor: default;
          transition: all .2s;
        }

        .sup-step {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          padding: 28px 0;
          border-bottom: 1px solid #0d0d0d;
        }
        .sup-step:last-child { border-bottom: none; }

        .sup-divider {
          width: 48px; height: 1px;
          background: linear-gradient(to right, transparent, #c9a84c, transparent);
          margin: 0 auto;
        }

        .sup-cta-btn {
          font-family: 'Cinzel', serif;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 14px 32px;
          text-decoration: none;
          display: inline-block;
          transition: all .2s;
        }
        .sup-cta-primary {
          background: #c9a84c;
          color: #000;
          border: 1px solid #c9a84c;
          font-weight: 700;
        }
        .sup-cta-primary:hover { background: #d4b85c; border-color: #d4b85c; }
        .sup-cta-secondary {
          background: transparent;
          color: #555;
          border: 1px solid #1e1e1e;
        }
        .sup-cta-secondary:hover { border-color: #333; color: #888; }

        @media (max-width: 768px) {
          .sup-features-grid { grid-template-columns: 1fr !important; }
          .sup-use-grid { grid-template-columns: 1fr !important; }
          .sup-hero-pad { padding: 60px 20px 48px !important; }
        }
      `}</style>

      {/* Hero */}
      <section className="sup-hero-pad" style={{ padding: '100px 32px 72px', textAlign: 'center', borderBottom: '1px solid #0d0d0d', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, #c9a84c08 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="sup-cinzel" style={{ fontSize: '9px', letterSpacing: '6px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '16px' }}>
          For Music Supervisors & Post Production
        </div>
        <h1 className="sup-cinzel" style={{ fontSize: 'clamp(28px,5vw,58px)', color: '#fff', letterSpacing: '3px', marginBottom: '12px', fontWeight: 900, lineHeight: 1.1 }}>
          THE FUTURE OF<br />MUSIC LICENSING
        </h1>
        <div className="sup-divider" style={{ margin: '20px auto' }} />
        <p className="sup-garamond" style={{ fontSize: 'clamp(17px,2vw,21px)', color: '#444', maxWidth: '600px', margin: '0 auto 16px', lineHeight: 1.8, fontStyle: 'italic' }}>
          No subscriptions. No middlemen. No cookie-cutter catalogs.
          Peer-to-peer music licensing — direct from the artist who made it.
        </p>
        <p className="sup-garamond" style={{ fontSize: '15px', color: '#2a2a2a', maxWidth: '500px', margin: '0 auto 48px', lineHeight: 1.8 }}>
          MHC Streaming is built for the indie post-production world that is done letting the giants dictate the terms.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/browse" className="sup-cta-btn sup-cta-primary">Browse the Catalog</Link>
          <a href="mailto:licensing@mhcstreaming.com?subject=Music Supervisor Inquiry" className="sup-cta-btn sup-cta-secondary">Talk to Us</a>
        </div>
      </section>

      {/* The problem */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '72px 32px', textAlign: 'center', borderBottom: '1px solid #0d0d0d' }}>
        <div className="sup-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c0392b', textTransform: 'uppercase', marginBottom: '14px' }}>
          The Old Way is Over
        </div>
        <h2 className="sup-cinzel" style={{ fontSize: 'clamp(18px,3vw,30px)', color: '#fff', letterSpacing: '2px', marginBottom: '32px' }}>
          You Already Know the Problem
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2px', background: '#0d0d0d', marginBottom: '48px' }}>
          {[
            ['$500/year', 'and you still get hit with usage restrictions on the track you paid for'],
            ['Same 50 tracks', 'that every other production used last quarter — your work sounds like theirs'],
            ['No artist contact', 'you found the perfect song but can\'t ask for a custom 90-second cut'],
            ['Exclusivity impossible', 'your festival film score is also in a fast food commercial'],
          ].map(([stat, desc]) => (
            <div key={stat} style={{ background: '#070707', padding: '28px 22px' }}>
              <div className="sup-cinzel" style={{ fontSize: '13px', color: '#c0392b', letterSpacing: '2px', marginBottom: '10px' }}>{stat}</div>
              <div style={{ fontSize: '13px', color: '#333', lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
        <p className="sup-garamond" style={{ fontSize: '18px', color: '#555', fontStyle: 'italic', lineHeight: 1.9 }}>
          The major licensing platforms were built for their investors, not for you. Not for the artists either. MHC was built for both — because when creators are treated right, the catalog you get access to is incomparably better.
        </p>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 32px', borderBottom: '1px solid #0d0d0d' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div className="sup-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px' }}>
            What Changes Here
          </div>
          <h2 className="sup-cinzel" style={{ fontSize: 'clamp(18px,3vw,28px)', color: '#fff', letterSpacing: '2px' }}>
            Built Different. By Design.
          </h2>
        </div>
        <div className="sup-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', background: '#111' }}>
          {features.map((f) => (
            <div key={f.title} className="sup-feature-card">
              <div style={{ color: '#c9a84c', marginBottom: '16px' }}>{f.icon}</div>
              <div className="sup-cinzel" style={{ fontSize: '11px', letterSpacing: '2px', color: '#e8e0d0', textTransform: 'uppercase', marginBottom: '12px' }}>
                {f.title}
              </div>
              <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.8 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 32px', borderBottom: '1px solid #0d0d0d' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="sup-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px' }}>
            Who This Is For
          </div>
          <h2 className="sup-cinzel" style={{ fontSize: 'clamp(18px,3vw,28px)', color: '#fff', letterSpacing: '2px' }}>
            Every Format. Every Scale.
          </h2>
        </div>
        <div className="sup-use-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', background: '#111' }}>
          {useCases.map((u) => (
            <div key={u.label} className="sup-use-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: realmColor(u.realm), flexShrink: 0 }} />
                <div className="sup-cinzel" style={{ fontSize: '10px', letterSpacing: '2px', color: '#e8e0d0', textTransform: 'uppercase' }}>
                  {u.label}
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.7 }}>{u.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: '780px', margin: '0 auto', padding: '72px 32px', borderBottom: '1px solid #0d0d0d' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="sup-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px' }}>
            The Process
          </div>
          <h2 className="sup-cinzel" style={{ fontSize: 'clamp(18px,3vw,28px)', color: '#fff', letterSpacing: '2px' }}>
            Four Steps. No Gatekeepers.
          </h2>
        </div>
        <div>
          {steps.map((s) => (
            <div key={s.num} className="sup-step">
              <div className="sup-cinzel" style={{ fontSize: '22px', color: '#1a1a1a', fontWeight: 700, minWidth: '44px', lineHeight: 1 }}>
                {s.num}
              </div>
              <div>
                <div className="sup-cinzel" style={{ fontSize: '11px', letterSpacing: '2px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '14px', color: '#444', lineHeight: 1.8 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto strip */}
      <section style={{ background: '#070700', borderTop: '1px solid #1a1500', borderBottom: '1px solid #1a1500', padding: '56px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="sup-cinzel" style={{ fontSize: '9px', letterSpacing: '6px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '20px' }}>
            Peer to Peer
          </div>
          <p className="sup-garamond" style={{ fontSize: 'clamp(20px,3vw,28px)', color: '#e8e0d0', lineHeight: 1.7, fontStyle: 'italic' }}>
            &ldquo;The artist who makes the music and the supervisor who places it — they should be able to find each other, talk to each other, and do business with each other. We are the infrastructure. We are not the deal.&rdquo;
          </p>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, #c9a84c, transparent)', margin: '28px auto 0' }} />
          <div className="sup-cinzel" style={{ fontSize: '9px', letterSpacing: '3px', color: '#333', textTransform: 'uppercase', marginTop: '16px' }}>
            MHC Streaming — The Charter, Article VI
          </div>
        </div>
      </section>

      {/* Enterprise / bulk inquiry */}
      <section style={{ maxWidth: '780px', margin: '0 auto', padding: '72px 32px', borderBottom: '1px solid #0d0d0d' }}>
        <div style={{ background: '#080800', border: '1px solid #1a1500', padding: '40px 36px' }}>
          <div className="sup-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px' }}>
            Production Houses & Agencies
          </div>
          <h3 className="sup-cinzel" style={{ fontSize: '18px', color: '#fff', letterSpacing: '2px', marginBottom: '16px' }}>
            Need a Custom Deal?
          </h3>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.9, marginBottom: '28px' }}>
            If your studio licenses music regularly, we can build a custom agreement — blanket licensing terms, dedicated catalog access, volume pricing, and direct relationships with artists whose work fits your production style. No subscription that locks you into music you don't use. Just a real business arrangement between real people.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="mailto:licensing@mhcstreaming.com?subject=Production House Licensing Inquiry"
              className="sup-cta-btn sup-cta-primary"
            >
              Start the Conversation
            </a>
            <Link href="/licensing" className="sup-cta-btn sup-cta-secondary">
              View Standard Tiers
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 32px', textAlign: 'center' }}>
        <div className="sup-divider" style={{ marginBottom: '40px' }} />
        <div className="sup-cinzel" style={{ fontSize: '9px', letterSpacing: '6px', color: '#2a2a2a', textTransform: 'uppercase', marginBottom: '16px' }}>
          Ready?
        </div>
        <h2 className="sup-cinzel" style={{ fontSize: 'clamp(22px,4vw,40px)', color: '#fff', letterSpacing: '3px', marginBottom: '12px' }}>
          The Catalog is Open
        </h2>
        <p className="sup-garamond" style={{ fontSize: '17px', color: '#333', marginBottom: '40px', fontStyle: 'italic' }}>
          Browse. Discover. License. Talk to the artist.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/browse" className="sup-cta-btn sup-cta-primary">Enter the Catalog</Link>
          <Link href="/charter" className="sup-cta-btn sup-cta-secondary">Read the Charter</Link>
        </div>
      </section>
    </main>
  )
}
