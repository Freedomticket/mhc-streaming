import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-purgatorio-mist mb-8">
          The page you're looking for doesn't exist in this realm.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
