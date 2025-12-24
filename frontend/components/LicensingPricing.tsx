export default function LicensingPricing() {
  const tiers = [
    {
      name: 'Free Trial',
      price: 'Free',
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
              className={`
                w-full font-bold py-3 px-6 rounded-lg transition-all duration-200
                ${tier.popular 
                  ? 'bg-paradiso-gold hover:bg-paradiso-gold/80 text-black' 
                  : 'border-2 border-paradiso-gold hover:bg-paradiso-gold hover:text-black text-paradiso-gold'
                }
              `}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
