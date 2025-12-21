import './globals.css'
import type { Metadata } from 'next'
import Header from './components/Header'

export const metadata: Metadata = {
  title: 'MHC Streaming | Most High Creation',
  description: 'Decentralized streaming platform with Dante-inspired realms',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Cinzel:wght@400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-infernoDark text-white antialiased font-inter">
        <Header />
        {children}
      </body>
    </html>
  )
}
