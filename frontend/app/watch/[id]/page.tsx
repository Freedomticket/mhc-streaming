'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/src/lib/api'

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  views: number
  createdAt: string
  user: {
    id: string
    username: string
  }
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVideo()
  }, [params.id])

  const fetchVideo = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/videos/${params.id}`)
      setVideo(data.video)
      
      // Track view
      api.post(`/videos/${params.id}/view`).catch(() => {})
    } catch (err) {
      setError('Video not found or unavailable')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-purgatorio-mist text-xl">
            Loading video...
          </div>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center px-4">
        <div className="card-inferno text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-display font-bold text-white mb-4">
            Video Not Found
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/browse" className="btn-inferno">
            Browse Videos
          </Link>
        </div>
      </div>
    )
  }

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
              <Link href="/browse" className="text-purgatorio-mist hover:text-white">
                Browse
              </Link>
              <Link href="/upload" className="btn-inferno">
                Upload
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Video Player */}
          <div className="mb-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <video
                controls
                className="w-full h-full object-contain"
                poster={video.thumbnailUrl}
              >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Video Info */}
          <div className="card-inferno mb-6">
            <h1 className="text-3xl font-display font-bold text-white mb-4">
              {video.title}
            </h1>
            
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-inferno-border">
              <div className="flex items-center gap-4">
                <Link
                  href={`/profile/${video.user.id}`}
                  className="flex items-center gap-2 hover:text-red-600 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                    {video.user.username[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-white">
                    @{video.user.username}
                  </span>
                </Link>
              </div>
              
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>👁 {video.views.toLocaleString()} views</span>
                <span>
                  📅 {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-4">
              <button className="btn-inferno flex items-center gap-2">
                👍 Like
              </button>
              <button className="border-2 border-inferno-border hover:border-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">
                💾 Save
              </button>
              <button className="border-2 border-inferno-border hover:border-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">
                🔗 Share
              </button>
            </div>

            {/* Description */}
            {video.description && (
              <div>
                <h3 className="font-display font-bold text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}
          </div>

          {/* Comments Section (Placeholder) */}
          <div className="card-inferno">
            <h3 className="font-display font-bold text-white mb-4">
              Comments
            </h3>
            <div className="text-center text-gray-400 py-8">
              <p>Comments coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
