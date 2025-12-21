'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Artist {
  id: number
  name: string
  username: string
  videoUrl: string
  thumbnailUrl: string
  realm: 'inferno' | 'purgatorio' | 'paradiso'
  followers: string
  likes: string
  bio: string
  verified: boolean
}

const mockArtists: Artist[] = [
  {
    id: 1,
    name: 'Luna Eclipse',
    username: '@lunaeclipse',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/images/img1.png',
    realm: 'inferno',
    followers: '15.2K',
    likes: '124K',
    bio: 'Dark ambient and industrial soundscapes 🔥',
    verified: true
  },
  {
    id: 2,
    name: 'Rising Soul',
    username: '@risingsoul',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: '/images/img10.png',
    realm: 'purgatorio',
    followers: '9.8K',
    likes: '87K',
    bio: 'Transformative folk and indie ✨',
    verified: false
  },
  {
    id: 3,
    name: 'Celestial Voices',
    username: '@celestialvoices',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/images/img17.png',
    realm: 'paradiso',
    followers: '12.5K',
    likes: '156K',
    bio: 'Ethereal harmonies and sacred music 🌟',
    verified: true
  },
  {
    id: 4,
    name: 'The Void',
    username: '@thevoid',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: '/images/img7.png',
    realm: 'inferno',
    followers: '8.3K',
    likes: '65K',
    bio: 'Experimental techno and dark wave 🌑',
    verified: false
  }
]

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState<{ [key: number]: boolean }>({})
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const currentArtist = mockArtists[currentIndex]

  const realmColors = {
    inferno: 'from-red-950/40 to-black',
    purgatorio: 'from-slate-800/40 to-black',
    paradiso: 'from-amber-950/40 to-black'
  }

  const realmAccents = {
    inferno: 'text-paradiso-gold',
    purgatorio: 'text-purgatorio-mist',
    paradiso: 'text-paradiso-gold'
  }

  useEffect(() => {
    // Play current video, pause others
    Object.keys(videoRefs.current).forEach((key) => {
      const index = parseInt(key)
      const video = videoRefs.current[index]
      if (video) {
        if (index === currentIndex) {
          video.play().catch(() => {})
          setIsPlaying(prev => ({ ...prev, [index]: true }))
        } else {
          video.pause()
          setIsPlaying(prev => ({ ...prev, [index]: false }))
        }
      }
    })
  }, [currentIndex])

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'down' && currentIndex < mockArtists.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      handleScroll('down')
    } else {
      handleScroll('up')
    }
  }

  const togglePlayPause = (index: number) => {
    const video = videoRefs.current[index]
    if (video) {
      if (isPlaying[index]) {
        video.pause()
        setIsPlaying(prev => ({ ...prev, [index]: false }))
      } else {
        video.play().catch(() => {})
        setIsPlaying(prev => ({ ...prev, [index]: true }))
      }
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden"
      onWheel={handleWheel}
      ref={containerRef}
    >
      {/* Video Container */}
      <div 
        className="relative h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${currentIndex * 100}vh)` }}
      >
        {mockArtists.map((artist, index) => (
          <div
            key={artist.id}
            className="h-screen w-full relative flex items-center justify-center"
          >
            {/* Background Video */}
            <video
              ref={(el) => { videoRefs.current[index] = el }}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              playsInline
              muted
              poster={artist.thumbnailUrl}
              onClick={() => togglePlayPause(index)}
            >
              <source src={artist.videoUrl} type="video/mp4" />
            </video>

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-b ${realmColors[artist.realm]}`} />

            {/* Play/Pause Indicator */}
            {index === currentIndex && (
              <button
                onClick={() => togglePlayPause(index)}
                className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
              >
                {!isPlaying[index] && (
                  <div className="bg-black/50 rounded-full p-6 backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" className="w-16 h-16 text-white" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </button>
            )}

            {/* Right Sidebar - Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-20">
              {/* Avatar */}
              <Link href={`/artist/${artist.id}`} className="relative">
                <div className="w-14 h-14 rounded-full bg-inferno-ash border-2 border-white flex items-center justify-center overflow-hidden hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" className={`w-8 h-8 ${realmAccents[artist.realm]}`} fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-paradiso-gold rounded-full flex items-center justify-center text-black text-xs font-bold">
                  +
                </div>
              </Link>

              {/* Like */}
              <button className="flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-xs text-white font-semibold">{artist.likes}</span>
              </button>

              {/* Comment */}
              <button className="flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs text-white font-semibold">482</span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                <span className="text-xs text-white font-semibold">Share</span>
              </button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 z-20 pointer-events-none">
              <div className="max-w-md pointer-events-auto">
                {/* Username */}
                <Link href={`/artist/${artist.id}`} className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
                  <span className="text-white font-bold text-lg">{artist.username}</span>
                  {artist.verified && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-paradiso-gold" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full bg-black/50 ${realmAccents[artist.realm]}`}>
                    {artist.realm}
                  </span>
                </Link>

                {/* Bio */}
                <p className="text-white text-sm mb-3 line-clamp-2">
                  {artist.bio}
                </p>

                {/* Stats */}
                <div className="flex gap-4 text-white text-sm">
                  <span>{artist.followers} followers</span>
                  <span>•</span>
                  <span>{artist.likes} likes</span>
                </div>
              </div>
            </div>

            {/* Scroll Indicators */}
            {index === currentIndex && (
              <div className="absolute right-1/2 translate-x-1/2 z-20">
                {currentIndex > 0 && (
                  <button
                    onClick={() => handleScroll('up')}
                    className="absolute -top-20 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-8 h-8 animate-bounce" fill="currentColor">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                  </button>
                )}
                {currentIndex < mockArtists.length - 1 && (
                  <button
                    onClick={() => handleScroll('down')}
                    className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-8 h-8 animate-bounce" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-white hover:text-paradiso-gold transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-white font-display font-bold text-xl">Discover Artists</h1>
          <Link href="/browse" className="text-white hover:text-paradiso-gold transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
        {mockArtists.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white h-8' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
