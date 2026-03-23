'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const ALL_ARTISTS = [
  { id: '1', name: 'Luna Eclipse', title: 'Composer & Producer', realm: 'inferno' as const, followers: '15.2K', streams: '2.4M', verified: true },
  { id: '2', name: 'Rising Soul', title: 'Singer-Songwriter', realm: 'purgatorio' as const, followers: '9.8K', streams: '1.1M', verified: false },
  { id: '3', name: 'Celestial Voices', title: 'Vocal Ensemble', realm: 'paradiso' as const, followers: '12.5K', streams: '3.2M', verified: true },
  { id: '4', name: 'The Void', title: 'Electronic Artist', realm: 'inferno' as const, followers: '8.3K', streams: '850K', verified: false },
  { id: '5', name: 'Green Spirit', title: 'Folk Musician', realm: 'purgatorio' as const, followers: '6.7K', streams: '650K', verified: false },
  { id: '6', name: 'Color Masters', title: 'DJ & Producer', realm: 'paradiso' as const, followers: '11.2K', streams: '2.1M', verified: true },
]

const realmColor = {
  inferno: '#c0392b',
  purgatorio: '#888',
  paradiso: '#c9a84c',
}

const STORAGE_KEY = 'mhc_featured_artists'

export function getFeaturedArtistIds(): string[] {
  if (typeof window === 'undefined') return ['1', '2', '3']
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : ['1', '2', '3']
  } catch { return ['1', '2', '3'] }
}

export default function AdminPage() {
  const [featured, setFeatured] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'featured' | 'artists' | 'stats'>('featured')

  useEffect(() => {
    setFeatured(getFeaturedArtistIds())
  }, [])

  const toggleFeatured = (id: string) => {
    setFeatured(prev => {
      if (prev.includes(id)) return prev.filter(f => f !== id)
      if (prev.length >= 6) return prev
      return [...prev, id]
    })
    setSaved(false)
  }

  const saveFeatured = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(featured))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const moveUp = (id: string) => {
    setFeatured(prev => {
      const idx = prev.indexOf(id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
    setSaved(false)
  }

  const moveDown = (id: string) => {
    setFeatured(prev => {
      const idx = prev.indexOf(id)
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
    setSaved(false)
  }

  const featuredArtists = featured.map(id => ALL_ARTISTS.find(a => a.id === id)).filter(Boolean) as typeof ALL_ARTISTS
  const unfeaturedArtists = ALL_ARTISTS.filter(a => !featured.includes(a.id))

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .adm-cinzel { font-family: 'Cinzel', serif; }
        .adm-tab { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; padding: 10px 20px; background: transparent; border: none; border-bottom: 1px solid #111; color: #333; cursor: pointer; transition: all .2s; }
        .adm-tab.active { color: #c9a84c; border-bottom-color: #c9a84c; }
        .adm-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: border-color .2s; }
        .adm-card:hover { border-color: #2a2a2a; }
        .adm-btn { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; padding: 7px 14px; border: none; cursor: pointer; transition: all .2s; }
        .adm-btn-gold { background: #c9a84c; color: #000; font-weight: 700; }
        .adm-btn-gold:hover { background: #d4b85c; }
        .adm-btn-ghost { background: transparent; border: 1px solid #1e1e1e; color: #444; }
        .adm-btn-ghost:hover { border-color: #444; color: #888; }
        .adm-btn-danger { background: transparent; border: 1px solid #c0392b44; color: #c0392b; }
        .adm-btn-danger:hover { border-color: #c0392b; }
        .adm-btn-add { background: transparent; border: 1px solid #c9a84c44; color: #c9a84c; }
        .adm-btn-add:hover { border-color: #c9a84c; background: #c9a84c11; }
        .adm-order-btn { background: transparent; border: 1px solid #1a1a1a; color: #333; padding: 4px 8px; cursor: pointer; font-size: 10px; transition: all .2s; }
        .adm-order-btn:hover { border-color: #444; color: #888; }
        .stat-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 24px; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #0f0f0f', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="adm-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '4px' }}>
            MHC Streaming
          </div>
          <h1 className="adm-cinzel" style={{ fontSize: '18px', color: '#fff', letterSpacing: '2px' }}>
            ADMIN PANEL
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {saved && (
            <span className="adm-cinzel" style={{ fontSize: '9px', letterSpacing: '2px', color: '#4caf50', textTransform: 'uppercase' }}>
              ✓ Saved
            </span>
          )}
          <Link href="/" className="adm-btn adm-btn-ghost" style={{ textDecoration: 'none', display: 'inline-block' }}>
            View Site
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #0f0f0f', padding: '0 32px' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {(['featured', 'artists', 'stats'] as const).map(tab => (
            <button key={tab} className={`adm-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 32px' }}>

        {/* FEATURED TAB */}
        {activeTab === 'featured' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div className="adm-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Homepage Promotion
                </div>
                <h2 className="adm-cinzel" style={{ fontSize: '18px', color: '#fff', marginBottom: '6px' }}>Featured Artists</h2>
                <p style={{ fontSize: '12px', color: '#444' }}>
                  {featured.length}/6 slots used — these artists appear on the homepage
                </p>
              </div>
              <button className="adm-btn adm-btn-gold" onClick={saveFeatured}>
                Save Changes
              </button>
            </div>

            {/* Currently featured */}
            <div className="adm-cinzel" style={{ fontSize: '9px', letterSpacing: '3px', color: '#444', textTransform: 'uppercase', marginBottom: '12px' }}>
              Currently Featured ({featured.length}/6)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#111', marginBottom: '40px' }}>
              {featuredArtists.length === 0 && (
                <div style={{ background: '#0a0a0a', padding: '32px', textAlign: 'center', fontSize: '12px', color: '#2a2a2a' }}>
                  No artists featured — add some below
                </div>
              )}
              {featuredArtists.map((artist, idx) => (
                <div key={artist.id} className="adm-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="adm-cinzel" style={{ fontSize: '11px', color: '#2a2a2a', width: '20px' }}>{idx + 1}</span>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: realmColor[artist.realm], flexShrink: 0 }} />
                    <div>
                      <div className="adm-cinzel" style={{ fontSize: '12px', color: '#e8e0d0', marginBottom: '2px' }}>{artist.name}</div>
                      <div style={{ fontSize: '11px', color: '#444' }}>{artist.title} · {artist.followers} followers</div>
                    </div>
                    {artist.verified && <span style={{ fontSize: '9px', color: '#c9a84c' }}>✓</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button className="adm-order-btn" onClick={() => moveUp(artist.id)} title="Move up">↑</button>
                    <button className="adm-order-btn" onClick={() => moveDown(artist.id)} title="Move down">↓</button>
                    <button className="adm-btn adm-btn-danger" onClick={() => toggleFeatured(artist.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Not featured */}
            {unfeaturedArtists.length > 0 && (
              <>
                <div className="adm-cinzel" style={{ fontSize: '9px', letterSpacing: '3px', color: '#444', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Available Artists
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#111' }}>
                  {unfeaturedArtists.map(artist => (
                    <div key={artist.id} className="adm-card" style={{ opacity: featured.length >= 6 ? 0.4 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: realmColor[artist.realm], flexShrink: 0 }} />
                        <div>
                          <div className="adm-cinzel" style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>{artist.name}</div>
                          <div style={{ fontSize: '11px', color: '#333' }}>{artist.title} · {artist.followers} followers</div>
                        </div>
                        {artist.verified && <span style={{ fontSize: '9px', color: '#c9a84c' }}>✓</span>}
                      </div>
                      <button
                        className="adm-btn adm-btn-add"
                        onClick={() => toggleFeatured(artist.id)}
                        disabled={featured.length >= 6}
                      >
                        {featured.length >= 6 ? 'Slots Full' : '+ Feature'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ARTISTS TAB */}
        {activeTab === 'artists' && (
          <div>
            <div className="adm-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '24px' }}>
              All Artists
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#111' }}>
              {ALL_ARTISTS.map(artist => (
                <div key={artist.id} className="adm-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: realmColor[artist.realm], flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="adm-cinzel" style={{ fontSize: '12px', color: '#e8e0d0' }}>{artist.name}</div>
                        {artist.verified && <span style={{ fontSize: '9px', color: '#c9a84c' }}>✓ Verified</span>}
                        {featured.includes(artist.id) && <span style={{ fontSize: '9px', color: '#c9a84c', border: '1px solid #c9a84c44', padding: '1px 6px', fontFamily: 'Cinzel,serif', letterSpacing: '1px' }}>Featured</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#444' }}>{artist.title} · {artist.realm} · {artist.followers} followers · {artist.streams} streams</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link href={`/artist/${artist.id}`} className="adm-btn adm-btn-ghost" style={{ textDecoration: 'none', display: 'inline-block' }}>
                      View
                    </Link>
                    <button
                      className={`adm-btn ${featured.includes(artist.id) ? 'adm-btn-danger' : 'adm-btn-add'}`}
                      onClick={() => toggleFeatured(artist.id)}
                    >
                      {featured.includes(artist.id) ? 'Unfeature' : '+ Feature'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div>
            <div className="adm-cinzel" style={{ fontSize: '9px', letterSpacing: '4px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '24px' }}>
              Platform Overview
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '2px', background: '#111', marginBottom: '32px' }}>
              {[
                { label: 'Total Artists', value: ALL_ARTISTS.length.toString() },
                { label: 'Verified', value: ALL_ARTISTS.filter(a => a.verified).length.toString() },
                { label: 'Featured', value: featured.length.toString() },
                { label: 'Inferno', value: ALL_ARTISTS.filter(a => a.realm === 'inferno').length.toString() },
                { label: 'Purgatorio', value: ALL_ARTISTS.filter(a => a.realm === 'purgatorio').length.toString() },
                { label: 'Paradiso', value: ALL_ARTISTS.filter(a => a.realm === 'paradiso').length.toString() },
              ].map(stat => (
                <div key={stat.label} className="stat-card">
                  <div className="adm-cinzel" style={{ fontSize: '28px', color: '#e8e0d0', marginBottom: '6px' }}>{stat.value}</div>
                  <div className="adm-cinzel" style={{ fontSize: '9px', letterSpacing: '2px', color: '#333', textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#2a2a2a', fontFamily: 'Cinzel,serif', letterSpacing: '1px' }}>
              Full analytics available after backend deployment.
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
