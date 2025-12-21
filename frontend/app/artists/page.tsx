'use client'

import Link from 'next/link'
import { useState } from 'react'

type Realm = 'all' | 'inferno' | 'purgatorio' | 'paradiso'

export default function ArtistsPage() {
  const [selectedRealm, setSelectedRealm] = useState<Realm>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const artists = [
    {
      id: 1,
      name: 'Luna Eclipse',
      title: 'Composer & Producer',
      realm: 'inferno',
      followers: '15.2K',
      streams: '2.4M',
      bio: 'Dark ambient and industrial soundscapes',
      verified: true
    },
    {
      id: 2,
      name: 'Rising Soul',
      title: 'Singer-Songwriter',
      realm: 'purgatorio',
      followers: '9.8K',
      streams: '1.1M',
      bio: 'Transformative folk and indie',
      verified: false
    },
    {
      id: 3,
      name: 'Celestial Voices',
      title: 'Vocal Ensemble',
      realm: 'paradiso',
      followers: '12.5K',
      streams: '3.2M',
      bio: 'Ethereal harmonies and sacred music',
      verified: true
    },
    {
      id: 4,
      name: 'The Void',
      title: 'Electronic Artist',
      realm: 'inferno',
      followers: '8.3K',
      streams: '850K',
      bio: 'Experimental techno and dark wave',
      verified: false
    },
    {
      id: 5,
      name: 'Green Spirit',
      title: 'Folk Musician',
      realm: 'purgatorio',
      followers: '6.7K',
      streams: '650K',
      bio: 'Nature-inspired acoustic melodies',
      verified: false
    },
    {
      id: 6,
      name: 'Color Masters',
      title: 'DJ & Producer',
      realm: 'paradiso',
      followers: '11.2K',
      streams: '2.1M',
      bio: 'Uplifting house and trance',
      verified: true
    }
  ]

  const filteredArtists = artists.filter(artist => {
    const matchesRealm = selectedRealm === 'all' || artist.realm === selectedRealm
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRealm && matchesSearch
  })

  const realmColors = {
    inferno: 'text-paradiso-gold',
    purgatorio: 'text-purgatorio-mist',
    paradiso: 'text-paradiso-gold'
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      <div className="container-responsive py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-etched text-h1 mb-4 text-shadow-inferno">
            Discover Artists
          </h1>
          <p className="text-xl text-purgatorio-mist">
            Explore creators across all three realms
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-inferno w-full"
            />
          </div>

          {/* Realm Filter */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setSelectedRealm('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                selectedRealm === 'all'
                  ? 'btn-inferno'
                  : 'btn-secondary-inferno'
              }`}
            >
              All Realms
            </button>
            <button
              onClick={() => setSelectedRealm('inferno')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                selectedRealm === 'inferno'
                  ? 'bg-paradiso-gold text-black'
                  : 'btn-secondary-inferno'
              }`}
            >
              Inferno
            </button>
            <button
              onClick={() => setSelectedRealm('purgatorio')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                selectedRealm === 'purgatorio'
                  ? 'bg-purgatorio-mist text-black'
                  : 'btn-secondary-inferno'
              }`}
            >
              Purgatorio
            </button>
            <button
              onClick={() => setSelectedRealm('paradiso')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                selectedRealm === 'paradiso'
                  ? 'bg-paradiso-gold text-black'
                  : 'btn-secondary-inferno'
              }`}
            >
              Paradiso
            </button>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid-gallery">
          {filteredArtists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artist/${artist.id}`}
              className="card-inferno hover-lift group"
            >
              {/* Avatar */}
              <div className="aspect-square-card bg-inferno-ash rounded-lg mb-4 flex items-center justify-center text-paradiso-gold group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </div>

              {/* Artist Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-display font-bold text-white group-hover:text-paradiso-gold transition-colors">
                    {artist.name}
                  </h3>
                  {artist.verified && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-paradiso-gold" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-2">{artist.title}</p>
                <span className={`inline-block text-xs px-3 py-1 rounded-full bg-black/30 ${realmColors[artist.realm as keyof typeof realmColors]}`}>
                  {artist.realm.charAt(0).toUpperCase() + artist.realm.slice(1)}
                </span>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {artist.bio}
              </p>

              {/* Stats */}
              <div className="flex gap-6 mb-4 pt-4 border-t border-inferno-border">
                <div>
                  <div className="text-lg font-bold text-white">{artist.followers}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{artist.streams}</div>
                  <div className="text-xs text-gray-500">Streams</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 bg-paradiso-gold hover:bg-paradiso-gold/80 text-black font-bold py-2 px-4 rounded transition-colors">
                  Follow
                </button>
                <button className="border border-paradiso-gold hover:bg-paradiso-gold hover:text-black text-paradiso-gold font-bold py-2 px-4 rounded transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 12h8M12 8v8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredArtists.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 mb-4">No artists found</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedRealm('all')
              }}
              className="btn-secondary-inferno"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
