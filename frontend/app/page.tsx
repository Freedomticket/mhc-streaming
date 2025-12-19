'use client'

import Link from 'next/link'
import { useState } from 'react'

type Realm = 'INFERNO' | 'PURGATORIO' | 'PARADISO'

export default function HomePage() {
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(null)

  const realms = [
    {
      name: 'INFERNO' as Realm,
      title: '🔥 Inferno',
      description: 'Realm of passion and raw creation',
      color: 'text-red-600',
      bgGradient: 'from-red-950 to-black',
      borderColor: 'border-red-600',
    },
    {
      name: 'PURGATORIO' as Realm,
      title: '⚪ Purgatorio',
      description: 'Realm of transformation and growth',
      color: 'text-purgatorio-mist',
      bgGradient: 'from-purgatorio-dark to-black',
      borderColor: 'border-purgatorio-medium',
    },
    {
      name: 'PARADISO' as Realm,
      title: '✨ Paradiso',
      description: 'Realm of divine light and harmony',
      color: 'text-yellow-500',
      bgGradient: 'from-yellow-950 to-black',
      borderColor: 'border-yellow-500',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-display font-bold mb-4 text-shadow-inferno">
            <span className="text-white">MOST HIGH</span>{' '}
            <span className="text-red-600">CREATION</span>
          </h1>
          <p className="text-xl text-purgatorio-mist mb-2">
            Decentralized Streaming Platform
          </p>
          <p className="text-sm text-gray-500">
            Artist-first • Zero dependencies • Dante-inspired realms
          </p>
        </div>

        {/* Realm Selection */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-display text-center mb-8 text-white">
            Choose Your Realm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {realms.map((realm) => (
              <button
                key={realm.name}
                onClick={() => setSelectedRealm(realm.name)}
                className={`
                  relative p-8 rounded-lg border-2 transition-all duration-300
                  bg-gradient-to-b ${realm.bgGradient}
                  ${realm.borderColor}
                  ${
                    selectedRealm === realm.name
                      ? 'scale-105 shadow-2xl'
                      : 'hover:scale-102 opacity-80 hover:opacity-100'
                  }
                `}
              >
                <div className="text-center">
                  <h3 className={`text-2xl font-display font-bold mb-3 ${realm.color}`}>
                    {realm.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{realm.description}</p>
                </div>
                {selectedRealm === realm.name && (
                  <div className="absolute top-2 right-2">
                    <span className="text-2xl">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="btn-inferno px-8 py-3 text-lg"
          >
            Start Creating
          </Link>
          <Link
            href="/login"
            className="border-2 border-purgatorio-mist hover:bg-purgatorio-dark text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 text-lg"
          >
            Sign In
          </Link>
          <Link
            href="/browse"
            className="text-purgatorio-mist hover:text-white transition-colors underline text-lg"
          >
            Browse Content
          </Link>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-inferno text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-display font-bold mb-2 text-red-600">
                Artist-First
              </h3>
              <p className="text-gray-400 text-sm">
                Fair royalties, content ownership, revenue transparency
              </p>
            </div>

            <div className="card-inferno text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-display font-bold mb-2 text-purgatorio-mist">
                Decentralized
              </h3>
              <p className="text-gray-400 text-sm">
                No AWS, Firebase, or Azure dependencies. Self-hosted capable.
              </p>
            </div>

            <div className="card-inferno text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-display font-bold mb-2 text-yellow-500">
                Real-Time
              </h3>
              <p className="text-gray-400 text-sm">
                Live streaming, instant notifications, WebSocket updates
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Tiers */}
        <div className="max-w-6xl mx-auto mt-20">
          <h2 className="text-3xl font-display text-center mb-8 text-white">
            Subscription Tiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: 'FREE',
                price: '$0',
                features: ['Basic access', 'SD quality', 'Limited uploads'],
                color: 'gray',
              },
              {
                name: 'INFERNO',
                price: '$9.99',
                features: ['HD streaming', '50 uploads/month', 'Ad-free'],
                color: 'red',
              },
              {
                name: 'PURGATORIO',
                price: '$19.99',
                features: ['4K streaming', 'Unlimited uploads', 'Analytics'],
                color: 'purgatorio',
              },
              {
                name: 'PARADISO',
                price: '$49.99',
                features: ['8K streaming', 'Priority support', 'Full suite'],
                color: 'yellow',
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className="card-inferno hover:scale-105 transition-all duration-300"
              >
                <h3 className={`text-xl font-display font-bold mb-2 text-${tier.color}-500`}>
                  {tier.name}
                </h3>
                <div className="text-3xl font-bold mb-4 text-white">{tier.price}</div>
                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-inferno-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Most High Creation Streaming. All rights reserved.</p>
          <p className="mt-2">Artist-first • Decentralized • Dante-inspired</p>
        </div>
      </footer>
    </main>
  )
}
