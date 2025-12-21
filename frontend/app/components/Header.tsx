'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="nav-inferno sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-display font-bold">
              <span className="text-white group-hover:text-paradiso-gold transition-colors">MHC</span>
              <span className="text-paradiso-gold">•</span>
              <span className="text-purgatorio-mist group-hover:text-white transition-colors">STREAMING</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/browse" className="link-inferno text-sm font-semibold">
              Browse
            </Link>
            <Link href="/gallery" className="link-inferno text-sm font-semibold">
              Gallery
            </Link>
            <Link href="/live" className="link-inferno text-sm font-semibold">
              Live
            </Link>
            <Link href="/artists" className="link-inferno text-sm font-semibold">
              Artists
            </Link>
            <Link href="/dashboard" className="link-inferno text-sm font-semibold">
              Dashboard
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="btn-secondary-inferno">
              Sign In
            </Link>
            <Link href="/register" className="btn-inferno">
              Start Creating
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 hover:text-paradiso-gold transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-inferno-border bg-black/95 backdrop-blur-md">
          <div className="container-responsive py-4 space-y-4">
            <Link
              href="/browse"
              className="block text-white hover:text-paradiso-gold transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              href="/gallery"
              className="block text-white hover:text-paradiso-gold transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/live"
              className="block text-white hover:text-paradiso-gold transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Live
            </Link>
            <Link
              href="/artists"
              className="block text-white hover:text-paradiso-gold transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Artists
            </Link>
            <Link
              href="/dashboard"
              className="block text-white hover:text-paradiso-gold transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <div className="pt-4 border-t border-inferno-border space-y-3">
              <Link
                href="/login"
                className="block btn-secondary-inferno text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block btn-inferno text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
