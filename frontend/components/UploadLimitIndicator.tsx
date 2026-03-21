import { VerificationStatus } from './VerificationBadge'

interface UploadLimitIndicatorProps {
  verificationStatus: VerificationStatus
  uploadsThisWeek: number
  uploadLimit: number
  nextResetDate: Date
}

export default function UploadLimitIndicator({
  verificationStatus,
  uploadsThisWeek,
  uploadLimit,
  nextResetDate,
}: UploadLimitIndicatorProps) {
  const remaining = Math.max(0, uploadLimit - uploadsThisWeek)
  const pct = Math.min(100, (uploadsThisWeek / uploadLimit) * 100)
  const barColor = pct >= 100 ? '#c0392b' : pct >= 75 ? '#c9a84c' : '#4caf50'
  const resetStr = nextResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: '9px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '4px' }}>
            Weekly Uploads
          </div>
          <div style={{ fontSize: '13px', color: '#555' }}>
            {uploadsThisWeek} of {uploadLimit} used · resets {resetStr}
          </div>
        </div>
        <div style={{ fontFamily: 'Cinzel,serif', fontSize: '18px', color: remaining === 0 ? '#c0392b' : '#e8e0d0', fontWeight: 700 }}>
          {remaining} left
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: '#111', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, transition: 'width .4s ease' }} />
      </div>

      {verificationStatus === 'unverified' && (
        <div style={{ fontSize: '11px', color: '#444', letterSpacing: '.5px' }}>
          <a href="/verify" style={{ color: '#c9a84c', textDecoration: 'none' }}>Verify your profile</a> to unlock more uploads
        </div>
      )}
      {verificationStatus === 'verified' && (
        <div style={{ fontSize: '11px', color: '#4caf50', letterSpacing: '.5px' }}>
          ✓ Verified — higher limits active
        </div>
      )}
      {verificationStatus === 'pending' && (
        <div style={{ fontSize: '11px', color: '#c9a84c', letterSpacing: '.5px' }}>
          Verification in review — limits will increase once approved
        </div>
      )}
    </div>
  )
}
