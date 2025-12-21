/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Figma Design Tokens
        inferno: {
          bg: '#0B0B0B',
          paper: '#F8F8F8',
          muted: '#6B6B6B',
          border: 'rgba(255,255,255,0.06)',
          black: '#000000',
          white: '#FFFFFF',
          ash: '#333333',
          charcoal: '#1A1A1A',
          smoke: '#666666',
        },
        purgatorio: {
          top: '#111111',
          bottom: '#EDEDED',
          text: '#111',
          dark: '#2e2e2e',
          medium: '#808080',
          light: '#e0e0e0',
          mist: '#C7C7C7',
          fog: '#B8B8B8',
        },
        paradiso: {
          bg: '#FFFFFF',
          ink: '#0B0B0B',
          halo: 'rgba(255,255,255,0.12)',
          white: '#FFFFFF',
          silver: '#C0C0C0',
          platinum: '#E5E5E5',
          pearl: '#F5F5F5',
          crystal: '#EFEFEF',
          gold: '#FFD700',
        },
        // Legacy support
        infernoDark: '#000000',
        purgatorioGray: '#C7C7C7',
        paradisoWhite: '#FFFFFF',
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
        display: ['Cinzel', 'Georgia', 'serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '54px' }],
        'h2': ['32px', { lineHeight: '40px' }],
        'h3': ['20px', { lineHeight: '28px' }],
        'body': ['16px', { lineHeight: '24px' }],
        'ui-small': ['13px', { lineHeight: '18px' }],
      },
      spacing: {
        'gutter': '24px',
        'margin-outer': '24px',
      },
      boxShadow: {
        inferno: '0 12px 40px rgba(0,0,0,0.8)',
      },
      animation: {
        'flicker': 'flicker 3s ease-in-out infinite',
        'vibrate': 'vibrate 0.3s linear infinite',
        'ascend': 'ascend 20s linear infinite',
        'orbit': 'orbit 30s linear infinite',
        'radiate': 'radiate 4s ease-in-out infinite',
        'reveal': 'reveal 0.5s ease-in-out',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        vibrate: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-1px, 1px)' },
          '50%': { transform: 'translate(1px, -1px)' },
          '75%': { transform: 'translate(-1px, -1px)' },
        },
        ascend: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        radiate: {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
          '50%': { transform: 'scale(1.2)', opacity: 0.6 },
        },
        reveal: {
          '0%': { clipPath: 'circle(0% at 50% 0%)' },
          '100%': { clipPath: 'circle(150% at 50% 0%)' },
        },
      },
    },
  },
  plugins: [],
}
