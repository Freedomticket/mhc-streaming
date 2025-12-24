import { render, screen } from '@testing-library/react'
import LicensingPricing from '../LicensingPricing'

describe('LicensingPricing Component', () => {
  it('renders the main heading', () => {
    render(<LicensingPricing />)
    expect(screen.getByText('One Stop Shop Licensing')).toBeInTheDocument()
  })

  it('renders the tagline for Film/TV', () => {
    render(<LicensingPricing />)
    expect(screen.getByText('Professional Music Licensing for Film, TV & Post Production')).toBeInTheDocument()
  })

  it('renders all 4 pricing tiers', () => {
    render(<LicensingPricing />)
    expect(screen.getByText('Free Trial')).toBeInTheDocument()
    expect(screen.getByText('Basic Tier')).toBeInTheDocument()
    expect(screen.getByText('Pro Tier')).toBeInTheDocument()
    expect(screen.getByText('Enterprise Tier')).toBeInTheDocument()
  })

  it('displays correct pricing', () => {
    render(<LicensingPricing />)
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('$99')).toBeInTheDocument()
    expect(screen.getByText('$499')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('shows Pro Tier as most popular', () => {
    render(<LicensingPricing />)
    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument()
  })

  it('renders all CTA buttons', () => {
    render(<LicensingPricing />)
    expect(screen.getByText('Start Browsing')).toBeInTheDocument()
    expect(screen.getByText('Get Basic')).toBeInTheDocument()
    expect(screen.getByText('Go Pro')).toBeInTheDocument()
    expect(screen.getByText('Contact Sales')).toBeInTheDocument()
  })

  it('displays key features for each tier', () => {
    render(<LicensingPricing />)
    expect(screen.getByText('Browse music catalog')).toBeInTheDocument()
    expect(screen.getByText('10 downloads per month')).toBeInTheDocument()
    expect(screen.getByText('Unlimited downloads')).toBeInTheDocument()
    expect(screen.getByText('TV/Film licensing')).toBeInTheDocument()
    expect(screen.getByText('Major project licensing')).toBeInTheDocument()
    expect(screen.getByText('Dedicated support')).toBeInTheDocument()
  })
})
