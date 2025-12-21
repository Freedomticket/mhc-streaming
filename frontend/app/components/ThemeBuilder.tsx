'use client'

import { useState } from 'react'
import { createCustomTheme, type ThemeConfig } from '../lib/theme'

interface ThemeBuilderProps {
  onSave: (theme: ThemeConfig) => void
  initialTheme?: ThemeConfig
}

export default function ThemeBuilder({ onSave, initialTheme }: ThemeBuilderProps) {
  const [themeName, setThemeName] = useState(initialTheme?.displayName || '')
  const [description, setDescription] = useState(initialTheme?.description || '')
  const [primaryColor, setPrimaryColor] = useState(initialTheme?.colors.primary || '#FFD700')
  const [secondaryColor, setSecondaryColor] = useState(initialTheme?.colors.secondary || '#CC9900')
  const [backgroundColor, setBackgroundColor] = useState(initialTheme?.colors.background || '#000000')
  const [accentColor, setAccentColor] = useState(initialTheme?.colors.accent || '#FFFFFF')
  const [textColor, setTextColor] = useState(initialTheme?.colors.text || '#FFFFFF')
  const [borderColor, setBorderColor] = useState(initialTheme?.colors.border || '#333333')
  const [gradientFrom, setGradientFrom] = useState(initialTheme?.gradient.from || '#1a1a1a')
  const [gradientTo, setGradientTo] = useState(initialTheme?.gradient.to || '#000000')
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const customTheme = createCustomTheme(
      themeName,
      description,
      {
        primary: primaryColor,
        secondary: secondaryColor,
        background: backgroundColor,
        accent: accentColor,
        text: textColor,
        border: borderColor,
        overlay: `${primaryColor}1a`, // 10% opacity
      },
      {
        from: gradientFrom,
        to: gradientTo,
      }
    )
    onSave(customTheme)
  }

  const previewTheme = createCustomTheme(
    themeName || 'Preview',
    description,
    {
      primary: primaryColor,
      secondary: secondaryColor,
      background: backgroundColor,
      accent: accentColor,
      text: textColor,
      border: borderColor,
    },
    {
      from: gradientFrom,
      to: gradientTo,
    }
  )

  return (
    <div className="space-y-8">
      {/* Theme Builder Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-inferno">
          <h2 className="text-h2 font-display mb-6 text-paradiso-gold">Create Custom Theme</h2>

          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-purgatorio-mist">
                Theme Name
              </label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="My Custom Theme"
                className="input-inferno"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-purgatorio-mist">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A unique theme that represents my artistic vision..."
                className="textarea-inferno"
                required
              />
            </div>
          </div>

          {/* Colors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <ColorInput
              label="Primary Color"
              value={primaryColor}
              onChange={setPrimaryColor}
              description="Main brand color"
            />
            <ColorInput
              label="Secondary Color"
              value={secondaryColor}
              onChange={setSecondaryColor}
              description="Complementary color"
            />
            <ColorInput
              label="Background"
              value={backgroundColor}
              onChange={setBackgroundColor}
              description="Page background"
            />
            <ColorInput
              label="Accent Color"
              value={accentColor}
              onChange={setAccentColor}
              description="Highlights & links"
            />
            <ColorInput
              label="Text Color"
              value={textColor}
              onChange={setTextColor}
              description="Main text"
            />
            <ColorInput
              label="Border Color"
              value={borderColor}
              onChange={setBorderColor}
              description="Card borders"
            />
          </div>

          {/* Gradient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ColorInput
              label="Gradient Start"
              value={gradientFrom}
              onChange={setGradientFrom}
              description="Top gradient color"
            />
            <ColorInput
              label="Gradient End"
              value={gradientTo}
              onChange={setGradientTo}
              description="Bottom gradient color"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary-inferno"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button type="submit" className="btn-inferno">
              Save Theme
            </button>
          </div>
        </div>
      </form>

      {/* Live Preview */}
      {showPreview && (
        <div className="card-inferno">
          <h3 className="text-h3 font-display mb-6 text-paradiso-gold">Live Preview</h3>
          
          <div
            className="rounded-lg p-8 space-y-6 transition-all duration-300"
            style={{
              background: `linear-gradient(to bottom, ${previewTheme.gradient.from}, ${previewTheme.gradient.to})`,
              color: previewTheme.colors.text,
            }}
          >
            {/* Preview Header */}
            <div
              className="border-b-2 pb-4"
              style={{ borderColor: previewTheme.colors.border }}
            >
              <h1
                className="text-4xl font-display font-bold mb-2"
                style={{ color: previewTheme.colors.primary }}
              >
                {themeName || 'Your Theme Name'}
              </h1>
              <p style={{ color: previewTheme.colors.text }}>
                {description || 'Your theme description will appear here'}
              </p>
            </div>

            {/* Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="rounded-lg p-6"
                style={{
                  backgroundColor: previewTheme.colors.background,
                  border: `2px solid ${previewTheme.colors.border}`,
                }}
              >
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: previewTheme.colors.accent }}
                >
                  Card Example
                </h3>
                <p style={{ color: previewTheme.colors.text, opacity: 0.8 }}>
                  This is how your cards will look with the custom theme.
                </p>
              </div>

              <div
                className="rounded-lg p-6"
                style={{
                  backgroundColor: previewTheme.colors.background,
                  border: `2px solid ${previewTheme.colors.border}`,
                }}
              >
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: previewTheme.colors.accent }}
                >
                  Another Card
                </h3>
                <p style={{ color: previewTheme.colors.text, opacity: 0.8 }}>
                  Cards maintain consistency across your gallery.
                </p>
              </div>
            </div>

            {/* Preview Buttons */}
            <div className="flex gap-4">
              <button
                className="px-6 py-3 rounded-lg font-bold transition-all"
                style={{
                  backgroundColor: previewTheme.colors.secondary,
                  color: previewTheme.colors.text,
                }}
              >
                Primary Button
              </button>
              <button
                className="px-6 py-3 rounded-lg font-bold transition-all"
                style={{
                  backgroundColor: 'transparent',
                  color: previewTheme.colors.primary,
                  border: `2px solid ${previewTheme.colors.primary}`,
                }}
              >
                Secondary Button
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-purgatorio-mist">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-14 h-10 rounded cursor-pointer border-2 border-inferno-border"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 rounded-lg border border-inferno-border bg-black/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-paradiso-gold"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  )
}
