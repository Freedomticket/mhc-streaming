'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { api } from '@/src/lib/api'

interface Stream {
  id: string
  title: string
  description: string
  status: 'LIVE' | 'ENDED'
  viewerCount: number
  user: {
    username: string
  }
}

export default function LiveStreamPage({ params }: { params: { id: string } }) {
  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetchStream()
  }, [params.id])

  const fetchStream = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/streams/${params.id}`)
      setStream(data.stream)
    } catch (err: any) {
      setError('Livestream not found or unavailable')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
        <div className="animate-pulse text-purgatorio-mist text-xl">
          Loading livestream...
        </div>
      </div>
    )
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center px-4">
        <div className="card-inferno text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-display font-bold text-white mb-4">
            Livestream Not Found
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/browse" className="btn-inferno">
            Browse Content
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
              <Link href="/dashboard" className="text-purgatorio-mist hover:text-white">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Live Badge */}
          {stream.status === 'LIVE' && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse">
                🔴 LIVE
              </span>
            </div>
          )}

          {/* Video Player */}
          <div className="mb-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              {stream.status === 'LIVE' ? (
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  className="w-full h-full"
                >
                  {/* HLS stream would go here */}
                  <p className="text-center text-white p-8">
                    Live stream player (HLS/WebRTC integration required)
                  </p>
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center p-8">
                  <div>
                    <div className="text-6xl mb-4">📡</div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2">
                      Stream Ended
                    </h3>
                    <p className="text-gray-400">
                      This livestream has concluded
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stream Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 card-inferno">
              <h1 className="text-3xl font-display font-bold text-white mb-4">
                {stream.title}
              </h1>
              
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-inferno-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                    {stream.user.username[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-white">
                    @{stream.user.username}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <span>👁</span>
                  <span>{stream.viewerCount.toLocaleString()} watching</span>
                </div>
              </div>

              {stream.description && (
                <div>
                  <h3 className="font-display font-bold text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {stream.description}
                  </p>
                </div>
              )}
            </div>

            {/* Live Chat */}
            <div className="card-inferno">
              <h3 className="font-display font-bold text-white mb-4">
                Live Chat
              </h3>
              <div className="h-96 overflow-y-auto bg-inferno-charcoal rounded-lg p-4 mb-4">
                <div className="text-center text-gray-400 py-8">
                  <p>Chat coming soon!</p>
                  <p className="text-sm mt-2">(WebSocket integration required)</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Send a message..."
                className="input-inferno"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
