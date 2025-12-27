'use client'

import { useState } from 'react'
import { api } from '@/src/lib/api'
import { useRouter } from 'next/navigation'

export default function LicensingPricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const handleTierClick = async (tierName: string, priceId?: string) => {
    setError(null)
    setLoading(tierName)

    try {
      // Check if user is logged in
      if (!api.isAuthenticated()) {
        router.push('/register?redirect=/licensing')
        return
      }

      // Free trial - just redirect to browse
      if (tierName === 'Free Trial') {
        router.push('/browse')
        return
      }

      // Enterprise - redirect to contact
      if (tierName === 'Enterprise Tier') {
        window.location.href = 'mailto:sales@mhcstreaming.com?subject=Enterprise License Inquiry'
        return
      }

      // Paid tiers - create checkout session
      if (priceId) {
        const { data } = await api.post('/api/payment/checkout', {
          tier: tierName,
          priceId,
        })

        if (data.success && data.data?.checkoutUrl) {
          window.location.href = data.data.checkoutUrl
        } else {
          setError('Failed to create checkout session')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const tiers = [
    {
      name: 'Free Trial',
      price: 'Free',
      priceId: undefined,
      features: [
        'Browse music catalog',
        'Music discovery tools'
      ],
      cta: 'Start Browsing',
      popular: false,
      realmColor: 'text-gray-400'
    },
    {
      name: 'Basic Tier',
      price: '$99',
      period: '/month',
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'price_basic_99',
      features: [
        '10 downloads per month',
        'Standard licensing',
        'Personal use'
      ],
      cta: 'Get Basic',
      popular: false,
      realmColor: 'text-paradiso-gold'
    },
    {
      name: 'Pro Tier',
      price: '$499',
      period: '/month',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_499',
      features: [
        'Unlimited downloads',
        'TV/Film licensing',
        'Some exclusivity rights',
        'Commercial use'
      ],
      cta: 'Go Pro',
      popular: true,
      realmColor: 'text-purgatorio-mist'
    },
    {
      name: 'Enterprise Tier',
      price: 'Custom',
      priceId: undefined,
      features: [
        'Major project licensing',
        'All rights included',
        'Dedicated support',
        'Custom contracts'
      ],
      cta: 'Contact Sales',
      popular: false,
      realmColor: 'text-paradiso-gold'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto mt-20 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display font-bold mb-4 text-white">
          One Stop Shop Licensing
        </h2>
        <p className="text-xl text-purgatorio-mist mb-2">
          Professional Music Licensing for Film, TV & Post Production
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`
              card-inferno relative
              hover:scale-105 transition-all duration-300
              ${tier.popular ? 'ring-2 ring-paradiso-gold shadow-2xl' : ''}
            `}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-paradiso-gold text-black px-4 py-1 rounded-full text-xs font-bold">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className={`text-2xl font-display font-bold mb-2 ${tier.realmColor}`}>
                {tier.name}
              </h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                {tier.period && (
                  <span className="text-gray-400 ml-1">{tier.period}</span>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="text-gray-400 text-sm flex items-start">
                  <span className="text-paradiso-gold mr-2 mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleTierClick(tier.name, tier.priceId)}
              disabled={loading === tier.name}
              className={`
                w-full font-bold py-3 px-6 rounded-lg transition-all duration-200
                ${tier.popular 
                  ? 'bg-paradiso-gold hover:bg-paradiso-gold/80 text-black' 
                  : 'border-2 border-paradiso-gold hover:bg-paradiso-gold hover:text-black text-paradiso-gold'
                }
                ${loading === tier.name ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading === tier.name ? 'Processing...' : tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
