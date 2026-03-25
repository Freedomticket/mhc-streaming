'use client'

import Link from 'next/link'
import { useState } from 'react'

const artistData: Record<string, {
  name: string
  title: string
  realm: 'inferno' | 'purgatorio' | 'paradiso'
  bio: string
  longBio: string
  followers: string
  streams: string
  verified: boolean
  iconType: string
  genres: string[]
  tracks: { title: string; duration: string; streams: string }[]
  socialLinks: { label: string; url: string }[]
}> = {
  '1': {
    name: 'Luna Eclipse',
    title: 'Composer & Producer',
    realm: 'inferno',
    bio: 'Dark ambient and industrial soundscapes from the first circle',
    longBio: 'Luna Eclipse emerges from the shadows of independent music with a sound that defies genre. Drawing from industrial, ambient, and dark classical traditions, her compositions descend through emotional layers few artists dare to explore. Every track is a portal — enter at your own risk.',
    followers: '15.2K',
    streams: '2.4M',
    verified: true,
    iconType: 'crown',
    genres: ['Dark Ambient', 'Industrial', 'Experimental'],
    tracks: [
      { title: 'Descending', duration: '4:32', streams: '287K' },
      { title: 'First Circle', duration: '6:14', streams: '194K' },
      { title: 'Ash & Ember', duration: '3:58', streams: '156K' },
      { title: 'The Burning Gate', duration: '5:20', streams: '112K' },
    ],
    socialLinks: [
      { label: 'Bandcamp', url: '#' },
      { label: 'SoundCloud', url: '#' },
    ]
  },
  '2': {

    name: 'Rising Soul',
    title: 'Singer-Songwriter',
    realm: 'purgatorio',
    bio: 'Transformative folk and indie ascending toward the light',
    longBio: 'Rising Soul writes songs for the in-between — the moments of transformation, grief, and unexpected hope. With an acoustic foundation and layered vocals that drift like mountain mist, this artist captures the experience of becoming. Not yet arrived, but undeniably ascending.',
    followers: '9.8K',
    streams: '1.1M',
    verified: false,
    iconType: 'ladder',
    genres: ['Folk', 'Indie', 'Acoustic'],
    tracks: [
      { title: 'The Climb', duration: '3:45', streams: '198K' },
      { title: 'Mist & Memory', duration: '4:10', streams: '143K' },
      { title: 'Almost There', duration: '3:22', streams: '98K' },
      { title: 'Penance Road', duration: '5:01', streams: '87K' },
    ],
    socialLinks: [
      { label: 'Bandcamp', url: '#' },
      { label: 'SoundCloud', url: '#' },
    ]
  },
  '3': {
    name: 'Celestial Voices',
    title: 'Vocal Ensemble',
    realm: 'paradiso',
    bio: 'Ethereal harmonies from the highest spheres of heaven',
    longBio: 'Celestial Voices is a collective of seven vocalists who perform without amplification, relying solely on the power of human breath and sacred space. Their compositions draw from Gregorian chant, sacred geometry, and ancient harmonic traditions to create sound that transcends performance and becomes prayer.',
    followers: '12.5K',
    streams: '3.2M',
    verified: true,
    iconType: 'radiant',
    genres: ['Sacred', 'Choral', 'Ambient'],
    tracks: [
      { title: 'Ninth Sphere', duration: '7:22', streams: '445K' },
      { title: 'Divine Light', duration: '5:48', streams: '312K' },
      { title: 'The Empyrean', duration: '9:10', streams: '287K' },
      { title: 'Rose of Heaven', duration: '4:33', streams: '198K' },
    ],
    socialLinks: [
      { label: 'Bandcamp', url: '#' },
      { label: 'SoundCloud', url: '#' },
    ]
  },
  '4': {
    name: 'The Void',
    title: 'Electronic Artist',
    realm: 'inferno',
    bio: 'Experimental techno and dark wave from the abyss',
    longBio: 'The Void builds sonic architecture from destruction. Operating at the intersection of industrial techno and experimental noise, this project weaponizes frequency and silence in equal measure. Live performances have been described as rituals rather than concerts.',
    followers: '8.3K',
    streams: '850K',
    verified: false,
    iconType: 'mask',
    genres: ['Dark Techno', 'Industrial', 'Noise'],
    tracks: [
      { title: 'Abyss Protocol', duration: '8:14', streams: '142K' },
      { title: 'Null Signal', duration: '6:30', streams: '118K' },
      { title: 'Infernal Machine', duration: '7:02', streams: '94K' },
      { title: 'Void Walker', duration: '5:55', streams: '87K' },
    ],
    socialLinks: [
      { label: 'Bandcamp', url: '#' },
      { label: 'SoundCloud', url: '#' },
    ]
  },
  '5': {
    name: 'Green Spirit',
    title: 'Folk Musician',
    realm: 'purgatorio',
    bio: 'Nature-inspired acoustic melodies of purification',
    longBio: 'Green Spirit records in forests, fields, and mountain streams. The natural world is not backdrop but collaborator — you can hear wind, water, and birdsong woven intentionally into each piece. This is music for those who need to remember what silence sounds like.',
    followers: '6.7K',
    streams: '650K',
    verified: false,
    iconType: 'smoke',
    genres: ['Folk', 'Nature', 'Acoustic'],
    tracks: [
      { title: 'Forest Prayer', duration: '4:12', streams: '123K' },
      { title: 'Mountain Stream', duration: '3:55', streams: '98K' },
      { title: 'Root & Branch', duration: '5:22', streams: '76K' },
      { title: 'Smoke Ritual', duration: '6:08', streams: '54K' },
    ],
    socialLinks: [
      { label: 'Bandcamp', url: '#' },
      { label: 'SoundCloud', url: '#' },
    ]
  },
  '6': {
    name: 'Color Masters',
    title: 'DJ & Producer',
    realm: 'paradiso',
    bio: 'Sacred geometry in sound — uplifting house and trance',
    longBio: 'Color Masters approaches electronic music as sacred architecture. Each set is engineered with mathematical precision — BPM, frequency, and harmonic structure aligned to the principles of sacred geometry. The result is music that does not just move bodies but realigns them.',
    followers: '11.2K',
    streams: '2.1M',
    verified: true,
    iconType: 'geometry',
    genres: ['House', 'Trance', 'Sacred Electronic'],
    tracks: [
      { title: 'Golden Ratio', duration: '6:44', streams: '334K' },
      { title: 'Fibonacci Rising', duration: '7:12', streams: '287K' },
      { title: 'Sacred Geometry', duration: '8:30', streams: '243K' },
      { title: 'The Divine Proportion', duration: '5:58', streams: '198K' },
    ],
    socialLinks: [
      { label: 'Bandcamp', url: '#' },
      { label: 'SoundCloud', url: '#' },
    ]
  },
}

const realmConfig = {
  inferno: {
    accent: '#c0392b',
    accentLight: '#e74c3c',
    badgeBorder: '#c0392b44',
    heroBg: 'linear-gradient(to bottom, #1a0500, #000)',
    divider: '#c0392b',
  },
  purgatorio: {
    accent: '#888',
    accentLight: '#aaa',
    badgeBorder: '#8884',
    heroBg: 'linear-gradient(to bottom, #0d0d12, #000)',
    divider: '#666',
  },
  paradiso: {
    accent: '#c9a84c',
    accentLight: '#d4b85c',
    badgeBorder: '#c9a84c44',
    heroBg: 'linear-gradient(to bottom, #0d0a00, #000)',
    divider: '#c9a84c',
  },
}

function ArtistIcon({ type, realm }: { type: string; realm: 'inferno' | 'purgatorio' | 'paradiso' }) {
  const color = realmConfig[realm].accent
  const bg = realm === 'inferno' ? '#1a0500' : realm === 'purgatorio' ? '#0d0d0d' : '#0d0a00'
  const stroke = realmConfig[realm].accentLight

  const icons: Record<string, JSX.Element> = {
    crown: (
      <svg width="96" height="96" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={bg} stroke={color} strokeWidth="1"/>
        <path d="M24 8 L20 16 L13 12 L16 20 L8 22 L16 26 L14 34 L24 30 L34 34 L32 26 L40 22 L32 20 L35 12 L28 16 Z" fill={color} opacity="0.9"/>
        <circle cx="24" cy="22" r="5" fill={bg} stroke={stroke} strokeWidth="1"/>
        <circle cx="24" cy="22" r="2" fill={stroke}/>
      </svg>
    ),
    mask: (
      <svg width="96" height="96" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={bg} stroke={color} strokeWidth="1"/>
        <path d="M24 10 Q30 12 34 18 Q38 24 34 30 Q30 36 24 36 Q18 36 14 30 Q10 24 14 18 Q18 12 24 10Z" fill="none" stroke={color} strokeWidth="1.2"/>
        <ellipse cx="19" cy="21" rx="3" ry="4" fill={color} opacity="0.8"/>
        <ellipse cx="29" cy="21" rx="3" ry="4" fill={color} opacity="0.8"/>
        <path d="M18 29 Q24 33 30 29" fill="none" stroke={color} strokeWidth="1.2"/>
        <path d="M12 16 L16 20" stroke={stroke} strokeWidth="1" opacity="0.7"/>
        <path d="M36 16 L32 20" stroke={stroke} strokeWidth="1" opacity="0.7"/>
      </svg>
    ),
    ladder: (
      <svg width="96" height="96" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={bg} stroke={color} strokeWidth="1"/>
        <line x1="24" y1="38" x2="24" y2="10" stroke={color} strokeWidth="1.5"/>
        <line x1="18" y1="34" x2="30" y2="34" stroke={color} strokeWidth="1.2"/>
        <line x1="18" y1="28" x2="30" y2="28" stroke={color} strokeWidth="1.2"/>
        <line x1="18" y1="22" x2="30" y2="22" stroke={color} strokeWidth="1.2"/>
        <line x1="20" y1="16" x2="28" y2="16" stroke={stroke} strokeWidth="1.2"/>
        <circle cx="24" cy="10" r="3.5" fill="none" stroke={stroke} strokeWidth="1.2"/>
      </svg>
    ),
    smoke: (
      <svg width="96" height="96" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={bg} stroke={color} strokeWidth="1"/>
        <path d="M24 36 Q28 30 26 24 Q24 18 28 14 Q32 10 30 7" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M24 36 Q20 30 22 24 Q24 18 20 14 Q16 10 18 7" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
        <ellipse cx="24" cy="38" rx="5" ry="2" fill="#2a2a2a" stroke="#444" strokeWidth="0.8"/>
      </svg>
    ),
    radiant: (
      <svg width="96" height="96" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={bg} stroke={color} strokeWidth="1"/>
        <circle cx="24" cy="24" r="10" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5"/>
        <circle cx="24" cy="24" r="6" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
        <circle cx="24" cy="24" r="3" fill={color}/>
        <line x1="24" y1="8" x2="24" y2="14" stroke={color} strokeWidth="1.2" opacity="0.8"/>
        <line x1="24" y1="34" x2="24" y2="40" stroke={color} strokeWidth="1.2" opacity="0.8"/>
        <line x1="8" y1="24" x2="14" y2="24" stroke={color} strokeWidth="1.2" opacity="0.8"/>
        <line x1="34" y1="24" x2="40" y2="24" stroke={color} strokeWidth="1.2" opacity="0.8"/>
        <line x1="13" y1="13" x2="17" y2="17" stroke={color} strokeWidth="1" opacity="0.5"/>
        <line x1="31" y1="31" x2="35" y2="35" stroke={color} strokeWidth="1" opacity="0.5"/>
        <line x1="35" y1="13" x2="31" y2="17" stroke={color} strokeWidth="1" opacity="0.5"/>
        <line x1="17" y1="31" x2="13" y2="35" stroke={color} strokeWidth="1" opacity="0.5"/>
      </svg>
    ),
    geometry: (
      <svg width="96" height="96" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={bg} stroke={color} strokeWidth="1"/>
        <polygon points="24,10 36,30 12,30" fill="none" stroke={color} strokeWidth="1.2"/>
        <polygon points="24,38 36,18 12,18" fill="none" stroke={color} strokeWidth="1.2" opacity="0.6"/>
        <circle cx="24" cy="24" r="4" fill="none" stroke={color} strokeWidth="1" opacity="0.8"/>
        <circle cx="24" cy="24" r="1.5" fill={color}/>
      </svg>
    ),
  }
  return icons[type] || icons.crown
}

export default function ArtistPage({ params }: { params: { id: string } }) {
  const artist = artistData[params.id]
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState<'music' | 'about'>('music')
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const profileUrl = typeof window !== 'undefined' ? window.location.href : `https://mhcstreaming.com/artist/${params.id}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${artist.name} on MHC Streaming`,
        text: `${artist.bio} — Listen on MHC Streaming`,
        url: profileUrl,
      })
    } else {
      setShareOpen(s => !s)
    }
  }

  const shareLinks = [
    { label: 'Twitter / X', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${artist.name} on MHC Streaming — ${artist.bio}`)}&url=${encodeURIComponent(profileUrl)}` },
    { label: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(`${artist.name} on MHC Streaming: ${profileUrl}`)}` },
    { label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}` },
    { label: 'Telegram', url: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(`${artist.name} — ${artist.bio}`)}` },
  ]

  if (!artist) {
    return (
      <main style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '5px', color: '#c9a84c', marginBottom: '12px' }}>404</div>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: '28px', color: '#fff', marginBottom: '8px' }}>Artist Not Found</h1>
          <p style={{ fontSize: '13px', color: '#444', marginBottom: '24px' }}>This soul has not yet entered the realm.</p>
          <Link href="/artists" style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 24px', border: '1px solid #1e1e1e', color: '#444', textDecoration: 'none' }}>
            Back to Artists
          </Link>
        </div>
      </main>
    )
  }

  const cfg = realmConfig[artist.realm]

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
        .ap-cinzel { font-family: 'Cinzel', serif; }
        .ap-tab { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 10px 24px; background: transparent; border: none; border-bottom: 1px solid #111; color: #333; cursor: pointer; transition: all .2s; }
        .ap-tab.active { color: #e8e0d0; border-bottom-color: currentColor; }
        .ap-track { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #0f0f0f; gap: 16px; cursor: pointer; transition: background .2s; }
        .ap-track:hover { background: #080808; padding-left: 8px; padding-right: 8px; margin: 0 -8px; }
        .ap-follow-btn { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 32px; border: none; cursor: pointer; font-weight: 700; transition: all .2s; }
        .ap-msg-btn { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 20px; background: transparent; border: 1px solid #1e1e1e; color: #444; cursor: pointer; transition: all .2s; }
        .ap-msg-btn:hover { border-color: #444; color: #888; }
        .ap-genre { font-family: 'Cinzel', serif; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; padding: 4px 10px; border: 1px solid #1a1a1a; color: #333; }
        .ap-share-btn { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 20px; background: transparent; border: 1px solid #1e1e1e; color: #444; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 8px; }
        .ap-share-btn:hover { border-color: #c9a84c44; color: #c9a84c; }
        .ap-share-dropdown { position: absolute; top: 100%; left: 0; margin-top: 8px; background: #0a0a0a; border: 1px solid #1a1a1a; min-width: 200px; z-index: 50; }
        .ap-share-option { display: block; width: 100%; padding: 12px 16px; background: transparent; border: none; border-bottom: 1px solid #0f0f0f; color: #555; font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; text-align: left; transition: all .2s; text-decoration: none; }
        .ap-share-option:hover { background: #111; color: #c9a84c; }
        .ap-copy-btn { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 20px; background: transparent; border: 1px solid #1e1e1e; color: #444; cursor: pointer; transition: all .2s; }
        .ap-copy-btn:hover { border-color: #c9a84c44; color: #c9a84c; }
        .ap-copy-btn.copied { border-color: #4caf5044; color: #4caf50; }
      `}</style>

      {/* Hero */}
      <section style={{ background: cfg.heroBg, borderBottom: '1px solid #0f0f0f', padding: '64px 32px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/artists" style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: '#333', textDecoration: 'none', display: 'inline-block', marginBottom: '40px', transition: 'color .2s' }}
            onMouseOver={e => (e.currentTarget.style.color = '#888')}
            onMouseOut={e => (e.currentTarget.style.color = '#333')}
          >
            ← All Artists
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
            {/* Icon */}
            <div style={{ flexShrink: 0 }}>
              <ArtistIcon type={artist.iconType} realm={artist.realm} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="ap-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: cfg.accent, textTransform: 'uppercase' }}>
                  {artist.realm}
                </span>
                {artist.verified && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a84c', display: 'inline-block' }} title="Verified" />
                )}
              </div>

              <h1 className="ap-cinzel" style={{ fontSize: 'clamp(26px,4vw,44px)', color: '#fff', letterSpacing: '3px', marginBottom: '4px', fontWeight: 900 }}>
                {artist.name}
              </h1>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px', letterSpacing: '1px' }}>{artist.title}</p>

              <p style={{ fontSize: '13px', color: '#3a3a3a', lineHeight: 1.8, marginBottom: '24px', maxWidth: '480px' }}>
                {artist.bio}
              </p>

              {/* Genres */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                {artist.genres.map(g => (
                  <span key={g} className="ap-genre">{g}</span>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '32px', marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid #111' }}>
                <div>
                  <div className="ap-cinzel" style={{ fontSize: '22px', color: '#e8e0d0', fontWeight: 700 }}>{artist.followers}</div>
                  <div className="ap-cinzel" style={{ fontSize: '9px', color: '#333', letterSpacing: '2px', textTransform: 'uppercase' }}>Followers</div>
                </div>
                <div>
                  <div className="ap-cinzel" style={{ fontSize: '22px', color: '#e8e0d0', fontWeight: 700 }}>{artist.streams}</div>
                  <div className="ap-cinzel" style={{ fontSize: '9px', color: '#333', letterSpacing: '2px', textTransform: 'uppercase' }}>Streams</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className="ap-follow-btn"
                  onClick={() => setFollowing(f => !f)}
                  style={{
                    background: following ? 'transparent' : cfg.accent,
                    color: following ? cfg.accent : (artist.realm === 'paradiso' ? '#000' : '#fff'),
                    border: `1px solid ${cfg.accent}`,
                  }}
                >
                  {following ? '✓ Following' : 'Follow'}
                </button>
                <button className="ap-msg-btn">Message</button>
                {artist.socialLinks.map(l => (
                  <a key={l.label} href={l.url} className="ap-msg-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    {l.label}
                  </a>
                ))}

                {/* Copy Link */}
                <button
                  className={`ap-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={copyLink}
                >
                  {copied ? '✓ Copied' : 'Copy Link'}
                </button>

                {/* Share button with dropdown */}
                <div style={{ position: 'relative' }}>
                  <button className="ap-share-btn" onClick={shareNative}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Share
                  </button>
                  {shareOpen && (
                    <div className="ap-share-dropdown">
                      {shareLinks.map(s => (
                        <a
                          key={s.label}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ap-share-option"
                          onClick={() => setShareOpen(false)}
                        >
                          {s.label}
                        </a>
                      ))}
                      <button
                        className="ap-share-option"
                        onClick={() => { copyLink(); setShareOpen(false) }}
                        style={{ width: '100%' }}
                      >
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #0f0f0f', padding: '0 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '0' }}>
          <button className={`ap-tab ${activeTab === 'music' ? 'active' : ''}`} onClick={() => setActiveTab('music')}
            style={{ color: activeTab === 'music' ? cfg.accent : '#333', borderBottomColor: activeTab === 'music' ? cfg.accent : '#111' }}>
            Music
          </button>
          <button className={`ap-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}
            style={{ color: activeTab === 'about' ? cfg.accent : '#333', borderBottomColor: activeTab === 'about' ? cfg.accent : '#111' }}>
            About
          </button>
        </div>
      </div>

      {/* Content */}
      <section style={{ padding: '48px 32px', maxWidth: '900px', margin: '0 auto' }}>
        {activeTab === 'music' && (
          <div>
            <div className="ap-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: cfg.accent, textTransform: 'uppercase', marginBottom: '24px' }}>
              Top Tracks
            </div>
            {artist.tracks.map((track, i) => (
              <div key={track.title} className="ap-track">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className="ap-cinzel" style={{ fontSize: '11px', color: '#2a2a2a', width: '20px', textAlign: 'right' }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e8e0d0', marginBottom: '2px' }}>{track.title}</div>
                    <div style={{ fontSize: '11px', color: '#333' }}>{track.streams} streams</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#333' }}>{track.duration}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${cfg.badgeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `8px solid ${cfg.accent}`, marginLeft: '2px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ maxWidth: '600px' }}>
            <div className="ap-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: cfg.accent, textTransform: 'uppercase', marginBottom: '24px' }}>
              About the Artist
            </div>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 2, marginBottom: '32px' }}>
              {artist.longBio}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {artist.socialLinks.map(l => (
                <a key={l.label} href={l.url} style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', padding: '8px 16px', border: `1px solid ${cfg.badgeBorder}`, color: cfg.accent, textDecoration: 'none', transition: 'all .2s' }}>
                  {l.label} →
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
