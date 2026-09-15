'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const tracks = [
  { title: 'Pseudo Prophet', album: 'Pseudo Prophet', duration: '4:12', year: '2026' },
  { title: 'Spirit of Lethargy', album: 'Pseudo Prophet', duration: '3:58', year: '2026' },
  { title: 'Golgotha', album: 'Golgotha', duration: '5:22', year: '2025' },
  { title: 'Control and Chaos', album: 'Control and Chaos', duration: '4:44', year: '2025' },
]

export default function ISMPage() {
  const [activeTab, setActiveTab] = useState<'music' | 'about' | 'mission'>('music')
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const profileUrl = typeof window !== 'undefined' ? window.location.href : 'https://mhcstreaming.com/artist/ism'

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareLinks = [
    { label: 'Twitter / X', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Discovered ISM on MHC Streaming')}&url=${encodeURIComponent(profileUrl)}` },
    { label: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(`ISM on MHC Streaming: ${profileUrl}`)}` },
    { label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}` },
    { label: 'Telegram', url: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}` },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0', position: 'relative' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');
        .ism-cinzel { font-family: 'Cinzel', serif; }
        .ism-garamond { font-family: 'EB Garamond', Georgia, serif; }
        @keyframes ism-breathe { 0%,100%{opacity:.06} 50%{opacity:.14} }
        @keyframes ism-flicker { 0%,100%{opacity:1} 45%{opacity:.9} 55%{opacity:.95} }
        .ism-flicker { animation: ism-flicker 6s ease-in-out infinite; }
        .ism-tab { font-family:'Cinzel',serif; font-size:9px; letter-spacing:3px; text-transform:uppercase; padding:12px 24px; background:transparent; border:none; border-bottom:1px solid #111; color:#333; cursor:pointer; transition:all .2s; }
        .ism-tab.active { color:#fff; border-bottom-color:#fff; }
        .ism-track { display:flex; align-items:center; justify-content:space-between; padding:16px 0; border-bottom:1px solid #080808; gap:16px; transition:padding .2s; cursor:pointer; }
        .ism-track:hover { padding-left:8px; }
        .ism-play { width:32px; height:32px; border-radius:50%; border:1px solid #1e1e1e; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:border-color .2s; }
        .ism-track:hover .ism-play { border-color:#555; }
        .ism-btn { font-family:'Cinzel',serif; font-size:9px; letter-spacing:2px; text-transform:uppercase; padding:11px 22px; background:transparent; border:1px solid #1e1e1e; color:#444; cursor:pointer; transition:all .2s; text-decoration:none; display:inline-block; }
        .ism-btn:hover { border-color:#555; color:#888; }
        .ism-btn-primary { background:#fff; color:#000; border-color:#fff; font-weight:700; }
        .ism-btn-primary:hover { background:#e8e0d0; border-color:#e8e0d0; color:#000; }
        .ism-share-dropdown { position:absolute; top:100%; left:0; margin-top:8px; background:#0a0a0a; border:1px solid #1a1a1a; min-width:180px; z-index:50; }
        .ism-share-option { display:block; width:100%; padding:11px 16px; background:transparent; border:none; border-bottom:1px solid #0f0f0f; color:#444; font-family:'Cinzel',serif; font-size:9px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; text-align:left; transition:color .2s; text-decoration:none; }
        .ism-share-option:hover { color:#e8e0d0; }
        .ism-divider { width:48px; height:1px; background:linear-gradient(to right,transparent,#444,transparent); margin:0 auto; }
      `}</style>

      {/* Subtle Golgotha background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <Image
          src="/images/artists/ism/Golgotha.jpg"
          alt=""
          fill
          style={{ objectFit: 'cover', opacity: 0, animation: 'ism-breathe 10s ease-in-out infinite' }}
          sizes="100vw"
          priority
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Back */}
        <div style={{ padding: '32px 32px 0' }}>
          <Link href="/artists" style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: '#333', textDecoration: 'none', transition: 'color .2s' }}
            onMouseOver={e => (e.currentTarget.style.color = '#888')}
            onMouseOut={e => (e.currentTarget.style.color = '#333')}
          >
            ← All Artists
          </Link>
        </div>

        {/* Hero */}
        <section style={{ padding: '48px 32px', borderBottom: '1px solid #0f0f0f' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '48px', alignItems: 'start' }}>

            {/* Image */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                <Image
                  src="/images/artists/ism/ISM FACE.png"
                  alt="ISM"
                  fill
                  style={{ objectFit: 'cover', filter: 'contrast(110%) brightness(0.9)' }}
                  sizes="280px"
                  priority
                />
                {/* Half split overlay — subtle */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)',
                  pointerEvents: 'none',
                }} />
              </div>
              {/* Sovereign Sound Music logo */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                <Image
                  src="/images/artists/ism/Sovereign Sound Music.png"
                  alt="Sovereign Sound Music"
                  width={80}
                  height={80}
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>

            {/* Info */}
            <div>
              {/* ISM Logo */}
              <div style={{ marginBottom: '16px' }}>
                <Image
                  src="/images/artists/ism/ISM Logo.png"
                  alt="ISM"
                  width={160}
                  height={50}
                  style={{ opacity: 0.95 }}
                />
              </div>

              <div className="ism-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>
                Metal · Sovereign Sound Music
              </div>

              <div className="ism-cinzel" style={{ fontSize: '10px', letterSpacing: '3px', color: '#444', marginBottom: '24px' }}>
                Transcends All Three Realms
              </div>

              <div className="ism-divider" style={{ margin: '0 0 24px' }} />

              {/* Short bio */}
              <p className="ism-garamond" style={{ fontSize: '16px', color: '#555', lineHeight: 1.9, marginBottom: '28px', maxWidth: '480px', fontStyle: 'italic' }}>
                Like Moses before him, ISM walked years in the wilderness — seasons of trial, silence, and refinement — before the Most High placed the calling on his lips and a purpose in his hands.
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '32px', marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid #0f0f0f' }}>
                {[
                  { val: 'Pseudo Prophet', lbl: 'Latest Album' },
                  { val: '2026', lbl: 'Active Since' },
                  { val: '4', lbl: 'Releases' },
                ].map(s => (
                  <div key={s.lbl}>
                    <div className="ism-cinzel" style={{ fontSize: '14px', color: '#e8e0d0', marginBottom: '3px', fontWeight: 700 }}>{s.val}</div>
                    <div className="ism-cinzel" style={{ fontSize: '8px', color: '#333', letterSpacing: '2px', textTransform: 'uppercase' }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="ism-btn ism-btn-primary">
                  Listen on Spotify
                </a>
                <button className="ism-btn" onClick={copyLink}>
                  {copied ? '✓ Copied' : 'Copy Link'}
                </button>
                <div style={{ position: 'relative' }}>
                  <button className="ism-btn" onClick={() => setShareOpen(s => !s)}>
                    Share
                  </button>
                  {shareOpen && (
                    <div className="ism-share-dropdown">
                      {shareLinks.map(s => (
                        <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="ism-share-option" onClick={() => setShareOpen(false)}>
                          {s.label}
                        </a>
                      ))}
                      <button className="ism-share-option" style={{ width: '100%' }} onClick={() => { copyLink(); setShareOpen(false) }}>
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pseudo Prophet banner */}
        <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #0f0f0f' }}>
          <div style={{ position: 'relative', height: '280px' }}>
            <Image
              src="/images/artists/ism/ISM (2).png"
              alt="ISM Pseudo Prophet"
              fill
              style={{ objectFit: 'cover', filter: 'brightness(0.4)' }}
              sizes="100vw"
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #000 0%, transparent 40%, transparent 60%, #000 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '32px' }}>
              <div className="ism-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#888', textTransform: 'uppercase', marginBottom: '12px' }}>
                Latest Release
              </div>
              <div className="ism-cinzel ism-flicker" style={{ fontSize: 'clamp(24px,5vw,48px)', color: '#fff', letterSpacing: '4px', marginBottom: '8px', fontWeight: 900 }}>
                PSEUDO PROPHET
              </div>
              <div className="ism-cinzel" style={{ fontSize: '10px', letterSpacing: '3px', color: '#555' }}>
                ISM · 2026
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #0f0f0f', padding: '0 32px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex' }}>
            {(['music', 'about', 'mission'] as const).map(tab => (
              <button key={tab} className={`ism-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <section style={{ padding: '48px 32px', maxWidth: '960px', margin: '0 auto' }}>

          {activeTab === 'music' && (
            <div>
              <div className="ism-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#444', textTransform: 'uppercase', marginBottom: '24px' }}>
                Discography
              </div>
              {tracks.map((track, i) => (
                <div key={track.title} className="ism-track">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="ism-cinzel" style={{ fontSize: '11px', color: '#222', width: '20px', textAlign: 'right' }}>{i + 1}</span>
                    <div className="ism-play">
                      <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #555', marginLeft: '2px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#e8e0d0', marginBottom: '2px' }}>{track.title}</div>
                      <div style={{ fontSize: '11px', color: '#333' }}>{track.album} · {track.year}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#333' }}>{track.duration}</span>
                </div>
              ))}

              {/* Album art row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', background: '#111', marginTop: '48px' }}>
                {[
                  { src: '/images/artists/ism/ISM (2).png', title: 'Pseudo Prophet' },
                  { src: '/images/artists/ism/ISM Control and chaos.png', title: 'Control and Chaos' },
                  { src: '/images/artists/ism/ISM (3).png', title: 'ISM' },
                ].map(album => (
                  <div key={album.title} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', cursor: 'pointer' }}>
                    <Image src={album.src} alt={album.title} fill style={{ objectFit: 'cover', filter: 'brightness(0.5)', transition: 'filter .4s' }}
                      onMouseOver={e => (e.currentTarget.style.filter = 'brightness(0.7)')}
                      onMouseOut={e => (e.currentTarget.style.filter = 'brightness(0.5)')}
                      sizes="300px"
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 14px', background: 'linear-gradient(to top,#000,transparent)' }}>
                      <div className="ism-cinzel" style={{ fontSize: '11px', color: '#e8e0d0', letterSpacing: '1px' }}>{album.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ maxWidth: '640px' }}>
              <div className="ism-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#444', textTransform: 'uppercase', marginBottom: '24px' }}>
                The Story
              </div>
              <p className="ism-garamond" style={{ fontSize: '18px', color: '#555', lineHeight: 2, marginBottom: '24px' }}>
                Like Moses before him, ISM walked years in the wilderness — seasons of trial, silence, and refinement — before the Most High placed the calling on his lips and a purpose in his hands.
              </p>
              <p className="ism-garamond" style={{ fontSize: '18px', color: '#444', lineHeight: 2, marginBottom: '24px' }}>
                Those decades were not wasted. Every storm weathered, every valley crossed, every dark night endured became the raw material of revelation. The wilderness does not break the chosen — it builds them.
              </p>
              <p className="ism-garamond" style={{ fontSize: '18px', color: '#3a3a3a', lineHeight: 2 }}>
                Now ISM emerges — not as a man of religion, but as a disciple of truth — carrying the wisdom of the journey into every bar, every beat, every breath. The music is the testimony. The testimony is the ministry.
              </p>

              {/* ISM wrap image */}
              <div style={{ marginTop: '40px', position: 'relative', height: '200px', overflow: 'hidden' }}>
                <Image
                  src="/images/artists/ism/ISM wrap.jpg"
                  alt="ISM Truth"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.6) contrast(120%)' }}
                  sizes="640px"
                />
              </div>
            </div>
          )}

          {activeTab === 'mission' && (
            <div style={{ maxWidth: '640px' }}>
              <div className="ism-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#444', textTransform: 'uppercase', marginBottom: '24px' }}>
                The Calling
              </div>
              <p className="ism-garamond" style={{ fontSize: '18px', color: '#555', lineHeight: 2, marginBottom: '24px' }}>
                ISM transcends all three realms — Inferno, Purgatorio, Paradiso — as a chosen messenger of the Most High. The music is not entertainment. It is a counterforce.
              </p>
              <p className="ism-garamond" style={{ fontSize: '18px', color: '#444', lineHeight: 2, marginBottom: '40px' }}>
                In a world overcome by dark energy — lethargy, deception, spiritual blindness — ISM carries the frequency of truth through metal, through word, through testimony.
              </p>

              {/* Spirit of Lethargy */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <Image
                  src="/images/artists/ism/ISM Suedo Prophet.png"
                  alt="Spirit of Lethargy"
                  width={640}
                  height={360}
                  style={{ width: '100%', height: 'auto', filter: 'brightness(0.7)' }}
                />
                <div style={{ position: 'absolute', bottom: '24px', left: '24px' }}>
                  <div className="ism-cinzel" style={{ fontSize: '9px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase' }}>
                    From the album
                  </div>
                  <div className="ism-cinzel" style={{ fontSize: '18px', color: '#fff', letterSpacing: '2px' }}>
                    Pseudo Prophet
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
