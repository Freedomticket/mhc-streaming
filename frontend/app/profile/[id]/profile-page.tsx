'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Video {
  id: string
  title: string
  views: number
  likes: number
  createdAt: string
  thumbnail?: string
  duration?: string
}

interface ArtistProfile {
  id: string
  username: string
  displayName?: string
  bio?: string
  genre?: string
  location?: string
  subscriptionTier: string
  verificationStatus: 'unverified' | 'pending' | 'verified'
  followers: number
  following: number
  totalViews: number
  totalLikes: number
  videos: Video[]
  createdAt: string
  avatarUrl?: string
  bannerUrl?: string
  socialLinks?: {
    instagram?: string
    twitter?: string
    website?: string
  }
}

const MOCK_PROFILE: ArtistProfile = {
  id: '1',
  username: 'artistname',
  displayName: 'Artist Name',
  bio: 'Independent artist creating from the soul. Human-sparked, AI-assisted.',
  genre: 'Hip-Hop / R&B',
  location: 'Los Angeles, CA',
  subscriptionTier: 'PRO',
  verificationStatus: 'verified',
  followers: 0,
  following: 0,
  totalViews: 0,
  totalLikes: 0,
  videos: [],
  createdAt: new Date().toISOString(),
  socialLinks: {}
}

export default function ArtistProfilePage() {
  const params = useParams()
  const username = params?.username as string
  const [profile, setProfile] = useState<ArtistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos')
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      // TODO: replace with real API call
      // const { data } = await api.get(`/api/users/${username}/profile`)
      // setProfile(data.data)
      setProfile({ ...MOCK_PROFILE, username })
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = (tier: string) => {
    if (tier === 'PARADISO') return '✨'
    if (tier === 'PURGATORIO') return '⚪'
    if (tier === 'INFERNO') return '🔥'
    return '⭐'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
        <div className="animate-pulse text-purgatorio-mist text-xl">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
        <div className="card-inferno text-center">
          <p className="text-red-400 mb-4">Artist not found</p>
          <Link href="/browse" className="btn-inferno">Browse Artists</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      {/* Nav */}
      <nav className="border-b border-inferno-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold">
              <span className="text-white">MHC</span>{' '}
              <span className="text-red-600">STREAMING</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/browse" className="text-purgatorio-mist hover:text-white">Browse</Link>
              <Link href="/upload" className="btn-inferno">Upload</Link>
              <Link href="/dashboard" className="text-purgatorio-mist hover:text-white">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-red-900 via-black to-red-900 overflow-hidden">
        {profile.bannerUrl && (
          <img src={profile.bannerUrl} alt="banner" className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Avatar */}
            <div className="flex items-end gap-4">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-black bg-gradient-to-br from-red-900 to-black flex items-center justify-center text-4xl font-bold text-white overflow-hidden flex-shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  profile.username[0].toUpperCase()
                )}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                    {profile.displayName || profile.username}
                  </h1>
                  {profile.verificationStatus === 'verified' && (
                    <span className="text-green-400 text-lg" title="Verified Artist">✓</span>
                  )}
                  <span className="text-lg" title={profile.subscriptionTier}>
                    {getTierIcon(profile.subscriptionTier)}
                  </span>
                </div>
                <p className="text-purgatorio-mist">@{profile.username}</p>
                {profile.genre && (
                  <p className="text-sm text-gray-500 mt-1">{profile.genre}</p>
                )}
              </div>
            </div>

            {/* Follow Button */}
            <div className="flex items-center gap-3 pb-2">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-2 rounded font-display font-bold transition-all ${
                  isFollowing
                    ? 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                    : 'btn-inferno'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <Link
                href={`/messages/${profile.username}`}
                className="px-6 py-2 rounded font-display font-bold border border-inferno-border text-purgatorio-mist hover:text-white hover:border-white transition-all"
              >
                Message
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{profile.videos.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{profile.followers.toLocaleString()}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{profile.totalViews.toLocaleString()}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{profile.totalLikes.toLocaleString()}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Likes</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-inferno-border mb-8">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 font-display font-bold text-sm uppercase tracking-wider transition-all border-b-2 -mb-px ${
              activeTab === 'videos'
                ? 'border-red-600 text-white'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-3 font-display font-bold text-sm uppercase tracking-wider transition-all border-b-2 -mb-px ${
              activeTab === 'about'
                ? 'border-red-600 text-white'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            About
          </button>
        </div>

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="pb-16">
            {profile.videos.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-5xl mb-4">🎵</div>
                <p className="text-xl mb-2">No videos yet</p>
                <p className="text-sm">Check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profile.videos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/watch/${video.id}`}
                    className="group block rounded-lg overflow-hidden border border-inferno-border hover:border-red-600 transition-all"
                  >
                    <div className="aspect-video bg-gradient-to-br from-red-900 to-black flex items-center justify-center text-3xl">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      ) : '▶'}
                    </div>
                    <div className="p-3 bg-inferno-charcoal">
                      <h3 className="font-display font-bold text-white text-sm mb-1 line-clamp-2">{video.title}</h3>
                      <p className="text-xs text-gray-500">{video.views.toLocaleString()} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="pb-16 max-w-2xl">
            {profile.bio && (
              <div className="mb-8">
                <h2 className="text-sm font-display uppercase tracking-wider text-gray-500 mb-3">Bio</h2>
                <p className="text-purgatorio-mist leading-relaxed">{profile.bio}</p>
              </div>
            )}
            {profile.location && (
              <div className="mb-6">
                <h2 className="text-sm font-display uppercase tracking-wider text-gray-500 mb-2">Location</h2>
                <p className="text-white">📍 {profile.location}</p>
              </div>
            )}
            {profile.genre && (
              <div className="mb-6">
                <h2 className="text-sm font-display uppercase tracking-wider text-gray-500 mb-2">Genre</h2>
                <p className="text-white">🎵 {profile.genre}</p>
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-sm font-display uppercase tracking-wider text-gray-500 mb-2">Member Since</h2>
              <p className="text-white">📅 {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            </div>
            {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
              <div className="mb-6">
                <h2 className="text-sm font-display uppercase tracking-wider text-gray-500 mb-3">Links</h2>
                <div className="flex gap-4 flex-wrap">
                  {profile.socialLinks.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-purgatorio-mist hover:text-white transition-colors">Instagram</a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-purgatorio-mist hover:text-white transition-colors">Twitter / X</a>
                  )}
                  {profile.socialLinks.website && (
                    <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-purgatorio-mist hover:text-white transition-colors">Website</a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
