/**
 * MHC Streaming — Upload Rate Limiting Middleware
 *
 * Place at: backend/src/middleware/uploadRateLimit.ts
 *
 * Prevents automated bypass of rights validation by limiting:
 *   - Per user: 20 upload attempts per hour
 *   - Per IP: 50 upload attempts per hour
 *   - After 5 rejections: account flagged for review
 *
 * Usage in your Express app:
 *   import { uploadRateLimit } from '@/middleware/uploadRateLimit'
 *   router.post('/upload', uploadRateLimit, yourUploadHandler)
 *
 * The middleware attaches res.locals.mhc with:
 *   - userId: string
 *   - hashedIP: string (salted SHA-256, 16 hex chars)
 *   - recordRejection: (reason: string) => Promise<void>
 */

import { Request, Response, NextFunction } from 'express'
import { createHash } from 'crypto'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RateLimitRecord {
  attempts: number[]        // timestamps of attempts (ms) in current window
  rejections: number        // total rejection count (cumulative, not windowed)
  flagged: boolean
  flaggedAt?: Date
  flagReason?: string
}

// ── Configuration ─────────────────────────────────────────────────────────────

const WINDOW_MS = 60 * 60 * 1000        // 1 hour
const MAX_ATTEMPTS_PER_USER = 20
const MAX_ATTEMPTS_PER_IP = 50
const REJECTION_FLAG_THRESHOLD = 5      // flag after this many rejections

// ── In-memory stores (replace with Redis in production for multi-instance) ────

const userStore = new Map<string, RateLimitRecord>()
const ipStore   = new Map<string, RateLimitRecord>()

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashIP(ip: string): string {
  const salt = process.env.AUDIT_IP_SALT || 'mhc-sovereign-salt-change-in-prod'
  return createHash('sha256').update(salt + ip).digest('hex').slice(0, 16)
}

function getOrCreate(store: Map<string, RateLimitRecord>, key: string): RateLimitRecord {
  if (!store.has(key)) {
    store.set(key, { attempts: [], rejections: 0, flagged: false })
  }
  return store.get(key)!
}

function countRecentAttempts(record: RateLimitRecord): number {
  const cutoff = Date.now() - WINDOW_MS
  record.attempts = record.attempts.filter(t => t > cutoff)
  return record.attempts.length
}

// ── Admin helpers ─────────────────────────────────────────────────────────────

export function unflagUser(userId: string): void {
  const record = userStore.get(userId)
  if (record) {
    record.flagged = false
    record.rejections = 0
    delete record.flaggedAt
    delete record.flagReason
  }
}

export function getFlaggedUsers(): Array<{ userId: string; flaggedAt?: Date; reason?: string }> {
  const flagged: Array<{ userId: string; flaggedAt?: Date; reason?: string }> = []
  for (const [userId, record] of userStore.entries()) {
    if (record.flagged) {
      flagged.push({ userId, flaggedAt: record.flaggedAt, reason: record.flagReason })
    }
  }
  return flagged
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function uploadRateLimit(req: Request, res: Response, next: NextFunction): void {
  // Extract user ID from your auth middleware (adjust to match your auth setup)
  const userId = (req as any).user?.id || (req as any).userId || 'anonymous'
  const rawIP = req.ip || req.socket?.remoteAddress || '0.0.0.0'
  const hashedIP = hashIP(rawIP)

  const userRecord = getOrCreate(userStore, userId)
  const ipRecord   = getOrCreate(ipStore, hashedIP)

  const now = Date.now()

  // ── Check: account flagged ────────────────────────────────────────────────
  if (userRecord.flagged) {
    res.status(429).json({
      error: 'Your account has been flagged for suspicious upload activity. Please contact support@mhcstreaming.com to resolve this.',
      code: 'ACCOUNT_FLAGGED',
    })
    return
  }

  // ── Check: per-user rate limit ────────────────────────────────────────────
  const userAttempts = countRecentAttempts(userRecord)
  if (userAttempts >= MAX_ATTEMPTS_PER_USER) {
    res.status(429).json({
      error: `Upload limit reached. You may submit up to ${MAX_ATTEMPTS_PER_USER} tracks per hour. Please wait before trying again.`,
      code: 'RATE_LIMIT_USER',
      retryAfter: Math.ceil(WINDOW_MS / 1000),
    })
    return
  }

  // ── Check: per-IP rate limit ──────────────────────────────────────────────
  const ipAttempts = countRecentAttempts(ipRecord)
  if (ipAttempts >= MAX_ATTEMPTS_PER_IP) {
    res.status(429).json({
      error: 'Too many upload attempts from this network. Please wait before trying again.',
      code: 'RATE_LIMIT_IP',
      retryAfter: Math.ceil(WINDOW_MS / 1000),
    })
    return
  }

  // ── Record this attempt ───────────────────────────────────────────────────
  userRecord.attempts.push(now)
  ipRecord.attempts.push(now)

  // ── Attach helpers for the route handler ─────────────────────────────────
  // The route calls recordRejection() when a gate fails, so the middleware
  // tracks rejections without needing to know why the upload was rejected.

  const recordRejection = async (reason: string): Promise<void> => {
    userRecord.rejections += 1
    ipRecord.rejections += 1

    if (userRecord.rejections >= REJECTION_FLAG_THRESHOLD && !userRecord.flagged) {
      userRecord.flagged = true
      userRecord.flaggedAt = new Date()
      userRecord.flagReason = reason

      // In production, also:
      // - write a ACCOUNT_FLAG audit log entry
      // - send an alert to your moderation queue
      console.warn(`[MHC RATE LIMIT] Account flagged: userId=${userId}, reason=${reason}, rejections=${userRecord.rejections}`)
    }
  }

  res.locals.mhc = { userId, hashedIP, recordRejection }

  next()
}
