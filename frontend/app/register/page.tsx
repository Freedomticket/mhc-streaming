'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/src/lib/api'

type SubscriptionTier = 'FREE' | 'INFERNO' | 'PURGATORIO' | 'PARADISO'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [tier, setTier] = useState<SubscriptionTier>('FREE')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }

    setLoading(true)

    try {
      const { data } = await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        subscriptionTier: tier,
      })

      // Save tokens
      api.saveTokens(data.accessToken, data.refreshToken)
      
      // Save user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tiers = [
    { name: 'FREE' as SubscriptionTier, price: 'Free', color: 'gray' },
    { name: 'INFERNO' as SubscriptionTier, price: '$9.99/mo', color: 'red' },
    { name: 'PURGATORIO' as SubscriptionTier, price: '$19.99/mo', color: 'purgatorio' },
    { name: 'PARADISO' as SubscriptionTier, price: '$49.99/mo', color: 'yellow' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-white">MOST HIGH</span>{' '}
            <span className="text-red-600">CREATION</span>
          </h1>
          <p className="text-purgatorio-mist">Create your account</p>
        </div>

        <div className="card-inferno">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="input-inferno"
                placeholder="johndoe"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-inferno"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-inferno"
                placeholder="Min. 12 characters with special character"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 12 characters with a special character
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-inferno"
                placeholder="Re-enter password"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose Your Tier
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tiers.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setTier(t.name)}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${
                        tier === t.name
                          ? 'border-red-600 bg-red-900/30'
                          : 'border-inferno-border hover:border-red-600/50'
                      }
                    `}
                    disabled={loading}
                  >
                    <div className="font-display font-bold text-lg">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.price}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can upgrade or downgrade anytime
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-inferno disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-red-600 hover:text-red-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-purgatorio-mist hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
