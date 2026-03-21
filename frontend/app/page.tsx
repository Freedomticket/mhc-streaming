'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import LicensingPricing from '../components/LicensingPricing'

type Realm = 'INFERNO' | 'PURGATORIO' | 'PARADISO'

export default function HomePage() {
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(null)
  const [showQuote, setShowQuote] = useState(true)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const quoteTimer = setTimeout(() => setShowQuote(false), 10000)
    const videoTimer = setTimeout(() => setShowVideo(true), 2000)
    return () => {
      clearTimeout(quoteTimer)
      clearTimeout(videoTimer)
    }
  }, [])

  const artists = [
    {
      name: 'Luna Eclipse',
      title: 'Composer & Producer',
      realm: 'Inferno',
      followers: '15.2K',
      streams: '2.4M',
      realmType: 'inferno' as const,
    },
    {
      name: 'Rising Soul',
      title: 'Singer-Songwriter',
      realm: 'Purgatorio',
      followers: '9.8K',
      streams: '1.1M',
      realmType: 'purgatorio' as const,
    },
    {
      name: 'Celestial Voices',
      title: 'Vocal Ensemble',
      realm: 'Paradiso',
      followers: '12.5K',
      streams: '3.2M',
      realmType: 'paradiso' as const,
    },
    {
      name: 'The Void',
      title: 'Electronic Artist',
      realm: 'Inferno',
      followers: '8.3K',
      streams: '850K',
      realmType: 'inferno' as const,
    },
    {
      name: 'Green Spirit',
      title: 'Folk Musician',
      realm: 'Purgatorio',
      followers: '6.7K',
      streams: '650K',
      realmType: 'purgatorio' as const,
    },
    {
      name: 'Color Masters',
      title: 'DJ & Producer',
      realm: 'Paradiso',
      followers: '11.2K',
      streams: '2.1M',
      realmType: 'paradiso' as const,
    },
  ]

  const realmConfig = {
    inferno: {
      accent: '#c0392b',
      accentHover: '#e74c3c',
      badge: 'mhc-badge-inferno',
      follow: 'mhc-btn-follow-inferno',
      border: 'mhc-card-inferno',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#1a0500" stroke="#c0392b" strokeWidth="1"/>
          <path d="M24 8 L20 16 L13 12 L16 20 L8 22 L16 26 L14 34 L24 30 L34 34 L32 26 L40 22 L32 20 L35 12 L28 16 Z" fill="#c0392b" opacity="0.9"/>
          <circle cx="24" cy="22" r="5" fill="#1a0500" stroke="#e74c3c" strokeWidth="1"/>
          <circle cx="24" cy="22" r="2" fill="#e74c3c"/>
        </svg>
      ),
      voidIcon: (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#1a0500" stroke="#c0392b" strokeWidth="1"/>
          <path d="M24 10 Q30 12 34 18 Q38 24 34 30 Q30 36 24 36 Q18 36 14 30 Q10 24 14 18 Q18 12 24 10Z" fill="none" stroke="#c0392b" strokeWidth="1.2"/>
          <ellipse cx="19" cy="21" rx="3" ry="4" fill="#c0392b" opacity="0.8"/>
          <ellipse cx="29" cy="21" rx="3" ry="4" fill="#c0392b" opacity="0.8"/>
          <path d="M18 29 Q24 33 30 29" fill="none" stroke="#c0392b" strokeWidth="1.2"/>
          <path d="M12 16 L16 20" stroke="#e74c3c" strokeWidth="1" opacity="0.7"/>
          <path d="M36 16 L32 20" stroke="#e74c3c" strokeWidth="1" opacity="0.7"/>
        </svg>
      ),
    },
    purgatorio: {
      accent: '#888',
      accentHover: '#aaa',
      badge: 'mhc-badge-purgatorio',
      follow: 'mhc-btn-follow-purgatorio',
      border: 'mhc-card-purgatorio',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#0d0d0d" stroke="#555" strokeWidth="1"/>
          <line x1="24" y1="38" x2="24" y2="10" stroke="#777" strokeWidth="1.5"/>
          <line x1="18" y1="34" x2="30" y2="34" stroke="#666" strokeWidth="1.2"/>
          <line x1="18" y1="28" x2="30" y2="28" stroke="#666" strokeWidth="1.2"/>
          <line x1="18" y1="22" x2="30" y2="22" stroke="#777" strokeWidth="1.2"/>
          <line x1="20" y1="16" x2="28" y2="16" stroke="#888" strokeWidth="1.2"/>
          <circle cx="24" cy="10" r="3.5" fill="none" stroke="#aaa" strokeWidth="1.2"/>
          <path d="M21 8.5 Q24 6 27 8.5" fill="none" stroke="#aaa" strokeWidth="1"/>
        </svg>
      ),
      spiritIcon: (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#0d0d0d" stroke="#555" strokeWidth="1"/>
          <path d="M24 36 Q28 30 26 24 Q24 18 28 14 Q32 10 30 7" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M24 36 Q20 30 22 24 Q24 18 20 14 Q16 10 18 7" fill="none" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
          <ellipse cx="24" cy="38" rx="5" ry="2" fill="#2a2a2a" stroke="#444" strokeWidth="0.8"/>
        </svg>
      ),
    },
    paradiso: {
      accent: '#c9a84c',
      accentHover: '#d4b85c',
      badge: 'mhc-badge-paradiso',
      follow: 'mhc-btn-follow-paradiso',
      border: 'mhc-card-paradiso',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#0d0a00" stroke="#9b7d2e" strokeWidth="1"/>
          <circle cx="24" cy="24" r="10" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.5"/>
          <circle cx="24" cy="24" r="6" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.7"/>
          <circle cx="24" cy="24" r="3" fill="#c9a84c"/>
          <line x1="24" y1="8" x2="24" y2="14" stroke="#c9a84c" strokeWidth="1.2" opacity="0.8"/>
          <line x1="24" y1="34" x2="24" y2="40" stroke="#c9a84c" strokeWidth="1.2" opacity="0.8"/>
          <line x1="8" y1="24" x2="14" y2="24" stroke="#c9a84c" strokeWidth="1.2" opacity="0.8"/>
          <line x1="34" y1="24" x2="40" y2="24" stroke="#c9a84c" strokeWidth="1.2" opacity="0.8"/>
          <line x1="13" y1="13" x2="17" y2="17" stroke="#c9a84c" strokeWidth="1" opacity="0.5"/>
          <line x1="31" y1="31" x2="35" y2="35" stroke="#c9a84c" strokeWidth="1" opacity="0.5"/>
          <line x1="35" y1="13" x2="31" y2="17" stroke="#c9a84c" strokeWidth="1" opacity="0.5"/>
          <line x1="17" y1="31" x2="13" y2="35" stroke="#c9a84c" strokeWidth="1" opacity="0.5"/>
        </svg>
      ),
      masterIcon: (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#0d0a00" stroke="#9b7d2e" strokeWidth="1"/>
          <polygon points="24,10 36,30 12,30" fill="none" stroke="#c9a84c" strokeWidth="1.2"/>
          <polygon points="24,38 36,18 12,18" fill="none" stroke="#c9a84c" strokeWidth="1.2" opacity="0.6"/>
          <circle cx="24" cy="24" r="4" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.8"/>
          <circle cx="24" cy="24" r="1.5" fill="#c9a84c"/>
        </svg>
      ),
    },
  }

  const getIcon = (artist: typeof artists[0], index: number) => {
    if (artist.realmType === 'inferno') {
      return index === 0 ? realmConfig.inferno.icon : realmConfig.inferno.voidIcon
    }
    if (artist.realmType === 'purgatorio') {
      return index === 1 ? realmConfig.purgatorio.icon : realmConfig.purgatorio.spiritIcon
    }
    return index === 2 ? realmConfig.paradiso.icon : realmConfig.paradiso.masterIcon
  }

  return (
    <main className="min-h-screen" style={{ background: '#000', color: '#e8e0d0' }}>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');

        .mhc-font-display { font-family: 'Cinzel', 'Georgia', serif; }

        @keyframes mhc-flicker {
          0%,100%{opacity:1} 45%{opacity:.88} 55%{opacity:.95}
        }
        @keyframes mhc-pulse-gold {
          0%,100%{opacity:.5} 50%{opacity:1}
        }
        @keyframes mhc-fadeInOut {
          0%,100%{opacity:.08} 50%{opacity:.2}
        }
        @keyframes mhc-cardReveal {
          0%{opacity:0; transform:translateY(16px)}
          100%{opacity:1; transform:translateY(0)}
        }

        .mhc-flicker { animation: mhc-flicker 5s ease-in-out infinite; }

        /* Realm cards */
        .mhc-realm-card {
          position:relative; overflow:hidden; cursor:pointer;
          transition:transform .4s ease, box-shadow .4s ease;
        }
        .mhc-realm-card:hover { transform:scale(1.03); }
        .mhc-realm-card-selected {
          transform:scale(1.05);
          box-shadow: 0 0 40px rgba(201,168,76,0.3);
        }
        .mhc-realm-overlay {
          position:absolute; inset:0;
          background:linear-gradient(to top, #000 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
        }
        .mhc-realm-label {
          font-family:'Cinzel',serif;
          font-size:9px; letter-spacing:4px;
          text-transform:uppercase;
          display:inline-block;
          padding:3px 10px;
          border:1px solid currentColor;
          margin-right:6px;
        }

        /* Feature pillars */
        .mhc-pillar {
          border:1px solid #1a1a1a;
          background:#060606;
          padding:28px 24px;
          text-align:center;
          transition:border-color .3s;
        }
        .mhc-pillar:hover { border-color:#2a2a2a; }
        .mhc-pillar-eyebrow {
          font-size:9px; letter-spacing:4px; text-transform:uppercase;
          color:#c9a84c; margin-bottom:10px;
          font-family:'Cinzel',serif;
        }
        .mhc-pillar-title {
          font-family:'Cinzel',serif;
          font-size:14px; color:#e8e0d0;
          margin-bottom:10px; letter-spacing:1px;
        }
        .mhc-pillar-text { font-size:12px; color:#444; line-height:1.8; }

        /* Artist cards */
        .mhc-artist-card {
          background:#0a0a0a;
          padding:22px 20px 20px;
          border-bottom:2px solid transparent;
          transition:background .3s, border-color .3s;
          cursor:pointer;
        }
        .mhc-card-inferno { border-bottom-color:#c0392b44; }
        .mhc-card-inferno:hover { background:#110800; border-bottom-color:#c0392b; }
        .mhc-card-purgatorio { border-bottom-color:#5554; }
        .mhc-card-purgatorio:hover { background:#0c0c10; border-bottom-color:#888; }
        .mhc-card-paradiso { border-bottom-color:#c9a84c44; }
        .mhc-card-paradiso:hover { background:#0c0a00; border-bottom-color:#c9a84c; }

        .mhc-artist-name {
          font-family:'Cinzel',serif;
          font-size:14px; font-weight:700;
          color:#e8e0d0; letter-spacing:1px;
          margin-bottom:3px;
        }
        .mhc-artist-role { font-size:11px; color:#555; margin-bottom:8px; letter-spacing:.5px; }

        .mhc-badge {
          display:inline-block; font-size:9px;
          letter-spacing:2px; text-transform:uppercase;
          padding:2px 8px; border:1px solid currentColor;
        }
        .mhc-badge-inferno { color:#c0392b; border-color:#c0392b44; }
        .mhc-badge-purgatorio { color:#888; border-color:#8884; }
        .mhc-badge-paradiso { color:#c9a84c; border-color:#c9a84c44; }

        .mhc-stat-val {
          font-size:16px; font-weight:700;
          color:#e8e0d0; display:block;
        }
        .mhc-stat-lbl { font-size:10px; color:#444; letter-spacing:1px; text-transform:uppercase; }

        .mhc-btn-follow {
          padding:9px; border:none;
          font-size:11px; letter-spacing:2px;
          text-transform:uppercase; cursor:pointer;
          font-weight:600; transition:all .2s;
          width:100%;
        }
        .mhc-btn-follow-inferno { background:#c0392b; color:#fff; }
        .mhc-btn-follow-inferno:hover { background:#e74c3c; }
        .mhc-btn-follow-purgatorio { background:#333; color:#ccc; }
        .mhc-btn-follow-purgatorio:hover { background:#555; }
        .mhc-btn-follow-paradiso { background:#c9a84c; color:#000; }
        .mhc-btn-follow-paradiso:hover { background:#d4b85c; }

        .mhc-btn-message {
          padding:9px; background:transparent;
          border:1px solid #1e1e1e; color:#444;
          font-size:11px; letter-spacing:2px;
          text-transform:uppercase; cursor:pointer;
          transition:all .2s; width:100%;
        }
        .mhc-btn-message:hover { border-color:#444; color:#888; }

        /* Subscription cards */
        .mhc-sub-card {
          background:#080808;
          border:1px solid #1a1a1a;
          padding:28px 22px;
          transition:all .3s;
        }
        .mhc-sub-card:hover { border-color:#2a2a2a; transform:translateY(-2px); }
        .mhc-sub-card-featured {
          border-color:#c9a84c44;
          background:#0a0900;
        }
        .mhc-sub-card-featured:hover { border-color:#c9a84c; }

        .mhc-sub-tier {
          font-family:'Cinzel',serif;
          font-size:12px; letter-spacing:3px;
          text-transform:uppercase; margin-bottom:12px;
        }
        .mhc-sub-price {
          font-size:32px; font-weight:700;
          color:#fff; margin-bottom:4px;
        }
        .mhc-sub-period { font-size:12px; color:#444; }
        .mhc-sub-feature {
          font-size:12px; color:#555;
          display:flex; align-items:flex-start;
          gap:8px; padding:5px 0;
          border-bottom:1px solid #0f0f0f;
        }
        .mhc-sub-check { color:#c9a84c; flex-shrink:0; margin-top:1px; }

        /* Divider */
        .mhc-divider {
          width:48px; height:1px;
          background:linear-gradient(to right,transparent,#c9a84c,transparent);
          margin:0 auto;
        }

        /* Hero btn */
        .mhc-hero-btn-primary {
          padding:12px 32px;
          background:#c9a84c; color:#000;
          font-size:11px; letter-spacing:3px;
          text-transform:uppercase; font-weight:700;
          border:none; cursor:pointer;
          transition:background .2s;
          text-decoration:none; display:inline-block;
          font-family:'Cinzel',serif;
        }
        .mhc-hero-btn-primary:hover { background:#d4b85c; }
        .mhc-hero-btn-secondary {
          padding:12px 32px;
          background:transparent; color:#e8e0d0;
          font-size:11px; letter-spacing:3px;
          text-transform:uppercase; font-weight:400;
          border:1px solid #2a2a2a; cursor:pointer;
          transition:all .2s;
          text-decoration:none; display:inline-block;
          font-family:'Cinzel',serif;
        }
        .mhc-hero-btn-secondary:hover { border-color:#555; color:#fff; }

        .mhc-section-eyebrow {
          font-family:'Cinzel',serif;
          font-size:9px; letter-spacing:5px;
          color:#c9a84c; text-transform:uppercase;
          text-align:center; margin-bottom:10px;
        }
        .mhc-section-title {
          font-family:'Cinzel',serif;
          font-size:clamp(18px,3vw,26px);
          color:#fff; text-align:center;
          margin-bottom:6px; letter-spacing:2px;
        }
        .mhc-section-sub {
          font-size:13px; color:#3a3a3a;
          text-align:center; margin-bottom:48px;
          letter-spacing:1px;
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col justify-center items-center text-center px-4 py-24"
        style={{
          minHeight: '600px',
          backgroundImage: `linear-gradient(135deg,rgba(0,0,0,.8) 0%,rgba(0,0,0,.85) 100%),url('/images/new-hero-img1.png')`,
          backgroundSize:'cover', backgroundPosition:'center 40%',
          borderBottom:'1px solid #111',
        }}
      >
        {showQuote && (
          <div
            className="mhc-font-display text-3xl md:text-4xl font-bold italic text-white mb-8 max-w-3xl transition-opacity duration-[2000ms]"
            style={{ letterSpacing:'1px', textShadow:'2px 2px 16px rgba(0,0,0,.9)', opacity: showQuote ? 1 : 0 }}
          >
            &quot;For God so loved the world...&quot; — John 3:16
          </div>
        )}

        <div
          className="relative w-full max-w-4xl mb-8 transition-opacity duration-[2000ms] flex items-center justify-center bg-black"
          style={{ height:'400px', opacity: showVideo ? 1 : 0 }}
        >
          <video
            className="w-full h-full object-contain object-center bg-black"
            style={{ border:'1px solid #1a1a1a' }}
            autoPlay muted loop playsInline
          >
            <source src="/images/hero.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="mhc-divider mb-8" />
        <h1
          className="mhc-font-display font-black mb-4"
          style={{ fontSize:'clamp(28px,5vw,56px)', color:'#fff', letterSpacing:'3px', lineHeight:1.1 }}
        >
          YOUR MUSIC.{' '}
          <span className="mhc-flicker" style={{ color:'#c9a84c' }}>YOUR PLATFORM.</span>{' '}
          YOUR FUTURE.
        </h1>
        <p className="mb-3 max-w-2xl" style={{ fontSize:'14px', color:'#555', letterSpacing:'1px', lineHeight:1.8 }}>
          The independent artist ecosystem where you own everything,<br/>earn everything, and never answer to gatekeepers
        </p>
        <p
          className="mhc-font-display mb-8"
          style={{ fontSize:'11px', color:'#c9a84c', letterSpacing:'3px', textTransform:'uppercase' }}
        >
          For Indie Artists — A Platform for Connectivity, not Just Streams
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="mhc-hero-btn-primary">Start Uploading Now</Link>
          <Link href="/browse" className="mhc-hero-btn-secondary">Discover More</Link>
        </div>
      </section>

      {/* ── BRAND STATEMENT ── */}
      <section style={{ padding:'80px 32px 40px', textAlign:'center', borderBottom:'1px solid #0f0f0f' }}>
        <h2
          className="mhc-font-display font-black mb-3"
          style={{ fontSize:'clamp(32px,5vw,60px)', letterSpacing:'4px' }}
        >
          <span style={{ color:'#fff' }}>MOST HIGH </span>
          <span style={{ color:'#c9a84c' }}>CREATION</span>
        </h2>
        <p style={{ fontSize:'13px', color:'#444', letterSpacing:'3px', textTransform:'uppercase' }}>
          Decentralized Streaming Platform
        </p>
        <div className="mhc-divider mt-6" />
        <p style={{ fontSize:'11px', color:'#2a2a2a', letterSpacing:'2px', marginTop:'12px' }}>
          Artist-first &nbsp;•&nbsp; Zero dependencies &nbsp;•&nbsp; Dante-inspired realms
        </p>
      </section>

      {/* ── PILLARS ── */}
      <section style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'#111' }}>
        <div className="mhc-pillar">
          <div className="mhc-pillar-eyebrow">Artist-First</div>
          <div className="mhc-pillar-title">Fair Royalties</div>
          <p className="mhc-pillar-text">Content ownership and revenue transparency — every stream, every cent.</p>
        </div>
        <div className="mhc-pillar">
          <div className="mhc-pillar-eyebrow">Decentralized</div>
          <div className="mhc-pillar-title">Zero Dependencies</div>
          <p className="mhc-pillar-text">No AWS, Firebase, or Azure. Self-hosted capable. You own the infrastructure.</p>
        </div>
        <div className="mhc-pillar">
          <div className="mhc-pillar-eyebrow">Real-Time</div>
          <div className="mhc-pillar-title">Live & Connected</div>
          <p className="mhc-pillar-text">Live streaming, instant notifications, WebSocket updates across every realm.</p>
        </div>
      </section>

      <div className="container mx-auto px-4">

        {/* ── CHOOSE YOUR REALM ── */}
        <section style={{ padding:'80px 0' }}>
          <div className="mhc-section-eyebrow">The Three Realms</div>
          <div className="mhc-section-title">Choose Your Realm</div>
          <div className="mhc-divider" style={{ marginBottom:'8px' }} />
          <div className="mhc-section-sub">Explore Dante&apos;s three realms and find your creative home</div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2px', background:'#111', maxWidth:'1100px', margin:'0 auto' }}>
            {[
              { name:'INFERNO', img:'/images/img1.png', desc:'Realm of passion and raw creation', tags:['Dark Mode','Fire FX'], realm:'INFERNO' as Realm },
              { name:'PURGATORIO', img:'/images/img10.png', desc:'Realm of transformation and growth', tags:['Gradient','Mist FX'], realm:'PURGATORIO' as Realm },
              { name:'PARADISO', img:'/images/img17.png', desc:'Realm of divine light and harmony', tags:['Light Mode','Ray FX'], realm:'PARADISO' as Realm },
            ].map((r) => (
              <Link
                key={r.name}
                href="/gallery"
                onClick={() => setSelectedRealm(r.realm)}
                className={`mhc-realm-card ${selectedRealm === r.realm ? 'mhc-realm-card-selected' : ''}`}
              >
                <div style={{ aspectRatio:'3/4', position:'relative' }}>
                  <Image
                    src={r.img}
                    alt={r.name}
                    fill
                    className="object-cover"
                    style={{ filter:'brightness(0.35)', transition:'filter .4s' }}
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                  <div className="mhc-realm-overlay" />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'24px 20px' }}>
                    <h3
                      className="mhc-font-display"
                      style={{ fontSize:'22px', color:'#fff', marginBottom:'6px', letterSpacing:'3px' }}
                    >
                      {r.name}
                    </h3>
                    <p style={{ fontSize:'11px', color:'#666', marginBottom:'12px', lineHeight:1.6 }}>{r.desc}</p>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      {r.tags.map(tag => (
                        <span key={tag} className="mhc-realm-label" style={{ color:'#c9a84c' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap', marginTop:'40px' }}>
            <Link href="/register" className="mhc-hero-btn-primary">Start Creating</Link>
            <Link href="/login" className="mhc-hero-btn-secondary">Sign In</Link>
            <Link href="/browse" style={{ fontSize:'11px', color:'#444', letterSpacing:'2px', textTransform:'uppercase', textDecoration:'none', padding:'12px 0', transition:'color .2s', fontFamily:'Cinzel,serif' }}
              onMouseOver={e=>(e.currentTarget.style.color='#888')}
              onMouseOut={e=>(e.currentTarget.style.color='#444')}
            >Browse Content</Link>
            <Link href="/discover" style={{ fontSize:'11px', color:'#c9a84c', letterSpacing:'2px', textTransform:'uppercase', textDecoration:'none', padding:'12px 0', transition:'color .2s', fontFamily:'Cinzel,serif' }}
              onMouseOver={e=>(e.currentTarget.style.color='#fff')}
              onMouseOut={e=>(e.currentTarget.style.color='#c9a84c')}
            >Discover Artists</Link>
          </div>
        </section>

        {/* ── FEATURED ARTISTS ── */}
        <section style={{ padding:'20px 0 80px', position:'relative' }}>
          <div
            style={{
              position:'absolute', inset:0, pointerEvents:'none',
              backgroundImage:"url('/images/img7.png')",
              backgroundSize:'cover', backgroundPosition:'center',
              opacity:.06, animation:'mhc-fadeInOut 8s ease-in-out infinite'
            }}
          />
          <div style={{ position:'relative', zIndex:1 }}>
            <div className="mhc-section-eyebrow">Discovery</div>
            <div className="mhc-section-title">Featured Artists</div>
            <div className="mhc-divider" style={{ marginBottom:'8px' }} />
            <div className="mhc-section-sub">Discover creators across the three realms</div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2px', background:'#111' }}>
              {artists.map((artist, index) => (
                <div key={artist.name} className={`mhc-artist-card mhc-card-${artist.realmType}`}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'14px', marginBottom:'16px' }}>
                    <div style={{ width:'48px', height:'48px', flexShrink:0 }}>
                      {getIcon(artist, index)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div className="mhc-artist-name">{artist.name}</div>
                      <div className="mhc-artist-role">{artist.title}</div>
                      <span className={`mhc-badge mhc-badge-${artist.realmType}`}>{artist.realm}</span>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:'20px', marginBottom:'16px', paddingTop:'14px', borderTop:'1px solid #111' }}>
                    <div>
                      <span className="mhc-stat-val">{artist.followers}</span>
                      <span className="mhc-stat-lbl">Followers</span>
                    </div>
                    <div>
                      <span className="mhc-stat-val">{artist.streams}</span>
                      <span className="mhc-stat-lbl">Streams</span>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                    <button className={`mhc-btn-follow mhc-btn-follow-${artist.realmType}`}>Follow</button>
                    <button className="mhc-btn-message">Message</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign:'center', marginTop:'32px' }}>
              <Link href="/browse" style={{ fontSize:'11px', color:'#c9a84c', letterSpacing:'3px', textTransform:'uppercase', textDecoration:'none', fontFamily:'Cinzel,serif' }}>
                Discover More Artists →
              </Link>
            </div>
          </div>
        </section>

        {/* ── SUBSCRIPTION TIERS ── */}
        <section style={{ padding:'20px 0 80px' }}>
          <div className="mhc-section-eyebrow">Choose Your Level</div>
          <div className="mhc-section-title">Subscription Tiers</div>
          <div className="mhc-divider" style={{ marginBottom:'48px' }} />

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'2px', background:'#111', maxWidth:'900px', margin:'0 auto' }}>
            {[
              { tier:'Free', color:'#444', price:'$0', period:'', features:['Basic access','SD quality','Limited uploads'], featured:false },
              { tier:'Inferno', color:'#c0392b', price:'$9.99', period:'/mo', features:['HD streaming','50 uploads/month','Ad-free'], featured:false },
              { tier:'Purgatorio', color:'#888', price:'$19.99', period:'/mo', features:['4K streaming','Unlimited uploads','Analytics'], featured:false },
              { tier:'Paradiso', color:'#c9a84c', price:'$49.99', period:'/mo', features:['8K streaming','Priority support','Full suite'], featured:true },
            ].map((s) => (
              <div key={s.tier} className={`mhc-sub-card${s.featured ? ' mhc-sub-card-featured' : ''}`}>
                <div className="mhc-sub-tier" style={{ color: s.color }}>{s.tier}</div>
                <div className="mhc-sub-price">{s.price}<span className="mhc-sub-period">{s.period}</span></div>
                <div style={{ marginTop:'16px', marginBottom:'20px' }}>
                  {s.features.map(f => (
                    <div key={f} className="mhc-sub-feature">
                      <span className="mhc-sub-check">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/register"
                  style={{
                    display:'block', textAlign:'center',
                    padding:'10px', fontSize:'10px',
                    letterSpacing:'2px', textTransform:'uppercase',
                    textDecoration:'none', fontFamily:'Cinzel,serif',
                    border:`1px solid ${s.color}44`,
                    color: s.featured ? '#000' : s.color,
                    background: s.featured ? s.color : 'transparent',
                    transition:'all .2s',
                  }}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── LICENSING ── */}
        <LicensingPricing />
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid #0f0f0f', padding:'48px 32px', marginTop:'80px' }}>
        <div style={{ textAlign:'center' }}>
          <div
            className="mhc-font-display"
            style={{ fontSize:'11px', color:'#c9a84c', letterSpacing:'4px', marginBottom:'12px' }}
          >
            MHC • STREAMING
          </div>
          <p style={{ fontSize:'11px', color:'#2a2a2a', letterSpacing:'1px' }}>
            &copy; 2025 Most High Creation Streaming. All rights reserved.
          </p>
          <p style={{ fontSize:'10px', color:'#1e1e1e', letterSpacing:'2px', marginTop:'6px' }}>
            Artist-first &nbsp;•&nbsp; Decentralized &nbsp;•&nbsp; Dante-inspired
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:'24px', marginTop:'20px' }}>
            {[
              { href:'/terms', label:'Terms of Service' },
              { href:'/privacy', label:'Privacy Policy' },
              { href:'mailto:support@mhclicensing.com', label:'Contact Support' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{ fontSize:'10px', color:'#3a3a3a', letterSpacing:'2px', textTransform:'uppercase', textDecoration:'none', fontFamily:'Cinzel,serif', transition:'color .2s' }}
                onMouseOver={e=>(e.currentTarget.style.color='#c9a84c')}
                onMouseOut={e=>(e.currentTarget.style.color='#3a3a3a')}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}
