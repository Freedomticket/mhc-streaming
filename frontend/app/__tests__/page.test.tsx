import { render, screen } from '@testing-library/react'
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
