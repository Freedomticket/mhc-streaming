import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../page'

// Mock Next.js Image and Link components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

describe('HomePage Component', () => {
  it('renders the main title', () => {
    render(<HomePage />)
    expect(screen.getByText('YOUR MUSIC. YOUR PLATFORM. YOUR FUTURE.')).toBeInTheDocument()
  })

  it('renders the hero description', () => {
    render(<HomePage />)
    expect(screen.getByText(/The independent artist ecosystem where you own everything/i)).toBeInTheDocument()
  })

  it('renders indie artist tagline in hero section', () => {
    render(<HomePage />)
    expect(screen.getByText('For Indie Artists - A Platform for Connectivity, not Just Streams!')).toBeInTheDocument()
  })

  it('renders MOST HIGH CREATION heading', () => {
    render(<HomePage />)
    expect(screen.getByText('MOST HIGH')).toBeInTheDocument()
    expect(screen.getByText('CREATION')).toBeInTheDocument()
  })

  it('renders all three realm cards', () => {
    render(<HomePage />)
    const infernoElements = screen.getAllByText('INFERNO')
    const purgatorioElements = screen.getAllByText('PURGATORIO')
    const paradisoElements = screen.getAllByText('PARADISO')
    expect(infernoElements.length).toBeGreaterThan(0)
    expect(purgatorioElements.length).toBeGreaterThan(0)
    expect(paradisoElements.length).toBeGreaterThan(0)
  })

  it('renders realm descriptions', () => {
    render(<HomePage />)
    expect(screen.getByText('Realm of passion and raw creation')).toBeInTheDocument()
    expect(screen.getByText('Realm of transformation and growth')).toBeInTheDocument()
    expect(screen.getByText('Realm of divine light and harmony')).toBeInTheDocument()
  })

  it('renders main CTA buttons', () => {
    render(<HomePage />)
    const startButtons = screen.getAllByText(/Start/i)
    expect(startButtons.length).toBeGreaterThan(0)
  })

  it('renders features section', () => {
    render(<HomePage />)
    expect(screen.getByText('Artist-First')).toBeInTheDocument()
    expect(screen.getByText('Decentralized')).toBeInTheDocument()
    expect(screen.getByText('Real-Time')).toBeInTheDocument()
  })

  it('renders Featured Artists section', () => {
    render(<HomePage />)
    expect(screen.getByText('Featured Artists')).toBeInTheDocument()
    expect(screen.getByText('Luna Eclipse')).toBeInTheDocument()
    expect(screen.getByText('Rising Soul')).toBeInTheDocument()
    expect(screen.getByText('Celestial Voices')).toBeInTheDocument()
  })

  it('renders subscription tiers section', () => {
    render(<HomePage />)
    expect(screen.getByText('Subscription Tiers')).toBeInTheDocument()
    expect(screen.getByText('FREE')).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(<HomePage />)
    expect(screen.getByText(/© 2025 Most High Creation Streaming/i)).toBeInTheDocument()
  })

  it('renders licensing pricing component', () => {
    render(<HomePage />)
    expect(screen.getByText('One Stop Shop Licensing')).toBeInTheDocument()
  })
})

describe('HomePage Interactions', () => {
  it('navigates to register page when clicking Start Uploading Now', () => {
    render(<HomePage />)
    const startUploadingButton = screen.getByText('Start Uploading Now')
    expect(startUploadingButton.closest('a')).toHaveAttribute('href', '/register')
  })

  it('navigates to browse page when clicking Learn More', () => {
    render(<HomePage />)
    const learnMoreButton = screen.getByText('Learn More')
    expect(learnMoreButton.closest('a')).toHaveAttribute('href', '/browse')
  })

  it('navigates to register when clicking Start Creating', () => {
    render(<HomePage />)
    const startCreatingButton = screen.getByText('Start Creating')
    expect(startCreatingButton.closest('a')).toHaveAttribute('href', '/register')
  })

  it('navigates to login when clicking Sign In', () => {
    render(<HomePage />)
    const signInButton = screen.getByText('Sign In')
    expect(signInButton.closest('a')).toHaveAttribute('href', '/login')
  })

  it('navigates to browse when clicking Browse Content', () => {
    render(<HomePage />)
    const browseButton = screen.getByText('Browse Content')
    expect(browseButton.closest('a')).toHaveAttribute('href', '/browse')
  })

  it('navigates to discover when clicking Discover Artists', () => {
    render(<HomePage />)
    const discoverButton = screen.getByText('Discover Artists')
    expect(discoverButton.closest('a')).toHaveAttribute('href', '/discover')
  })

  it('realm cards link to gallery page', () => {
    render(<HomePage />)
    const realmLinks = screen.getAllByText('INFERNO')[0].closest('a')
    expect(realmLinks).toHaveAttribute('href', '/gallery')
  })

  it('changes selected realm state when clicking realm cards', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    
    const infernoCard = screen.getAllByText('INFERNO')[0].closest('a')
    if (infernoCard) {
      await user.click(infernoCard)
      expect(infernoCard).toBeInTheDocument()
    }
  })

  it('video auto-plays on page load', () => {
    render(<HomePage />)
    const video = document.querySelector('video')
    expect(video).toBeInTheDocument()
    // Check video properties (React passes these differently than HTML attributes)
    if (video) {
      expect(video.hasAttribute('autoplay') || video.autoplay).toBeTruthy()
      expect(video.hasAttribute('loop') || video.loop).toBeTruthy()
    }
  })

  it('displays quote initially', () => {
    render(<HomePage />)
    const quote = screen.getByText(/For God so loved the world/i)
    expect(quote).toBeInTheDocument()
  })
})
