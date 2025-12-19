import './globals.css'
import type { Metadata } from 'next'
import { Inter, Cinzel } from 'next/font/google'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' })

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
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="min-h-screen bg-infernoDark text-white antialiased">
        {children}
      </body>
    </html>
  )
}
