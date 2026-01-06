"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/src/lib/api'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/dashboard')
        setStats(data.data)
      } catch (e: any) {
        setError(e?.response?.data?.error?.message || 'Unauthorized or admin service unreachable')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-purgatorio-mist">Loading admin…</div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      <nav className="border-b border-inferno-border">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <Link href="/dashboard" className="text-purgatorio-mist hover:text-white">← Back to Dashboard</Link>
          <div className="text-white font-display font-bold">Admin Console</div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="card-inferno text-red-400">{error}</div>
        ) : (
          <div className="card-inferno text-white">
            <h1 className="text-2xl font-display font-bold mb-4">Dashboard</h1>
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(stats, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}