'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-display font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Something Went Wrong</h2>
        <p className="text-purgatorio-mist mb-8">
          An error occurred while processing your request.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
