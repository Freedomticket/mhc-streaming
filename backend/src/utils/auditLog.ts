/**
 * MHC Streaming — Forensic Audit Log
 *
 * Place at: backend/src/utils/auditLog.ts
 *
 * Supreme System Law requirement: "Permanent forensic logging of all actions"
 * "Hash-chained forensic logs" + "WORM storage"
 *
 * This module provides a hash-chained, append-only audit log.
 * Each entry contains:
 *   - SHA-256 of (previous hash + current timestamp + event JSON)
 *   - This makes the log tamper-evident: changing any entry breaks all subsequent hashes
 *
 * Storage:
 *   - Primary: append to local JSONL file (one JSON object per line)
 *   - In production: mirror to your WORM-compatible store (Backblaze Object Lock,
 *     MinIO with Object Locking, or any S3-compatible with WORM/Compliance mode)
 *   - The file itself is append-only; use filesystem-level protections (chattr +a on Linux)
 *     or mount the log volume read-only after each write.
 *
 * Usage in your upload route:
 *   import { logValidationEvent } from '@/utils/auditLog'
 *
 *   await logValidationEvent({
 *     type: 'UPLOAD_ATTEMPT',
 *     userId: req.user.id,
 *     isrc: req.body.isrc,
 *     result: 'REJECTED',
 *     reason: 'duplicate_isrc',
 *     ip: req.ip,
 *   })
 */

import { createHash } from 'crypto'
import { appendFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ── Types ────────────────────────────────────────────────────────────────────

export type AuditEventType =
  | 'UPLOAD_ATTEMPT'        // any track upload attempt, pass or fail
  | 'ISRC_VALIDATION'       // ISRC format check result
  | 'ISWC_VALIDATION'       // ISWC format check result
  | 'ISRC_DUPLICATE'        // duplicate ISRC detected
  | 'AUTHORSHIP_DECLARED'   // human authorship checkbox confirmed
  | 'UPLOAD_ACCEPTED'       // track passed all gates and was accepted
  | 'UPLOAD_REJECTED'       // track rejected — includes reason
  | 'RATE_LIMIT_HIT'        // too many upload attempts from one source
  | 'ACCOUNT_FLAG'          // account flagged for suspicious pattern
  | 'RIGHTS_SCORE_CHANGE'   // Rights Reputation Score updated

export type AuditResult = 'PASSED' | 'REJECTED' | 'FLAGGED' | 'INFO'

export interface AuditEventPayload {
  type: AuditEventType
  result: AuditResult
  userId: string            // MHC user ID (never email — no PII in log)
  sessionId?: string        // upload session ID for correlating events
  isrc?: string             // normalized ISRC (XX-XXX-YY-NNNNN)
  iswc?: string             // normalized ISWC if present
  trackId?: string          // assigned track ID if upload succeeded
  ip?: string               // hashed IP (see note below — hash before storing)
  reason?: string           // human-readable reason for rejection/flag
  metadata?: Record<string, unknown>  // any additional context
}

export interface AuditLogEntry {
  seq: number               // monotonically increasing sequence number
  timestamp: string         // ISO 8601 UTC
  hash: string              // SHA-256 of (prevHash + timestamp + JSON(payload))
  prevHash: string          // hash of previous entry (genesis = 64 zeros)
  payload: AuditEventPayload
}

// ── Configuration ─────────────────────────────────────────────────────────────

const AUDIT_LOG_PATH = resolve(
  process.env.AUDIT_LOG_PATH || './logs/mhc-audit.jsonl'
)

const GENESIS_HASH = '0'.repeat(64)

// ── Hash helpers ──────────────────────────────────────────────────────────────

function sha256(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex')
}

/**
 * Hash an IP address so the log does not store raw PII.
 * We use a site-specific salt (from env) so the hash can't be
 * rainbow-tabled. The hashed IP is still useful for correlating
 * suspicious patterns from the same source.
 */
export function hashIP(ip: string): string {
  const salt = process.env.AUDIT_IP_SALT || 'mhc-sovereign-salt-change-in-prod'
  return sha256(salt + ip).slice(0, 16) // 16 hex chars is enough for correlation
}

// ── State: last entry for chain linking ──────────────────────────────────────

let _lastHash: string = GENESIS_HASH
let _lastSeq: number = 0
let _initialized = false

function ensureInitialized(): void {
  if (_initialized) return

  if (!existsSync(AUDIT_LOG_PATH)) {
    _lastHash = GENESIS_HASH
    _lastSeq = 0
    _initialized = true
    return
  }

  // Read the last line of the log to get the current chain tip
  try {
    const content = readFileSync(AUDIT_LOG_PATH, 'utf8').trim()
    if (!content) {
      _lastHash = GENESIS_HASH
      _lastSeq = 0
      _initialized = true
      return
    }
    const lines = content.split('\n')
    const lastLine = lines[lines.length - 1]
    const lastEntry: AuditLogEntry = JSON.parse(lastLine)
    _lastHash = lastEntry.hash
    _lastSeq = lastEntry.seq
    _initialized = true
  } catch {
    // If the file is corrupted or unreadable, start a new chain but log it
    console.error('[MHC AUDIT] Warning: could not read existing audit log. Starting new chain.')
    _lastHash = GENESIS_HASH
    _lastSeq = 0
    _initialized = true
  }
}

// ── Main export: log a validation/upload event ───────────────────────────────

export async function logValidationEvent(payload: AuditEventPayload): Promise<AuditLogEntry> {
  ensureInitialized()

  const timestamp = new Date().toISOString()
  const seq = _lastSeq + 1
  const prevHash = _lastHash

  // Hash is over: previous hash + timestamp + canonical JSON of payload
  // This creates the chain: changing any entry invalidates all subsequent hashes
  const payloadJson = JSON.stringify(payload, Object.keys(payload).sort())
  const hashInput = `${prevHash}|${timestamp}|${payloadJson}`
  const hash = sha256(hashInput)

  const entry: AuditLogEntry = {
    seq,
    timestamp,
    hash,
    prevHash,
    payload,
  }

  // Append to JSONL file (one JSON object per line, never overwrite)
  try {
    appendFileSync(AUDIT_LOG_PATH, JSON.stringify(entry) + '\n', { flag: 'a' })
  } catch (err) {
    // Log write failure is critical — do NOT silently swallow it.
    // If the log can't be written, the upload should be blocked (fail-secure).
    console.error('[MHC AUDIT] CRITICAL: failed to write audit log entry', err)
    throw new Error('Audit log write failed — upload blocked for integrity.')
  }

  // Advance the chain
  _lastHash = hash
  _lastSeq = seq

  return entry
}

// ── Verification: check the chain integrity of the whole log ─────────────────

export interface ChainVerificationResult {
  valid: boolean
  totalEntries: number
  firstBrokenAt?: number   // seq number of first invalid entry
  error?: string
}

export function verifyAuditChain(): ChainVerificationResult {
  if (!existsSync(AUDIT_LOG_PATH)) {
    return { valid: true, totalEntries: 0 }
  }

  const content = readFileSync(AUDIT_LOG_PATH, 'utf8').trim()
  if (!content) return { valid: true, totalEntries: 0 }

  const lines = content.split('\n').filter(Boolean)
  let prevHash = GENESIS_HASH

  for (let i = 0; i < lines.length; i++) {
    let entry: AuditLogEntry
    try {
      entry = JSON.parse(lines[i])
    } catch {
      return { valid: false, totalEntries: i, firstBrokenAt: i + 1, error: `JSON parse error at line ${i + 1}` }
    }

    // Verify prev hash link
    if (entry.prevHash !== prevHash) {
      return {
        valid: false,
        totalEntries: lines.length,
        firstBrokenAt: entry.seq,
        error: `Chain break at seq ${entry.seq}: prevHash mismatch`,
      }
    }

    // Recompute hash
    const payloadJson = JSON.stringify(entry.payload, Object.keys(entry.payload).sort())
    const hashInput = `${entry.prevHash}|${entry.timestamp}|${payloadJson}`
    const expectedHash = sha256(hashInput)

    if (entry.hash !== expectedHash) {
      return {
        valid: false,
        totalEntries: lines.length,
        firstBrokenAt: entry.seq,
        error: `Hash mismatch at seq ${entry.seq}: entry may have been tampered`,
      }
    }

    prevHash = entry.hash
  }

  return { valid: true, totalEntries: lines.length }
}
