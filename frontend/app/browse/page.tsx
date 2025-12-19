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
      {/* Navigation */}
      <nav className="border-b border-inferno-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold">
              <span className="text-white">MHC</span>{' '}
              <span className="text-red-600">STREAMING</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/upload" className="btn-inferno">
                Upload Video
              </Link>
              <Link href="/dashboard" className="text-purgatorio-mist hover:text-white">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
