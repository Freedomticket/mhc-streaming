'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const SUBSCRIPTION_TIERS = [
  {
    tier: 'FREE',
    name: 'Free',
    icon: '⭐',
    price: 0,
    features: [
      'Basic streaming',
      '480p quality',
      'Limited storage (1GB)',
      'Standard support',
    ],
  },
  {
    tier: 'INFERNO',
    name: 'Inferno',
    icon: '🔥',
    price: 9.99,
    features: [
      'HD streaming (1080p)',
      'Extended storage (10GB)',
      'No ads',
      'Custom emotes',
      'Priority support',
    ],
  },
  {
    tier: 'PURGATORIO',
    name: 'Purgatorio',
    icon: '⚪',
    price: 19.99,
    features: [
      '4K streaming',
      'Large storage (50GB)',
      'All Inferno features',
      'Exclusive content',
      'Early access to features',
      'VIP badge',
    ],
  },
  {
    tier: 'PARADISO',
    name: 'Paradiso',
    icon: '✨',
    price: 49.99,
    features: [
      '4K streaming',
      'Unlimited storage',
      'All Purgatorio features',
      'Creator revenue share',
      'Verified badge',
      '24/7 priority support',
      'Direct creator access',
    ],
  },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentTier, setCurrentTier] = useState('FREE')

  useEffect(() => {
    const cachedUser = localStorage.getItem('user')
    if (cachedUser) {
      const userData = JSON.parse(cachedUser)
      setUser(userData)
      setCurrentTier(userData.subscription?.tier || userData.subscriptionTier || 'FREE')
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
              <Link href="/settings" className="text-purgatorio-mist hover:text-white">
                ← Back to Settings
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
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-white mb-2">Subscription Management</h1>
            <p className="text-purgatorio-mist">
              Choose the plan that's right for you
            </p>
          </div>

          {/* Current Tier Badge */}
          <div className="mb-8 card-inferno">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purgatorio-mist mb-1">Current Plan</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {SUBSCRIPTION_TIERS.find(t => t.tier === currentTier)?.icon}
                  </span>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">
                      {SUBSCRIPTION_TIERS.find(t => t.tier === currentTier)?.name}
                    </h3>
                    <p className="text-yellow-500 font-semibold">
                      ${SUBSCRIPTION_TIERS.find(t => t.tier === currentTier)?.price}/month
                    </p>
                  </div>
                </div>
              </div>
              {currentTier !== 'FREE' && (
                <button className="btn-secondary-inferno">
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          {/* Subscription Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBSCRIPTION_TIERS.map((tier) => {
              const isCurrent = tier.tier === currentTier
              const isUpgrade = 
                (currentTier === 'FREE' && tier.tier !== 'FREE') ||
                (currentTier === 'INFERNO' && ['PURGATORIO', 'PARADISO'].includes(tier.tier)) ||
                (currentTier === 'PURGATORIO' && tier.tier === 'PARADISO')

              return (
                <div
                  key={tier.tier}
                  className={`card-inferno relative ${
                    isCurrent ? 'border-2 border-yellow-500' : ''
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                        CURRENT PLAN
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">{tier.icon}</div>
                    <h3 className="text-xl font-display font-bold text-white mb-1">
                      {tier.name}
                    </h3>
                    <div className="text-3xl font-bold text-yellow-500">
                      ${tier.price}
                      <span className="text-sm text-purgatorio-mist">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-purgatorio-mist">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button className="w-full btn-secondary-inferno" disabled>
                      Current Plan
                    </button>
                  ) : isUpgrade ? (
                    <button className="w-full btn-inferno">
                      Upgrade to {tier.name}
                    </button>
                  ) : (
                    <button className="w-full btn-secondary-inferno" disabled>
                      Downgrade
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Billing Information */}
          {currentTier !== 'FREE' && (
            <div className="mt-8 card-inferno">
              <h3 className="text-xl font-display font-bold text-white mb-4">Billing Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-inferno-border">
                  <div>
                    <p className="text-white font-semibold">Next billing date</p>
                    <p className="text-sm text-purgatorio-mist">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-yellow-500 font-bold">
                    ${SUBSCRIPTION_TIERS.find(t => t.tier === currentTier)?.price}
                  </p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-2">Payment method</p>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-gray-800 rounded">💳</div>
                    <div>
                      <p className="text-white">•••• •••• •••• 4242</p>
                      <p className="text-sm text-purgatorio-mist">Expires 12/2025</p>
                    </div>
                    <button className="ml-auto text-yellow-500 hover:text-yellow-400">
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="mt-8 card-inferno">
            <h3 className="text-xl font-display font-bold text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <p className="text-white font-semibold mb-1">Can I change my plan anytime?</p>
                <p className="text-sm text-purgatorio-mist">
                  Yes! You can upgrade or downgrade your subscription at any time. Changes take effect immediately for upgrades, or at the end of your billing cycle for downgrades.
                </p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">What payment methods do you accept?</p>
                <p className="text-sm text-purgatorio-mist">
                  We accept all major credit cards, debit cards, and PayPal.
                </p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Can I cancel anytime?</p>
                <p className="text-sm text-purgatorio-mist">
                  Yes, you can cancel your subscription at any time with no cancellation fees. You'll continue to have access until the end of your billing period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
