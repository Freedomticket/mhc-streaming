'use client'

import Link from 'next/link'
import { useState } from 'react'

type Realm = 'all' | 'inferno' | 'purgatorio' | 'paradiso'

const artists = [
  {
    id: 1,
    name: 'Luna Eclipse',
    title: 'Composer & Producer',
    realm: 'inferno' as const,
    followers: '15.2K',
    streams: '2.4M',
    bio: 'Dark ambient and industrial soundscapes from the first circle',
    verified: true,
    iconType: 'crown',
  },
  {
    id: 2,
    name: 'Rising Soul',
    title: 'Singer-Songwriter',
    realm: 'purgatorio' as const,
    followers: '9.8K',
    streams: '1.1M',
    bio: 'Transformative folk and indie ascending toward the light',
    verified: false,
    iconType: 'ladder',
  },
  {
    id: 3,
    name: 'Celestial Voices',
    title: 'Vocal Ensemble',
    realm: 'paradiso' as const,
    followers: '12.5K',
    streams: '3.2M',
    bio: 'Ethereal harmonies from the highest spheres of heaven',
    verified: true,
    iconType: 'radiant',
  },
  {
    id: 4,
    name: 'The Void',
    title: 'Electronic Artist',
    realm: 'inferno' as const,
    followers: '8.3K',
    streams: '850K',
    bio: 'Experimental techno and dark wave from the abyss',
    verified: false,
    iconType: 'mask',
  },
  {
    id: 5,
    name: 'Green Spirit',
    title: 'Folk Musician',
    realm: 'purgatorio' as const,
    followers: '6.7K',
    streams: '650K',
    bio: 'Nature-inspired acoustic melodies of purification',
    verified: false,
    iconType: 'smoke',
  },
  {
    id: 6,
    name: 'Color Masters',
    title: 'DJ & Producer',
    realm: 'paradiso' as const,
    followers: '11.2K',
    streams: '2.1M',
    bio: 'Sacred geometry in sound — uplifting house and trance',
    verified: true,
    iconType: 'geometry',
  },
]

const realmConfig = {
  inferno: { accent: '#c0392b', accentHover: '#e74c3c', badgeBorder: '#c0392b44', cardBg: '#110800', borderHover: '#c0392b' },
  purgatorio: { accent: '#888', accentHover: '#aaa', badgeBorder: '#8884', cardBg: '#0c0c10', borderHover: '#888' },
  paradiso: { accent: '#c9a84c', accentHover: '#d4b85c', badgeBorder: '#c9a84c44', cardBg: '#0c0a00', borderHover: '#c9a84c' },
}

function ArtistIcon({ type, realm }: { type: string; realm: 'inferno' | 'purgatorio' | 'paradiso' }) {
  const color = realmConfig[realm].accent
  const bg = realm === 'inferno' ? '#1a0500' : realm === 'purgatorio' ? '#0d0d0d' : '#0d0a00'
  const stroke = realmConfig[realm].accentHover

  const icons: Record<string, JSX.Element> = {
    crown: (
      <svg width="64" height="64" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={bg} stroke={color} strokeWidth="1"/>
        <path d="M24 8 L20 16 L13 12 L16 20 L8 22 L16 26 L14 34 L24 30 L34 34 L32 26 L40 22 L32 20 L35 12 L28 16 Z" fill={color} opacity="0.9"/>
        <circle cx="24" cy="22" r="5" fill={bg} stroke={stroke} strokeWidth="1"/>
        <circle cx="24" cy="22" r="2" fill={stroke}/>
      </svg>
    ),
    mask: (
      <svg width="64" height="64" viewBox="0 0 48 48">
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
      <svg width="64" height="64" viewBox="0 0 48 48">
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
      <svg width="64" height="64" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill={bg} stroke={color} strokeWidth="1"/>
        <path d="M24 36 Q28 30 26 24 Q24 18 28 14 Q32 10 30 7" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M24 36 Q20 30 22 24 Q24 18 20 14 Q16 10 18 7" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
        <ellipse cx="24" cy="38" rx="5" ry="2" fill="#2a2a2a" stroke="#444" strokeWidth="0.8"/>
      </svg>
    ),
    radiant: (
      <svg width="64" height="64" viewBox="0 0 48 48">
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
      <svg width="64" height="64" viewBox="0 0 48 48">
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

export default function ArtistsPage() {
  const [selectedRealm, setSelectedRealm] = useState<Realm>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = artists.filter(a => {
    const matchRealm = selectedRealm === 'all' || a.realm === selectedRealm
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchRealm && matchSearch
  })

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
        .art-cinzel { font-family: 'Cinzel', serif; }
        .art-search {
          width: 100%; padding: 12px 20px;
          background: #080808; border: 1px solid #1a1a1a;
          color: #e8e0d0; font-size: 13px; outline: none;
          letter-spacing: 1px;
        }
        .art-search:focus { border-color: #c9a84c44; }
        .art-search::placeholder { color: #2a2a2a; }
        .realm-btn {
          font-family: 'Cinzel', serif;
          font-size: 9px; letter-spacing: 3px;
          text-transform: uppercase; padding: 8px 20px;
          background: transparent; border: 1px solid #1a1a1a;
          color: #333; cursor: pointer; transition: all .2s;
        }
        .realm-btn:hover { border-color: #333; color: #888; }
        .realm-btn-all.active { border-color: #555; color: #e8e0d0; }
        .realm-btn-inferno.active { border-color: #c0392b; color: #c0392b; }
        .realm-btn-purgatorio.active { border-color: #888; color: #888; }
        .realm-btn-paradiso.active { border-color: #c9a84c; color: #c9a84c; }
        .artist-card {
          background: #0a0a0a;
          border: 1px solid #111;
          border-bottom: 2px solid transparent;
          padding: 28px 24px 22px;
          transition: all .3s; cursor: pointer;
          text-decoration: none; display: block; color: inherit;
        }
        .artist-card-inferno { border-bottom-color: #c0392b44; }
        .artist-card-inferno:hover { background: #110800; border-bottom-color: #c0392b; border-color: #1a0800; }
        .artist-card-purgatorio { border-bottom-color: #8884; }
        .artist-card-purgatorio:hover { background: #0c0c10; border-bottom-color: #888; border-color: #161620; }
        .artist-card-paradiso { border-bottom-color: #c9a84c44; }
        .artist-card-paradiso:hover { background: #0c0a00; border-bottom-color: #c9a84c; border-color: #1a1500; }
        .art-name { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 700; color: #e8e0d0; letter-spacing: 1px; margin-bottom: 3px; }
        .art-role { font-size: 11px; color: #555; margin-bottom: 10px; letter-spacing: .5px; }
        .art-badge { font-family: 'Cinzel', serif; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; padding: 2px 8px; border: 1px solid currentColor; display: inline-block; margin-bottom: 14px; }
        .art-bio { font-size: 12px; color: #3a3a3a; line-height: 1.7; margin-bottom: 18px; }
        .art-stat-val { font-size: 15px; font-weight: 700; color: #e8e0d0; display: block; }
        .art-stat-lbl { font-size: 9px; color: #333; letter-spacing: 1px; text-transform: uppercase; font-family: 'Cinzel', serif; }
        .art-btn-follow { padding: 9px; border: none; font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; font-weight: 700; transition: all .2s; width: 100%; }
        .art-btn-inferno { background: #c0392b; color: #fff; }
        .art-btn-inferno:hover { background: #e74c3c; }
        .art-btn-purgatorio { background: #333; color: #ccc; }
        .art-btn-purgatorio:hover { background: #555; }
        .art-btn-paradiso { background: #c9a84c; color: #000; }
        .art-btn-paradiso:hover { background: #d4b85c; }
        .art-btn-msg { padding: 9px 14px; background: transparent; border: 1px solid #1e1e1e; color: #444; cursor: pointer; transition: all .2s; font-size: 11px; }
        .art-btn-msg:hover { border-color: #444; color: #888; }
        .verified-dot { width: 6px; height: 6px; border-radius: 50%; background: #c9a84c; display: inline-block; margin-left: 6px; flex-shrink: 0; }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '72px 32px 40px', textAlign: 'center', borderBottom: '1px solid #0f0f0f' }}>
        <div className="art-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px' }}>
          The Three Realms
        </div>
        <h1 className="art-cinzel" style={{ fontSize: 'clamp(26px,4vw,44px)', color: '#fff', letterSpacing: '4px', marginBottom: '8px' }}>
          DISCOVER ARTISTS
        </h1>
        <div style={{ width: '48px', height: '1px', background: 'linear-gradient(to right,transparent,#c9a84c,transparent)', margin: '0 auto 12px' }} />
        <p style={{ fontSize: '13px', color: '#3a3a3a', letterSpacing: '2px' }}>
          Explore creators across all three realms
        </p>
      </section>

      {/* Search + Filter */}
      <section style={{ padding: '40px 32px', borderBottom: '1px solid #0f0f0f', maxWidth: '800px', margin: '0 auto' }}>
        <input
          className="art-search"
          placeholder="Search artists, genres, realms..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {(['all', 'inferno', 'purgatorio', 'paradiso'] as Realm[]).map(r => (
            <button
              key={r}
              className={`realm-btn realm-btn-${r} ${selectedRealm === r ? 'active' : ''}`}
              onClick={() => setSelectedRealm(r)}
            >
              {r === 'all' ? 'All Realms' : r}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: '48px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="art-cinzel" style={{ fontSize: '13px', color: '#2a2a2a', letterSpacing: '3px', marginBottom: '20px' }}>
              No artists found in this realm
            </div>
            <button
              className="realm-btn"
              onClick={() => { setSearchQuery(''); setSelectedRealm('all') }}
              style={{ color: '#c9a84c', borderColor: '#c9a84c44' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '2px', background: '#111' }}>
            {filtered.map(artist => {
              const cfg = realmConfig[artist.realm]
              return (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className={`artist-card artist-card-${artist.realm}`}
                >
                  {/* Icon */}
                  <div style={{ marginBottom: '18px' }}>
                    <ArtistIcon type={artist.iconType} realm={artist.realm} />
                  </div>

                  {/* Name + verified */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div className="art-name">{artist.name}</div>
                    {artist.verified && <span className="verified-dot" title="Verified Artist" />}
                  </div>
                  <div className="art-role">{artist.title}</div>

                  {/* Realm badge */}
                  <span className="art-badge" style={{ color: cfg.accent, borderColor: cfg.badgeBorder }}>
                    {artist.realm}
                  </span>

                  {/* Bio */}
                  <p className="art-bio">{artist.bio}</p>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '24px', paddingTop: '14px', borderTop: '1px solid #111', marginBottom: '16px' }}>
                    <div>
                      <span className="art-stat-val">{artist.followers}</span>
                      <span className="art-stat-lbl">Followers</span>
                    </div>
                    <div>
                      <span className="art-stat-val">{artist.streams}</span>
                      <span className="art-stat-lbl">Streams</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }} onClick={e => e.stopPropagation()}>
                    <button className={`art-btn-follow art-btn-${artist.realm}`}>Follow</button>
                    <button className="art-btn-msg">✉</button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Count */}
        {filtered.length > 0 && (
          <div className="art-cinzel" style={{ textAlign: 'center', marginTop: '40px', fontSize: '9px', letterSpacing: '3px', color: '#2a2a2a' }}>
            {filtered.length} Artist{filtered.length !== 1 ? 's' : ''} across the realms
          </div>
        )}
      </section>
    </main>
  )
}
