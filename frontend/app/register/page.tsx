'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/src/lib/api'

type Realm = 'inferno' | 'paradiso'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [realm, setRealm] = useState<Realm | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!realm) {
      setError('Please choose your realm before continuing.')
      document.getElementById('realm-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

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
      const { data } = await api.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        realm,
      })

      api.saveTokens(data.data.accessToken, data.data.refreshToken)

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }

      router.push('/dashboard')
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot reach server. Please check your connection or try again later.')
      } else if (err.response.status >= 500) {
        setError(`Server error (${err.response.status}). Please try again later.`)
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error?.message ||
          'Registration failed. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const realmConfig = {
    inferno: {
      emoji: '🔥',
      label: 'Inferno',
      desc: 'Raw intensity. High contrast, deep reds, shadow. For artists whose art burns, confronts, or refuses to be ignored.',
      activeClass: 'border-red-600 bg-red-900/20 shadow-[0_0_24px_rgba(192,57,43,0.25)]',
      inactiveClass: 'border-gray-700 hover:border-red-600/50',
      labelClass: 'text-red-500',
      btnClass: 'bg-red-700 hover:bg-red-600 text-white',
    },
    paradiso: {
      emoji: '✨',
      label: 'Paradiso',
      desc: 'Luminous and elevated. Gold light, warmth, clarity. For artists who lift, illuminate, or transcend.',
      activeClass: 'border-yellow-500 bg-yellow-900/20 shadow-[0_0_24px_rgba(201,168,76,0.22)]',
      inactiveClass: 'border-gray-700 hover:border-yellow-500/50',
      labelClass: 'text-yellow-400',
      btnClass: 'bg-yellow-600 hover:bg-yellow-500 text-black',
    },
  }

  const submitBtnClass = realm
    ? realmConfig[realm].btnClass
    : 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-60'

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-white">MOST HIGH</span>{' '}
            <span className="text-red-600">CREATION</span>
          </h1>
          <p className="text-gray-400">Create your artist account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Error */}
          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Credentials card */}
          <div className="card-inferno space-y-5">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-1">
              Your Account
            </h2>

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
                placeholder="yourname"
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
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-inferno pr-10"
                  placeholder="Min. 12 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 12 characters with a special character</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-inferno pr-10"
                  placeholder="Re-enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Realm choice — the centrepiece */}
          <div id="realm-section">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-white mb-1">Choose Your Realm</h2>
              <p className="text-sm text-gray-400">
                Your realm shapes how your art is presented on MHC.{' '}
                <span className="text-gray-500">You can change it anytime from your profile.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['inferno', 'paradiso'] as Realm[]).map((r) => {
                const cfg = realmConfig[r]
                const isSelected = realm === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRealm(r)}
                    disabled={loading}
                    className={`
                      relative text-left p-6 rounded-lg border-2 transition-all duration-200
                      ${isSelected ? cfg.activeClass : cfg.inactiveClass}
                    `}
                  >
                    {/* Check */}
                    <span
                      className={`
                        absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                        ${isSelected
                          ? r === 'inferno' ? 'bg-red-600 border-red-600 text-white' : 'bg-yellow-500 border-yellow-500 text-black'
                          : 'border-gray-600'
                        }
                      `}
                    >
                      {isSelected && '✓'}
                    </span>

                    <span className="text-3xl mb-3 block">{cfg.emoji}</span>
                    <span className={`font-display font-bold text-lg block mb-2 ${cfg.labelClass}`}>
                      {cfg.label}
                    </span>
                    <span className="text-sm text-gray-400 leading-relaxed">{cfg.desc}</span>
                  </button>
                )
              })}
            </div>

            {!realm && (
              <p className="text-center text-xs text-gray-500 mt-3">
                Choose your realm to unlock the create account button
              </p>
            )}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading || !realm}
              className={`w-full py-4 px-6 rounded-lg font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 ${submitBtnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading
                ? 'Creating account…'
                : realm
                ? `Enter as ${realmConfig[realm].label}`
                : 'Choose a realm to continue'
              }
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-red-500 hover:text-red-400 font-medium">
              Sign in
            </Link>
          </p>
          <Link href="/" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
