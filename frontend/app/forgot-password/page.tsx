'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await new Promise(resolve => setTimeout(resolve, 500))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center px-4">
        <div className="max-w-md w-full card-inferno text-center">
          <div className="text-6xl mb-4">✉️</div>
          <h1 className="text-2xl font-display font-bold text-white mb-4">Check Your Email</h1>
          <p className="text-gray-300 mb-6">
            If an account exists with <span className="text-paradiso-gold">{email}</span>, you will receive a password reset link shortly.
          </p>
          <Link href="/login" className="btn-inferno inline-block">Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-white">MOST HIGH</span>{' '}
            <span className="text-red-600">CREATION</span>
          </h1>
          <p className="text-purgatorio-mist">Reset your password</p>
        </div>

        <div className="card-inferno">
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-gray-300 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-inferno"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" className="w-full btn-inferno">Send Reset Link</button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/login" className="block text-sm text-gray-400 hover:text-white transition-colors">
              Remember your password? Sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-purgatorio-mist hover:text-white transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
