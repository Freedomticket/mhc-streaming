'use client'

import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'

type Realm = 'all' | 'inferno' | 'purgatorio' | 'paradiso'

const galleryItems = [
  { id: 1, title: 'Descent I', realm: 'inferno', artist: 'Luna Eclipse', image: '/images/img1.png', description: 'A journey into the first circle' },
  { id: 2, title: 'Ascent II', realm: 'purgatorio', artist: 'Rising Soul', image: '/images/img10.png', description: 'The mountain of purification' },
  { id: 3, title: 'Sphere III', realm: 'paradiso', artist: 'Celestial Voices', image: '/images/img17.png', description: 'Radiant spheres of heaven' },
  { id: 4, title: 'The Dark Wood', realm: 'inferno', artist: 'The Void', image: '/images/img1.png', description: 'Lost in the dark forest' },
  { id: 5, title: 'Purgation', realm: 'purgatorio', artist: 'Green Spirit', image: '/images/img10.png', description: 'Cleansing through fire' },
  { id: 6, title: 'The Empyrean', realm: 'paradiso', artist: 'Color Masters', image: '/images/img17.png', description: 'The highest heaven' },
]

export default function GalleryPage() {
  const [selectedRealm, setSelectedRealm] = useState<Realm>('all')
  const [selected, setSelected] = useState<typeof galleryItems[0] | null>(null)

  const filtered = galleryItems.filter(
    item => selectedRealm === 'all' || item.realm === selectedRealm
  )

  const realmBadgeStyle = (realm: string) => {
    if (realm === 'inferno') return { color: '#c0392b', border: '1px solid #c0392b44' }
    if (realm === 'purgatorio') return { color: '#888', border: '1px solid #8884' }
    return { color: '#c9a84c', border: '1px solid #c9a84c44' }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#e8e0d0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .gallery-cinzel { font-family: 'Cinzel', serif; }
        .gallery-card { background: #0a0a0a; border: 1px solid #1a1a1a; transition: all .3s; cursor: pointer; }
        .gallery-card:hover { border-color: #333; transform: translateY(-2px); }
        .gallery-realm-btn { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 8px 20px; border: 1px solid #1e1e1e; background: transparent; color: #444; cursor: pointer; transition: all .2s; }
        .gallery-realm-btn.active-inferno { border-color: #c0392b; color: #c0392b; }
        .gallery-realm-btn.active-purgatorio { border-color: #888; color: #888; }
        .gallery-realm-btn.active-paradiso { border-color: #c9a84c; color: #c9a84c; }
        .gallery-realm-btn.active-all { border-color: #555; color: #e8e0d0; }
        .gallery-realm-btn:hover { border-color: #555; color: #e8e0d0; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .modal-inner { background: #0a0a0a; border: 1px solid #1e1e1e; max-width: 900px; width: 100%; display: grid; grid-template-columns: 1fr 1fr; }
        @media (max-width: 600px) { .modal-inner { grid-template-columns: 1fr; } }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '80px 32px 40px', textAlign: 'center', borderBottom: '1px solid #0f0f0f' }}>
        <div className="gallery-cinzel" style={{ fontSize: '9px', letterSpacing: '5px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px' }}>
          The Three Realms
        </div>
        <h1 className="gallery-cinzel" style={{ fontSize: 'clamp(24px,4vw,40px)', color: '#fff', letterSpacing: '3px', marginBottom: '8px' }}>
          GALLERY
        </h1>
        <div style={{ width: '48px', height: '1px', background: 'linear-gradient(to right,transparent,#c9a84c,transparent)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '13px', color: '#3a3a3a', letterSpacing: '2px' }}>
          Artwork inspired by Inferno · Purgatorio · Paradiso
        </p>
      </section>

      {/* Realm filter */}
      <section style={{ padding: '32px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid #0f0f0f' }}>
        {(['all', 'inferno', 'purgatorio', 'paradiso'] as Realm[]).map(realm => (
          <button
            key={realm}
            className={`gallery-realm-btn ${selectedRealm === realm ? `active-${realm}` : ''}`}
            onClick={() => setSelectedRealm(realm)}
          >
            {realm === 'all' ? 'All Realms' : realm}
          </button>
        ))}
      </section>

      {/* Grid */}
      <section style={{ padding: '48px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '2px', background: '#111' }}>
          {filtered.map(item => (
            <div key={item.id} className="gallery-card" onClick={() => setSelected(item)}>
              <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  style={{ filter: 'brightness(0.4)', transition: 'filter .4s' }}
                  sizes="300px"
                  onMouseOver={e => (e.currentTarget.style.filter = 'brightness(0.6)')}
                  onMouseOut={e => (e.currentTarget.style.filter = 'brightness(0.4)')}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px' }}>
                  <h3 className="gallery-cinzel" style={{ fontSize: '16px', color: '#fff', marginBottom: '4px', letterSpacing: '2px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#555', marginBottom: '8px' }}>{item.artist}</p>
                  <span className="gallery-cinzel" style={{ fontSize: '8px', letterSpacing: '2px', padding: '2px 8px', ...realmBadgeStyle(item.realm) }}>
                    {item.realm}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Artwork modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-inner" onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', minHeight: '400px' }}>
              <Image src={selected.image} alt={selected.title} fill className="object-cover" style={{ filter: 'grayscale(30%) contrast(120%)' }} />
            </div>
            <div style={{ padding: '32px' }}>
              <h2 className="gallery-cinzel" style={{ fontSize: '22px', color: '#fff', marginBottom: '8px', letterSpacing: '2px' }}>
                {selected.title}
              </h2>
              <p style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>by {selected.artist}</p>
              <span className="gallery-cinzel" style={{ fontSize: '8px', letterSpacing: '2px', padding: '2px 8px', marginBottom: '20px', display: 'inline-block', ...realmBadgeStyle(selected.realm) }}>
                {selected.realm}
              </span>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.8, marginTop: '16px', marginBottom: '32px' }}>{selected.description}</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link href="/register" style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 20px', background: '#c9a84c', color: '#000', textDecoration: 'none', fontWeight: 700 }}>
                  Add to Collection
                </Link>
                <button onClick={() => setSelected(null)} style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 20px', background: 'transparent', border: '1px solid #1e1e1e', color: '#444', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
