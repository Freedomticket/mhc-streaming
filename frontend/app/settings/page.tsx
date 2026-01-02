'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/src/lib/api'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cachedUser = localStorage.getItem('user')
    if (cachedUser) {
      setUser(JSON.parse(cachedUser))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
        <div className="animate-pulse text-purgatorio-mist text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
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
              <Link href="/dashboard" className="text-purgatorio-mist hover:text-white">
                Dashboard
              </Link>
              <Link href="/logout" className="text-red-600 hover:text-red-500">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-8">Settings</h1>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <Link
              href="/settings/profile"
              className="card-inferno hover:scale-105 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Profile</h3>
              <p className="text-sm text-purgatorio-mist">
                Update your profile information and avatar
              </p>
            </Link>

            {/* Account Settings */}
            <Link
              href="/settings/account"
              className="card-inferno hover:scale-105 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Account</h3>
              <p className="text-sm text-purgatorio-mist">
                Manage your email, password, and security
              </p>
            </Link>

            {/* Subscription Settings */}
            <Link
              href="/settings/subscription"
              className="card-inferno hover:scale-105 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Subscription</h3>
              <p className="text-sm text-purgatorio-mist">
                Manage your subscription tier and billing
              </p>
              <div className="mt-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-black">
                  {user.subscription?.tier || user.subscriptionTier || 'FREE'}
                </span>
              </div>
            </Link>

            {/* Notifications */}
            <Link
              href="/settings/notifications"
              className="card-inferno hover:scale-105 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Notifications</h3>
              <p className="text-sm text-purgatorio-mist">
                Configure your notification preferences
              </p>
            </Link>

            {/* Privacy */}
            <Link
              href="/settings/privacy"
              className="card-inferno hover:scale-105 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Privacy</h3>
              <p className="text-sm text-purgatorio-mist">
                Control your privacy and data settings
              </p>
            </Link>

            {/* Content Preferences */}
            <Link
              href="/settings/preferences"
              className="card-inferno hover:scale-105 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Preferences</h3>
              <p className="text-sm text-purgatorio-mist">
                Customize your viewing and streaming experience
              </p>
            </Link>
          </div>

          {/* Danger Zone */}
          <div className="mt-12 card-inferno border-2 border-red-600">
            <h3 className="text-xl font-display font-bold text-red-400 mb-4">Danger Zone</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Delete Account</p>
                  <p className="text-sm text-purgatorio-mist">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
