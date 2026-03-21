export type VerificationStatus = 'unverified' | 'pending' | 'verified'

interface VerificationBadgeProps {
  status: VerificationStatus
}

export default function VerificationBadge({ status }: VerificationBadgeProps) {
  const config = {
    unverified: { label: 'Unverified', color: '#444', border: '#1e1e1e', bg: '#0a0a0a' },
    pending: { label: 'Pending Review', color: '#c9a84c', border: '#c9a84c44', bg: '#0a0900' },
    verified: { label: 'Verified Artist', color: '#4caf50', border: '#4caf5044', bg: '#0a0f0a' },
  }[status]

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '6px 12px', border: `1px solid ${config.border}`,
      background: config.bg,
    }}>
      {status === 'verified' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2.5">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {status === 'pending' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/>
        </svg>
      )}
      {status === 'unverified' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )}
      <span style={{
        fontFamily: 'Cinzel, serif', fontSize: '9px',
        letterSpacing: '2px', textTransform: 'uppercase', color: config.color,
      }}>
        {config.label}
      </span>
    </div>
  )
}
