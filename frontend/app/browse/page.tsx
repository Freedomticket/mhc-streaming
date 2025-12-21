'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/src/lib/api'

interface Video {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  views: number
  createdAt: string
  user: {
    username: string
  }
}

export default function BrowsePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/videos')
      setVideos(data.videos || [])
    } catch (err: any) {
      setError('Failed to load videos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase()) ||
    video.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-6">
            Browse Content
          </h1>
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-inferno max-w-2xl"
          />
        </div>

        {/* Theme Showcase */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold text-paradiso-gold mb-6">
            Explore the Three Realms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Inferno Theme Card */}
            <div className="card-inferno hover-lift group">
              <div className="realm-inferno rounded-lg p-8 mb-4 min-h-[200px] flex items-center justify-center relative overflow-hidden">
                <div className="text-center relative z-10">
                  <svg className="w-20 h-20 mb-4 mx-auto text-paradiso-gold animate-flicker" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 2 7 6 7 11C7 14 9 16 12 16C15 16 17 14 17 11C17 6 12 2 12 2Z M12 14C11 14 10 13 10 11.5C10 9.5 12 7 12 7C12 7 14 9.5 14 11.5C14 13 13 14 12 14Z M8 18C8 18 6 19 6 20.5C6 21.9 7.1 23 8.5 23C9.9 23 11 21.9 11 20.5C11 19 9 18 9 18H8Z M15 18C15 18 13 19 13 20.5C13 21.9 14.1 23 15.5 23C16.9 23 18 21.9 18 20.5C18 19 16 18 16 18H15Z"/>
                  </svg>
                  <h3 className="text-etched text-2xl font-display text-shadow-inferno">INFERNO</h3>
                </div>
              </div>
              <h4 className="text-xl font-bold text-paradiso-gold mb-2">Realm of Passion</h4>
              <p className="text-gray-400 text-sm mb-4">Dark, intense visuals with fire particle effects and ember glow animations</p>
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="badge-inferno">Dark Mode</span>
                <span className="badge-inferno">Fire Effects</span>
              </div>
            </div>

            {/* Purgatorio Theme Card */}
            <div className="card-purgatorio hover-lift group">
              <div className="realm-purgatorio rounded-lg p-8 mb-4 min-h-[200px] flex items-center justify-center relative overflow-hidden">
                <div className="text-center relative z-10">
                  <svg className="w-20 h-20 mb-4 mx-auto text-purgatorio-mist animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 15C3 15 5 17 8 17C11 17 13 15 13 15M13 15C13 15 15 17 18 17C21 17 23 15 23 15M3 8C3 8 5 10 8 10C11 10 13 8 13 8M13 8C13 8 15 10 18 10C21 10 23 8 23 8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3 className="text-ascend text-2xl font-display text-shadow-purgatorio">PURGATORIO</h3>
                </div>
              </div>
              <h4 className="text-xl font-bold text-purgatorio-mist mb-2">Realm of Growth</h4>
              <p className="text-gray-400 text-sm mb-4">Gradient transitions with rising mist particles and ethereal glow</p>
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="badge-purgatorio">Gradient</span>
                <span className="badge-purgatorio">Mist Effects</span>
              </div>
            </div>

            {/* Paradiso Theme Card */}
            <div className="card-paradiso hover-lift group">
              <div className="realm-paradiso rounded-lg p-8 mb-4 min-h-[200px] flex items-center justify-center relative overflow-hidden">
                <div className="text-center relative z-10">
                  <svg className="w-20 h-20 mb-4 mx-auto text-paradiso-gold animate-pulse-glow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z M12 7L10.5 11L7 12.5L10.5 14L12 18L13.5 14L17 12.5L13.5 11L12 7Z"/>
                  </svg>
                  <h3 className="text-divine text-2xl font-display text-shadow-paradiso">PARADISO</h3>
                </div>
              </div>
              <h4 className="text-xl font-bold text-paradiso-gold mb-2">Realm of Light</h4>
              <p className="text-gray-400 text-sm mb-4">Radiant design with divine light rays and golden glow effects</p>
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="badge-paradiso">Light Mode</span>
                <span className="badge-paradiso">Ray Effects</span>
              </div>
            </div>
          </div>

          {/* Featured Video Placeholder */}
          <div className="card-inferno mb-8">
            <h3 className="text-2xl font-display font-bold text-white mb-4">Featured Content</h3>
            <div className="aspect-video bg-inferno-charcoal rounded-lg overflow-hidden relative group">
              <video 
                className="w-full h-full object-cover"
                poster="/api/placeholder/1280/720"
                controls
                preload="none"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-xl font-bold text-white mb-2">Platform Demo Video</h4>
                  <p className="text-sm text-gray-300">Experience the power of MHC Streaming</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-purgatorio-mist text-xl">
              Loading videos...
            </div>
          </div>
        ) : error ? (
          <div className="card-inferno text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchVideos} className="btn-inferno">
              Try Again
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="card-inferno text-center py-12">
            <p className="text-gray-400 mb-4">
              {search ? 'No videos match your search' : 'No videos available yet'}
            </p>
            <Link href="/upload" className="btn-inferno">
              Upload First Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="card-inferno hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-inferno-charcoal">
                      <span className="text-6xl">🎬</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-display font-bold text-white mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>@{video.user.username}</span>
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
