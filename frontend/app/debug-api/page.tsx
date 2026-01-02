'use client'

export default function DebugPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Debug</h1>
      <pre>
        {JSON.stringify({
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          all_env: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC'))
        }, null, 2)}
      </pre>
    </div>
  )
}
