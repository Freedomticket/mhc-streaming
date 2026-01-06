'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/src/lib/api'
import VerificationBadge, { VerificationStatus } from '@/components/VerificationBadge'
import UploadLimitIndicator from '@/components/UploadLimitIndicator'

interface DashboardData {
  user: {
    id: string
    username: string
    email: string
    subscriptionTier: string
    createdAt: string
  }
  stats: {
    totalVideos: number
    totalViews: number
    totalLikes: number
    followers: number
  }
  recentVideos: Array<{
    id: string
    title: string
    views: number
    createdAt: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Mock data for demonstration - backend will provide these
  const [verificationStatus] = useState<VerificationStatus>('unverified')
  const [uploadsThisWeek] = useState(1)
  const [uploadLimit] = useState(3)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      // Try to get user data from localStorage first
      const cachedUser = localStorage.getItem('user')
      if (cachedUser) {
        const user = JSON.parse(cachedUser)
        setIsAdmin(user.role === 'ADMIN')
        const dashboardData: DashboardData = {
          user: {
            id: user.id || '1',
            username: user.username || user.email?.split('@')[0] || 'User',
            email: user.email || 'user@example.com',
            subscriptionTier: user.subscription?.tier || user.subscriptionTier || 'FREE',
            createdAt: user.createdAt || new Date().toISOString()
          },
          stats: {
            totalVideos: 0,
            totalViews: 0,
            totalLikes: 0,
            followers: 0
          },
          recentVideos: []
        }
        setData(dashboardData)
        setLoading(false)
        return
      }

      // Fallback to API call
      const { data: userData } = await api.get('/api/auth/me')
      setIsAdmin(userData.data.role === 'ADMIN')
      const dashboardData: DashboardData = {
        user: {
          id: userData.data.id,
          username: userData.data.username,
          email: userData.data.email,
          subscriptionTier: userData.data.subscription?.tier || 'FREE',
          createdAt: userData.data.createdAt
        },
        stats: {
          totalVideos: 0,
          totalViews: 0,
          totalLikes: 0,
          followers: 0
        },
        recentVideos: []
      }
      setData(dashboardData)
    } catch (err: any) {
      console.error('Dashboard load error:', err)
      // Don't redirect on error - just show error state
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
        <div className="animate-pulse text-purgatorio-mist text-xl">
          Loading dashboard...
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
        <div className="card-inferno text-center">
          <p className="text-red-400 mb-4">Failed to load dashboard</p>
          <button onClick={fetchDashboard} className="btn-inferno">
            Try Again
          </button>
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
              <Link href="/settings" className="text-purgatorio-mist hover:text-white">
                Settings
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-yellow-500 hover:text-yellow-400 font-semibold">
                  Admin
                </Link>
              )}
              <Link href="/logout" className="text-red-600 hover:text-red-500">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2">
                Dashboard
              </h1>
              <p className="text-purgatorio-mist">
                Welcome back, @{data.user.username}
              </p>
            </div>
            <VerificationBadge status={verificationStatus} />
          </div>
        </div>

        {/* Subscription & Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Subscription Badge */}
          <div className="card-inferno">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {data.user.subscriptionTier === 'PARADISO' && '✨'}
                {data.user.subscriptionTier === 'PURGATORIO' && '⚪'}
                {data.user.subscriptionTier === 'INFERNO' && '🔥'}
                {data.user.subscriptionTier === 'FREE' && '⭐'}
              </span>
              <div>
                <div className="font-display font-bold text-yellow-500">
                  {data.user.subscriptionTier}
                </div>
                <Link
                  href="/settings/subscription"
                  className="text-sm text-purgatorio-mist hover:text-white"
                >
                  Manage subscription →
                </Link>
              </div>
            </div>
          </div>

          {/* Upload Limits */}
          <UploadLimitIndicator
            verificationStatus={verificationStatus}
            uploadsThisWeek={uploadsThisWeek}
            uploadLimit={uploadLimit}
            nextResetDate={new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)}
          />
        </div>

        {/* Verification CTA */}
        {verificationStatus === 'unverified' && (
          <div className="mb-8">
            <div className="card-inferno border-l-4 border-green-600">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    ✓ Verify Your Artist Profile
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Unlock higher upload limits, premium features, and build trust with your audience.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1 mb-4">
                    <li>• Increase weekly uploads from 3 to 20+</li>
                    <li>• Get verified artist badge on your profile</li>
                    <li>• Prioritized in discovery and recommendations</li>
                    <li>• Access to premium generation tools</li>
                  </ul>
                </div>
                <Link
                  href="/verify"
                  className="btn-inferno whitespace-nowrap"
                >
                  Start Verification
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-inferno">
            <div className="text-4xl mb-2">📹</div>
            <div className="text-3xl font-bold text-white mb-1">
              {data.stats.totalVideos}
            </div>
            <div className="text-sm text-gray-400">Total Videos</div>
          </div>

          <div className="card-inferno">
            <div className="text-4xl mb-2">👁</div>
            <div className="text-3xl font-bold text-white mb-1">
              {data.stats.totalViews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>

          <div className="card-inferno">
            <div className="text-4xl mb-2">👍</div>
            <div className="text-3xl font-bold text-white mb-1">
              {data.stats.totalLikes.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Likes</div>
          </div>

          <div className="card-inferno">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-bold text-white mb-1">
              {data.stats.followers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Followers</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/upload"
            className="card-inferno hover:scale-105 transition-all text-center cursor-pointer"
          >
            <div className="text-5xl mb-3">📤</div>
            <h3 className="font-display font-bold text-white mb-2">Upload Video</h3>
            <p className="text-sm text-gray-400">Share new content</p>
          </Link>

          <Link
            href="/go-live"
            className="card-inferno hover:scale-105 transition-all text-center cursor-pointer"
          >
            <div className="text-5xl mb-3">🔴</div>
            <h3 className="font-display font-bold text-white mb-2">Go Live</h3>
            <p className="text-sm text-gray-400">Start livestream</p>
          </Link>

          <Link
            href="/analytics"
            className="card-inferno hover:scale-105 transition-all text-center cursor-pointer"
          >
            <div className="text-5xl mb-3">📊</div>
            <h3 className="font-display font-bold text-white mb-2">Analytics</h3>
            <p className="text-sm text-gray-400">View insights</p>
          </Link>
        </div>

        {/* Recent Videos */}
        <div className="card-inferno">
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Recent Videos
          </h2>
          {data.recentVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-4">No videos yet</p>
              <Link href="/upload" className="btn-inferno">
                Upload Your First Video
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/${video.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-inferno-charcoal hover:bg-inferno-ash transition-all border border-inferno-border hover:border-red-600"
                >
                  <div>
                    <h3 className="font-display font-bold text-white mb-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-purgatorio-mist font-bold">
                      {video.views.toLocaleString()} views
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
