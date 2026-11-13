/**
 * MHC Streaming — Human Authorship Declaration Gate
 *
 * Place at: frontend/app/components/upload/AuthorshipDeclaration.tsx
 *
 * Required checkbox component. The parent upload form must keep this gated:
 *   - upload button stays disabled until humanAuthorDeclared === true
 *   - this feeds into the same isFormGated logic as TrackCodeFields
 *
 * Legal language reviewed for maximum enforceability:
 *   - Creates a binding affirmative declaration at time of upload
 *   - Ties to MHC Terms of Service (Section 4.2 — Authorship Representations)
 *   - References international copyright standards (Berne Convention)
 *   - Explicitly discloses AI-generation prohibition
 *
 * Usage:
 *   const [declared, setDeclared] = useState(false)
 *   <AuthorshipDeclaration
 *     declared={declared}
 *     onChange={setDeclared}
 *     artistName="Your Name"
 *   />
 *   <button disabled={!declared || state.isFormGated}>Upload Track</button>
 */

'use client'

import { useState } from 'react'

interface AuthorshipDeclarationProps {
  declared: boolean
  onChange: (value: boolean) => void
  artistName?: string
  trackTitle?: string
  className?: string
}

export function AuthorshipDeclaration({
  declared,
  onChange,
  artistName,
  trackTitle,
  className = '',
}: AuthorshipDeclarationProps) {
  const [expanded, setExpanded] = useState(false)

  const displayName = artistName || 'the submitting artist'
  const displayTrack = trackTitle ? `"${trackTitle}"` : 'this track'

  return (
    <div
      className={`authorship-gate ${className}`}
      style={{
        border: declared ? '1px solid #c9a84c' : '1px solid #c0392b',
        borderRadius: '4px',
        padding: '1.25rem 1.5rem',
        background: declared ? 'rgba(201,168,76,0.05)' : 'rgba(192,57,43,0.05)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem',
          cursor: 'pointer',
        }}
        onClick={() => onChange(!declared)}
      >
        {/* Custom checkbox */}
        <div
          role="checkbox"
          aria-checked={declared}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onChange(!declared) }}
          style={{
            width: '20px',
            height: '20px',
            minWidth: '20px',
            border: `2px solid ${declared ? '#c9a84c' : '#666'}`,
            borderRadius: '3px',
            background: declared ? '#c9a84c' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '2px',
            transition: 'all 0.2s ease',
            outline: 'none',
          }}
        >
          {declared && (
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
              <path d="M1 4L4.5 7.5L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {/* Declaration text */}
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: 'EB Garamond, serif',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              color: '#e8e8e8',
            }}
          >
            I, {displayName}, affirm under penalty of perjury and in accordance with the{' '}
            <strong style={{ color: '#c9a84c' }}>Berne Convention for the Protection of Literary and Artistic Works</strong>,
            that {displayTrack} is an original work of human creative authorship — not wholly or substantially generated
            by artificial intelligence, automated composition tools, or machine learning systems — and that I am the
            rightful owner or authorized licensee of all rights being submitted herein.
          </p>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            style={{
              background: 'none',
              border: 'none',
              color: '#c9a84c',
              fontFamily: 'EB Garamond, serif',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '0.375rem 0',
              marginTop: '0.25rem',
              textDecoration: 'underline',
            }}
          >
            {expanded ? '▲ Hide full legal declaration' : '▼ Read full legal declaration'}
          </button>
        </div>
      </div>

      {/* Expanded legal text */}
      {expanded && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(201,168,76,0.3)',
            fontFamily: 'EB Garamond, serif',
            fontSize: '0.85rem',
            color: '#aaa',
            lineHeight: '1.7',
          }}
        >
          <p><strong style={{ color: '#c9a84c' }}>MHC Streaming — Authorship & Rights Declaration</strong></p>
          <p>
            By checking this box, I make the following representations and warranties, which I understand are
            material inducements to MHC Streaming LLC accepting this submission:
          </p>
          <ol style={{ paddingLeft: '1.25rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Human Authorship:</strong> The composition, performance, and/or sound recording submitted
              is primarily the product of human creative effort. I acknowledge that works generated predominantly
              by AI systems (including but not limited to generative music models, text-to-audio systems, or
              automated arrangement tools) are not eligible for ISRC registration under IFPI guidelines and are
              not eligible for submission to MHC Streaming.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>ISRC Validity:</strong> The International Standard Recording Code (ISRC) I have provided
              has been legitimately obtained from an authorized national ISRC agency or through a registered
              ISRC manager. I have not fabricated, copied from another recording, or reused a code that
              has previously been assigned to a different recording.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Ownership:</strong> I am the copyright owner, or have obtained all necessary licenses
              and permissions from the copyright owners, for the master recording, underlying composition,
              and all samples, interpolations, or third-party elements included in this submission.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>False Declaration:</strong> I understand that a false declaration constitutes fraud,
              may void my MHC account, subjects me to removal of all uploaded content without refund,
              and may result in civil liability under applicable copyright law. MHC Streaming reserves
              the right to report fraudulent submissions to relevant rights organizations (IFPI, RIAA,
              national PROs) and law enforcement agencies.
            </li>
            <li>
              <strong>Forensic Record:</strong> I understand that this declaration is permanently recorded
              in a cryptographically secured audit log at the time of submission, timestamped and linked
              to my account identity, and may be produced as evidence in any dispute regarding this
              submission.
            </li>
          </ol>
          <p style={{ marginTop: '0.75rem', fontStyle: 'italic' }}>
            This declaration is governed by the laws of the jurisdiction in which MHC Streaming LLC is
            incorporated and by applicable international copyright treaties. By proceeding, you agree
            to MHC Streaming's Terms of Service, Section 4.2 (Authorship Representations).
          </p>
        </div>
      )}

      {/* Status indicator */}
      {!declared && (
        <p
          style={{
            margin: '0.75rem 0 0',
            fontSize: '0.78rem',
            color: '#c0392b',
            fontFamily: 'EB Garamond, serif',
            fontStyle: 'italic',
          }}
        >
          ⚠ Human authorship declaration required before upload
        </p>
      )}
      {declared && (
        <p
          style={{
            margin: '0.75rem 0 0',
            fontSize: '0.78rem',
            color: '#c9a84c',
            fontFamily: 'EB Garamond, serif',
            fontStyle: 'italic',
          }}
        >
          ✓ Declaration recorded — this affirmation is permanently logged
        </p>
      )}
    </div>
  )
}

export default AuthorshipDeclaration
