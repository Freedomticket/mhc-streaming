'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

type Realm = 'INFERNO' | 'PURGATORIO' | 'PARADISO'

export default function HomePage() {
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(null)
  const [showQuote, setShowQuote] = useState(true)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    // Fade out quote and fade in video after delay
    const quoteTimer = setTimeout(() => setShowQuote(false), 10000)
    const videoTimer = setTimeout(() => setShowVideo(true), 2000)
    return () => {
      clearTimeout(quoteTimer)
      clearTimeout(videoTimer)
    }
  }, [])

  const realms = [
    {
      name: 'INFERNO' as Realm,
      title: 'Inferno',
      description: 'Realm of passion and raw creation',
      color: 'text-paradiso-gold',
      bgGradient: 'from-gray-900 to-black',
      borderColor: 'border-inferno-gray',
    },
    {
      name: 'PURGATORIO' as Realm,
      title: 'Purgatorio',
      description: 'Realm of transformation and growth',
      color: 'text-purgatorio-mist',
      bgGradient: 'from-purgatorio-dark to-black',
      borderColor: 'border-purgatorio-medium',
    },
    {
      name: 'PARADISO' as Realm,
      title: 'Paradiso',
      description: 'Realm of divine light and harmony',
      color: 'text-paradiso-gold',
      bgGradient: 'from-paradiso-bg to-black',
      borderColor: 'border-paradiso-gold',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-[600px] bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center text-center px-4 py-24 border-b-2 border-inferno-border"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.75) 100%), url('/images/new-hero-img1.png')`,
          backgroundPosition: 'center 30%'
        }}
      >
        {/* Dante Quote - Fades out */}
        {showQuote && (
          <div 
            className="text-4xl md:text-5xl font-bold italic text-white mb-8 max-w-4xl transition-opacity duration-[2000ms]"
            style={{
              textShadow: '4px 4px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 255, 255, 0.2)',
              letterSpacing: '1px',
              opacity: showQuote ? 1 : 0
            }}
          >
            &quot;For God so loved the world...&quot; — John 3:16
          </div>
        )}

        {/* Video Placeholder - Fades in */}
        <div 
          className="relative w-full max-w-4xl mb-8 transition-opacity duration-[2000ms]"
          style={{
            height: '400px',
            opacity: showVideo ? 1 : 0
          }}
        >
          <video 
            className="w-full h-full rounded-lg border-2 border-inferno-border object-cover"
            autoPlay 
            muted 
            loop
            playsInline
          >
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          </video>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
          <span className="text-white">YOUR MUSIC. YOUR PLATFORM. YOUR FUTURE.</span>
        </h1>
        <p className="text-lg md:text-xl text-purgatorio-mist mb-6 max-w-3xl">
          The independent artist ecosystem where you own everything, earn everything, and never answer to gatekeepers
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn-inferno px-8 py-3 text-lg">
            Start Uploading Now
          </Link>
          <Link href="/browse" className="button-secondary border-2 border-paradiso-silver hover:bg-paradiso-silver hover:text-black text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 text-lg">
            Learn More
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
        <h1 className="text-6xl font-display font-bold mb-4">
            <span className="text-white">MOST HIGH</span>{' '}
            <span className="text-paradiso-gold">CREATION</span>
          </h1>
          <p className="text-xl text-purgatorio-mist mb-2">
            Decentralized Streaming Platform
          </p>
          <p className="text-sm text-gray-500">
            Artist-first • Zero dependencies • Dante-inspired realms
          </p>
        </div>

        {/* Realm Selection */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-display text-center mb-8 text-white">
            Choose Your Realm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {realms.map((realm) => (
              <button
                key={realm.name}
                onClick={() => setSelectedRealm(realm.name)}
                className={`
                  relative p-8 rounded-lg border-2 transition-all duration-300
                  bg-gradient-to-b ${realm.bgGradient}
                  ${realm.borderColor}
                  ${
                    selectedRealm === realm.name
                      ? 'scale-105 shadow-2xl'
                      : 'hover:scale-102 opacity-80 hover:opacity-100'
                  }
                `}
              >
                <div className="text-center">
                  <h3 className={`text-2xl font-display font-bold mb-3 ${realm.color}`}>
                    {realm.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{realm.description}</p>
                </div>
                {selectedRealm === realm.name && (
                  <div className="absolute top-2 right-2">
                    <span className="text-2xl">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="btn-inferno px-8 py-3 text-lg"
          >
            Start Creating
          </Link>
          <Link
            href="/login"
            className="border-2 border-purgatorio-mist hover:bg-purgatorio-dark text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 text-lg"
          >
            Sign In
          </Link>
          <Link
            href="/browse"
            className="text-purgatorio-mist hover:text-white transition-colors underline text-lg"
          >
            Browse Content
          </Link>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-inferno text-center">
              <div className="mb-4">
                <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18c-4.411 0-8-1.79-8-4s3.589-4 8-4 8 1.79 8 4-3.589 4-8 4z"/>
                  <path d="M9 5v7M15 9v4"/>
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold mb-2 text-paradiso-gold">
                Artist-First
              </h3>
              <p className="text-gray-400 text-sm">
                Fair royalties, content ownership, revenue transparency
              </p>
            </div>

            <div className="card-inferno text-center">
              <div className="mb-4">
                <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold mb-2 text-purgatorio-mist">
                Decentralized
              </h3>
              <p className="text-gray-400 text-sm">
                No AWS, Firebase, or Azure dependencies. Self-hosted capable.
              </p>
            </div>

            <div className="card-inferno text-center">
              <div className="mb-4">
                <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold mb-2 text-paradiso-gold">
                Real-Time
              </h3>
              <p className="text-gray-400 text-sm">
                Live streaming, instant notifications, WebSocket updates
              </p>
            </div>
          </div>
        </div>

        {/* Gate to Inferno - Fading Background */}
        <div className="relative max-w-6xl mx-auto mt-20 mb-20">
          <div 
            className="absolute inset-0 opacity-20 animate-pulse"
            style={{
              backgroundImage: "url('/images/dante's-inferno-circle-pic.png')",
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              animation: 'fadeInOut 8s ease-in-out infinite'
            }}
          />
          <style jsx>{`
            @keyframes fadeInOut {
              0%, 100% { opacity: 0.1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </div>

        {/* Featured Artists */}
        <div className="max-w-7xl mx-auto mt-20">
          <h2 className="text-3xl font-display text-center mb-4 text-paradiso-gold">
            Featured Artists
          </h2>
          <p className="text-center text-purgatorio-mist mb-8">
            Discover creators across the three realms
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Luna Eclipse',
                title: 'Composer & Producer',
                realm: 'Inferno',
                followers: '15.2K',
                streams: '2.4M',
                realmColor: 'text-paradiso-gold',
                avatar: 'circle'
              },
              {
                name: 'Rising Soul',
                title: 'Singer-Songwriter',
                realm: 'Purgatorio',
                followers: '9.8K',
                streams: '1.1M',
                realmColor: 'text-purgatorio-mist',
                avatar: 'lines'
              },
              {
                name: 'Celestial Voices',
                title: 'Vocal Ensemble',
                realm: 'Paradiso',
                followers: '12.5K',
                streams: '3.2M',
                realmColor: 'text-paradiso-gold',
                avatar: 'stars'
              },
              {
                name: 'The Void',
                title: 'Electronic Artist',
                realm: 'Inferno',
                followers: '8.3K',
                streams: '850K',
                realmColor: 'text-paradiso-gold',
                avatar: 'lightning'
              },
              {
                name: 'Green Spirit',
                title: 'Folk Musician',
                realm: 'Purgatorio',
                followers: '6.7K',
                streams: '650K',
                realmColor: 'text-purgatorio-mist',
                avatar: 'plant'
              },
              {
                name: 'Color Masters',
                title: 'DJ & Producer',
                realm: 'Paradiso',
                followers: '11.2K',
                streams: '2.1M',
                realmColor: 'text-paradiso-gold',
                avatar: 'waves'
              }
            ].map((artist) => (
              <div 
                key={artist.name}
                className="card-inferno cursor-pointer hover:scale-105 transition-all duration-300 hover:border-paradiso-gold"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-inferno-charcoal border-2 border-inferno-border flex items-center justify-center text-paradiso-gold">
                    {artist.avatar === 'circle' && (
                      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="8" />
                      </svg>
                    )}
                    {artist.avatar === 'stars' && (
                      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
                        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                      </svg>
                    )}
                    {artist.avatar === 'lightning' && (
                      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
                        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
                      </svg>
                    )}
                    {artist.avatar === 'lines' && (
                      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="20" x2="12" y2="8" />
                        <circle cx="12" cy="16" r="3" opacity="0.6" />
                      </svg>
                    )}
                    {artist.avatar === 'plant' && (
                      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="12" y1="20" x2="12" y2="10" />
                        <path d="M12 12 Q9 10 7 8" />
                        <path d="M12 12 Q15 10 17 8" />
                      </svg>
                    )}
                    {artist.avatar === 'waves' && (
                      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12 Q6 8 10 12 Q14 16 18 12 Q20 10 22 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-white mb-1">{artist.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{artist.title}</p>
                    <span className={`text-xs px-2 py-1 rounded ${artist.realmColor} bg-black/30`}>
                      {artist.realm}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div>
                    <div className="text-lg font-bold text-white">{artist.followers}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{artist.streams}</div>
                    <div className="text-xs text-gray-500">Streams</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-paradiso-gold hover:bg-paradiso-gold/80 text-black font-bold py-2 px-4 rounded transition-colors">
                    Follow
                  </button>
                  <button className="border border-paradiso-gold hover:bg-paradiso-gold hover:text-black text-paradiso-gold font-bold py-2 px-4 rounded transition-colors">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/browse"
              className="text-paradiso-gold hover:text-white transition-colors underline text-lg"
            >
              Discover More Artists →
            </Link>
          </div>
        </div>

        {/* Subscription Tiers */}
        <div className="max-w-6xl mx-auto mt-20">
          <h2 className="text-3xl font-display text-center mb-8 text-white">
            Subscription Tiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-inferno hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-display font-bold mb-2 text-gray-400">
                FREE
              </h3>
              <div className="text-3xl font-bold mb-4 text-white">$0</div>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  Basic access
                </li>
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  SD quality
                </li>
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  Limited uploads
                </li>
              </ul>
            </div>

            <div className="card-inferno hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-display font-bold mb-2 text-paradiso-gold">
                INFERNO
              </h3>
              <div className="text-3xl font-bold mb-4 text-white">$9.99</div>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  HD streaming
                </li>
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  50 uploads/month
                </li>
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  Ad-free
                </li>
              </ul>
            </div>

            <div className="card-inferno hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-display font-bold mb-2 text-purgatorio-mist">
                PURGATORIO
              </h3>
              <div className="text-3xl font-bold mb-4 text-white">$19.99</div>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  4K streaming
                </li>
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  Unlimited uploads
                </li>
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  Analytics
                </li>
              </ul>
            </div>

            <div className="card-inferno hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-display font-bold mb-2 text-paradiso-gold">
                PARADISO
              </h3>
              <div className="text-3xl font-bold mb-4 text-white">$49.99</div>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  8K streaming
                </li>
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  Priority support
                </li>
                <li className="text-gray-400 text-sm flex items-center">
                  <span className="text-paradiso-gold mr-2">✓</span>
                  Full suite
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-inferno-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Most High Creation Streaming. All rights reserved.</p>
          <p className="mt-2">Artist-first • Decentralized • Dante-inspired</p>
        </div>
      </footer>
    </main>
  )
}
