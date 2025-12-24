import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('LicensingPricing Interactions', () => {
  it('all CTA buttons are clickable', async () => {
    const user = userEvent.setup()
    render(<LicensingPricing />)
    
    const startBrowsingBtn = screen.getByText('Start Browsing')
    const getBasicBtn = screen.getByText('Get Basic')
    const goProBtn = screen.getByText('Go Pro')
    const contactSalesBtn = screen.getByText('Contact Sales')
    
    await user.click(startBrowsingBtn)
    await user.click(getBasicBtn)
    await user.click(goProBtn)
    await user.click(contactSalesBtn)
    
    // Verify buttons are still present after clicks (no navigation in test)
    expect(startBrowsingBtn).toBeInTheDocument()
    expect(getBasicBtn).toBeInTheDocument()
    expect(goProBtn).toBeInTheDocument()
    expect(contactSalesBtn).toBeInTheDocument()
  })

  it('Pro Tier button has special styling for most popular tier', () => {
    render(<LicensingPricing />)
    const goProBtn = screen.getByText('Go Pro')
    const btnClasses = goProBtn.className
    
    // Pro tier should have gold background styling
    expect(btnClasses).toContain('bg-paradiso-gold')
  })

  it('hover effects are applied to tier cards', () => {
    render(<LicensingPricing />)
    const tierCards = document.querySelectorAll('.card-inferno')
    
    tierCards.forEach(card => {
      expect(card.className).toContain('hover:scale-105')
    })
  })

  it('Pro Tier has special ring styling', () => {
    render(<LicensingPricing />)
    const proTierHeading = screen.getByText('Pro Tier')
    const proTierCard = proTierHeading.closest('.card-inferno')
    
    if (proTierCard) {
      const cardClasses = proTierCard.className
      expect(cardClasses).toContain('ring-2')
      expect(cardClasses).toContain('ring-paradiso-gold')
    }
  })

  it('renders responsive grid layout', () => {
    render(<LicensingPricing />)
    const gridContainer = document.querySelector('.grid')
    
    expect(gridContainer).toBeInTheDocument()
    if (gridContainer) {
      expect(gridContainer.className).toContain('grid-cols-1')
      expect(gridContainer.className).toContain('md:grid-cols-2')
      expect(gridContainer.className).toContain('lg:grid-cols-4')
    }
  })
})
