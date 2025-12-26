'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ArtistPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center px-4">
      <div className="card-inferno text-center max-w-md">
        <h1 className="text-2xl font-display font-bold text-white mb-4">
          Artist Profile
        </h1>
        <p className="text-gray-400 mb-6">Artist ID: {params.id}</p>
        <p className="text-gray-400 mb-6">This page will display full artist profile when connected to the backend API.</p>
        <div className="flex gap-4 justify-center">
          <Link href={`/artist/${params.id}/gallery`} className="btn-inferno">
            View Gallery
          </Link>
          <Link href="/artists" className="btn-secondary-inferno">
            Back to Artists
          </Link>
        </div>
      </div>
    </div>
  )
}
