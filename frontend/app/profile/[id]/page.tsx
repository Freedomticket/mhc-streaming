'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/artist/${params.id}`)
  }, [params.id, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
      <div className="text-purgatorio-mist animate-pulse">Redirecting...</div>
    </div>
  )
}
