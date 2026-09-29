'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'

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

export default function PublicProfilePage() {
  const params = useParams()
  const username = params?.username as string
  const [profile, setProfile] = useState<ArtistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (username) fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/api/users/${username}/profile`)
      setProfile(data.data || data)
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNotFound(true)
      } else {
        // Fallback mock so page isn't blank during dev
        setProfile({
          id: '1',
          username,
          displayName: username,
          bio: '',
          genre: '',
          location: '',
          subscriptionTier: 'INFERNO',
          verificationStatus: 'unverified',
          followers: 0,
          following: 0,
          totalViews: 0,
          totalLikes: 0,
          videos: [],
          createdAt: new Date().toISOString(),
          socialLinks: {}
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await api.delete(`/api/users/${username}/follow`)
      } else {
        await api.post(`/api/users/${username}/follow`)
      }
      setIsFollowing(!isFollowing)
      if (profile) {
        setProfile({
          ...profile,
          followers: isFollowing ? profile.followers - 1 : profile.followers + 1
        })
      }
    } catch {
      // Toggle optimistically anyway in dev
      setIsFollowing(!isFollowing)
    } finally {
      setFollowLoading(false)
    }
  }

  const getTierBadge = (tier: string) => {
    if (tier === 'PARADISO') return { icon: '✨', label: 'Paradiso', color: 'text-paradiso-gold' }
    if (tier === 'PURGATORIO') return { icon: '⚪', label: 'Purgatorio', color: 'text-purgatorio-mist' }
    return { icon: '🔥', label: 'Inferno', color: 'text-red-500' }
  }

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purgatorio-mist">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-6">🎵</div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Artist Not Found</h1>
          <p className="text-purgatorio-mist mb-6">@{username} doesn't exist on MHC Streaming.</p>
          <Link href="/browse" className="btn-inferno">Browse Artists</Link>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const tier = getTierBadge(profile.subscriptionTier)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      {/* Banner */}
      <div className="relative h-52 md:h-72 bg-gradient-to-r from-red-950 via-black to-red-950 overflow-hidden">
        {profile.bannerUrl && (
          <img src={profile.bannerUrl} alt="banner" className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        {/* Back nav */}
        <div className="absolute top-4 left-4">
          <Link href="/browse" className="flex items-center gap-2 text-purgatorio-mist hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Browse
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="relative -mt-20 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Avatar + Name */}
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-black bg-gradient-to-br from-red-900 to-black flex items-center justify-center text-5xl font-bold text-white overflow-hidden flex-shrink-0 shadow-2xl">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  (profile.displayName || profile.username)[0].toUpperCase()
                )}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-4xl font-display font-bold text-white">
                    {profile.displayName || profile.username}
                  </h1>
                  {profile.verificationStatus === 'verified' && (
                    <span className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" title="Verified Artist">✓</span>
                  )}
                </div>
                <p className="text-purgatorio-mist">@{profile.username}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {profile.genre && (
                    <span className="text-sm text-gray-400">🎵 {profile.genre}</span>
                  )}
                  {profile.location && (
                    <span className="text-sm text-gray-400">📍 {profile.location}</span>
                  )}
                  <span className={`text-sm font-semibold ${tier.color}`}>{tier.icon} {tier.label}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pb-2">
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-6 py-2 rounded font-display font-bold transition-all disabled:opacity-50 ${
                  isFollowing
                    ? 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                    : 'btn-inferno'
                }`}
              >
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
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
        <div className="grid grid-cols-4 gap-2 md:gap-6 mb-8 py-4 border-y border-inferno-border">
          <div className="text-center">
            <div className="text-xl md:text-3xl font-bold text-white">{profile.videos.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-3xl font-bold text-white">{formatCount(profile.followers)}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-3xl font-bold text-white">{formatCount(profile.totalViews)}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Views</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-3xl font-bold text-white">{formatCount(profile.totalLikes)}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Likes</div>
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
              <div className="text-center py-20 text-gray-500">
                <div className="text-6xl mb-4">🎵</div>
                <p className="text-xl mb-2 text-white">No videos yet</p>
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
                    <div className="aspect-video bg-gradient-to-br from-red-900 to-black flex items-center justify-center text-3xl relative">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="opacity-40">▶</span>
                      )}
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                          {video.duration}
                        </span>
                      )}
                    </div>
                    <div className="p-3 bg-inferno-charcoal">
                      <h3 className="font-display font-bold text-white text-sm mb-1 line-clamp-2">{video.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatCount(video.views)} views</span>
                        <span>♥ {formatCount(video.likes)}</span>
                      </div>
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
                <h2 className="text-xs font-display uppercase tracking-widest text-gray-500 mb-3">Bio</h2>
                <p className="text-purgatorio-mist leading-relaxed text-lg">{profile.bio}</p>
              </div>
            )}
            {profile.genre && (
              <div className="mb-6">
                <h2 className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Genre</h2>
                <p className="text-white">🎵 {profile.genre}</p>
              </div>
            )}
            {profile.location && (
              <div className="mb-6">
                <h2 className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Location</h2>
                <p className="text-white">📍 {profile.location}</p>
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Member Since</h2>
              <p className="text-white">📅 {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Tier</h2>
              <p className={`font-bold ${tier.color}`}>{tier.icon} {tier.label}</p>
            </div>
            {profile.verificationStatus === 'verified' && (
              <div className="mb-6">
                <h2 className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Status</h2>
                <p className="text-green-400 font-semibold">✓ Verified Artist</p>
              </div>
            )}
            {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
              <div className="mb-6">
                <h2 className="text-xs font-display uppercase tracking-widest text-gray-500 mb-3">Links</h2>
                <div className="flex gap-4 flex-wrap">
                  {profile.socialLinks.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purgatorio-mist hover:text-white transition-colors border border-inferno-border px-4 py-2 rounded hover:border-white">
                      Instagram
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purgatorio-mist hover:text-white transition-colors border border-inferno-border px-4 py-2 rounded hover:border-white">
                      Twitter / X
                    </a>
                  )}
                  {profile.socialLinks.website && (
                    <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purgatorio-mist hover:text-white transition-colors border border-inferno-border px-4 py-2 rounded hover:border-white">
                      Website
                    </a>
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
