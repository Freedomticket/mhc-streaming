'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeBuilder from '@/app/components/ThemeBuilder'
import { THEME_CONFIG, type ThemeConfig } from '@/app/lib/theme'

export default function ThemeCustomizationPage() {
  const [savedThemes, setSavedThemes] = useState<ThemeConfig[]>([])
  const [showBuilder, setShowBuilder] = useState(false)

  const handleSaveTheme = (theme: ThemeConfig) => {
    setSavedThemes([...savedThemes, theme])
    setShowBuilder(false)
    // TODO: Save to backend/database
    alert(`Theme "${theme.displayName}" saved successfully!`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      <div className="container-responsive py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-etched text-h1 mb-2 text-shadow-inferno">
              Theme Customization
            </h1>
            <p className="text-purgatorio-mist">
              Create custom themes for your artist profile and gallery
            </p>
          </div>
          <Link href="/dashboard" className="btn-secondary-inferno">
            Back to Dashboard
          </Link>
        </div>

        {/* Preset Themes */}
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Preset Realms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(THEME_CONFIG).map(([key, theme]) => (
              <div key={key} className="card-inferno hover-lift">
                <div
                  className="rounded-lg p-8 mb-4 min-h-[150px]"
                  style={{
                    background: `linear-gradient(to bottom, ${theme.gradient.from}, ${theme.gradient.to})`,
                    borderColor: theme.colors.border,
                  }}
                >
                  <h3
                    className="text-2xl font-display font-bold mb-2"
                    style={{ color: theme.colors.primary }}
                  >
                    {theme.displayName}
                  </h3>
                  <p className="text-sm" style={{ color: theme.colors.text, opacity: 0.8 }}>
                    {theme.description}
                  </p>
                </div>
                <button className="btn-inferno w-full">
                  Use This Theme
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Themes Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-white">
              Your Custom Themes ({savedThemes.length})
            </h2>
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="btn-inferno"
            >
              {showBuilder ? 'Cancel' : '+ Create New Theme'}
            </button>
          </div>

          {/* Theme Builder */}
          {showBuilder && (
            <div className="mb-8">
              <ThemeBuilder onSave={handleSaveTheme} />
            </div>
          )}

          {/* Saved Custom Themes */}
          {savedThemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {savedThemes.map((theme, index) => (
                <div key={index} className="card-inferno hover-lift">
                  <div
                    className="rounded-lg p-8 mb-4 min-h-[150px]"
                    style={{
                      background: `linear-gradient(to bottom, ${theme.gradient.from}, ${theme.gradient.to})`,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <h3
                      className="text-2xl font-display font-bold mb-2"
                      style={{ color: theme.colors.primary }}
                    >
                      {theme.displayName}
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.text, opacity: 0.8 }}>
                      {theme.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 btn-inferno">
                      Use Theme
                    </button>
                    <button className="flex-1 btn-secondary-inferno">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !showBuilder && (
            <div className="card-inferno text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-5a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 mb-4">
                You haven't created any custom themes yet
              </p>
              <button
                onClick={() => setShowBuilder(true)}
                className="btn-inferno"
              >
                Create Your First Theme
              </button>
            </div>
          )}
        </div>

        {/* Theme Usage Guide */}
        <div className="card-inferno">
          <h2 className="text-2xl font-display font-bold text-white mb-4">
            How to Use Custom Themes
          </h2>
          <div className="space-y-4 text-gray-400">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-paradiso-gold text-black flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Create Your Theme</h4>
                <p className="text-sm">
                  Click "Create New Theme" and customize colors, gradients, and typography to match your brand
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-paradiso-gold text-black flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Preview in Real-Time</h4>
                <p className="text-sm">
                  See how your theme looks with cards, buttons, and text before saving
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-paradiso-gold text-black flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Apply to Your Profile</h4>
                <p className="text-sm">
                  Once saved, activate your theme to update your artist gallery and profile pages
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
