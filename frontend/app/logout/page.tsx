'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/src/lib/api'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear tokens and user data
    api.clearTokens()
    
    // Redirect to home after a brief moment
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold text-white mb-4">
          Signing you out...
        </h1>
        <div className="animate-pulse text-purgatorio-mist">
          You will be redirected shortly
        </div>
      </div>
    </div>
  )
}
