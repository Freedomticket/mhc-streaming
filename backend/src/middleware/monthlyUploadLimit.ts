/**
 * MHC Streaming — Monthly Upload Limit Middleware
 *
 * Place at: backend/src/middleware/monthlyUploadLimit.ts
 *
 * Enforces per-tier monthly track upload caps:
 *
 *   FREE              →  5 tracks/month   (singles + a couple extras)
 *   INFERNO (Artist)  → 15 tracks/month   (album + a few singles)
 *   PURGATORIO        → 15 tracks/month   (same as Artist)
 *   PARADISO          → 15 tracks/month   (same as Artist)
 *   LABEL_MANAGED     → 15 tracks/month   (fee waived — label takes percentage)
 *   LABEL_ACCOUNT     → 50 tracks/month   (managing multiple artists)
 *
 * Rationale: A prolific human artist produces at most one album (10–12 tracks)
 * per month. These limits block AI bot farms while never restricting a real
 * working musician. They also align with the IFPI/UMG standard for
 * legitimate catalog submissions.
 *
 * Wire after uploadRateLimit in your upload route:
 *   router.post('/upload', uploadRateLimit, checkMonthlyUploadLimit, handler)
 */

import { Request, Response, NextFunction } from 'express'

// ── Tier limits ───────────────────────────────────────────────────────────────

export type SubscriptionTier = 'FREE' | 'INFERNO' | 'PURGATORIO' | 'PARADISO' | 'LABEL_MANAGED' | 'LABEL_ACCOUNT'

export const MONTHLY_UPLOAD_LIMITS: Record<SubscriptionTier, number> = {
  FREE:          5,
  INFERNO:      15,
  PURGATORIO:   15,
  PARADISO:     15,
  LABEL_MANAGED: 15,  // fee waived — label earns percentage instead
  LABEL_ACCOUNT: 50,  // managing multiple artists across the roster
}

// ── DB adapter interface ──────────────────────────────────────────────────────
// Inject your Prisma client in production via setUploadCountStore()

export interface UploadCountStore {
  /**
   * Returns how many tracks this user has uploaded in the current calendar month.
   * month: 'YYYY-MM' string, e.g. '2026-11'
   */
  getMonthlyCount(userId: string, month: string): Promise<number>

  /**
   * Returns the user's subscription tier and whether they are label-managed.
   */
  getUserTier(userId: string): Promise<{ tier: SubscriptionTier; labelManagedBy?: string | null }>
}

// ── Default in-memory store (replace with Prisma in production) ───────────────

class InMemoryUploadCountStore implements UploadCountStore {
  // key: `${userId}:${month}` → count
  private counts = new Map<string, number>()
  // key: userId → { tier, labelManagedBy }
  private users = new Map<string, { tier: SubscriptionTier; labelManagedBy?: string | null }>()

  async getMonthlyCount(userId: string, month: string): Promise<number> {
    return this.counts.get(`${userId}:${month}`) ?? 0
  }

  async getUserTier(userId: string): Promise<{ tier: SubscriptionTier; labelManagedBy?: string | null }> {
    return this.users.get(userId) ?? { tier: 'FREE', labelManagedBy: null }
  }

  // Helper for testing / seeding
  setUser(userId: string, tier: SubscriptionTier, labelManagedBy?: string) {
    this.users.set(userId, { tier, labelManagedBy: labelManagedBy ?? null })
  }

  incrementCount(userId: string, month: string) {
    const key = `${userId}:${month}`
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1)
  }
}

let _store: UploadCountStore = new InMemoryUploadCountStore()

export function setUploadCountStore(store: UploadCountStore): void {
  _store = store
}

// ── Prisma adapter (use this in production) ───────────────────────────────────
//
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
//
// setUploadCountStore({
//   async getMonthlyCount(userId, month) {
//     const [year, monthNum] = month.split('-').map(Number)
//     const start = new Date(year, monthNum - 1, 1)
//     const end   = new Date(year, monthNum, 1)
//     return prisma.track.count({
//       where: { userId, createdAt: { gte: start, lt: end } }
//     })
//   },
//   async getUserTier(userId) {
//     const sub = await prisma.subscription.findUnique({
//       where: { userId },
//       select: { tier: true },
//     })
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { labelManagedBy: true },
//     })
//     const isLabelAccount = sub?.tier === 'PARADISO' && user?.labelManagedBy === null
//     // Adjust this logic to match your actual tier/role setup
//     if (user?.labelManagedBy) return { tier: 'LABEL_MANAGED', labelManagedBy: user.labelManagedBy }
//     return { tier: (sub?.tier ?? 'FREE') as SubscriptionTier }
//   },
// })

// ── Helpers ───────────────────────────────────────────────────────────────────

function currentMonth(): string {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// ── Middleware ────────────────────────────────────────────────────────────────

export async function checkMonthlyUploadLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = res.locals.mhc?.userId ?? (req as any).user?.id ?? 'anonymous'
  const month  = currentMonth()

  try {
    const { tier, labelManagedBy } = await _store.getUserTier(userId)
    const effectiveTier: SubscriptionTier = labelManagedBy ? 'LABEL_MANAGED' : tier
    const limit = MONTHLY_UPLOAD_LIMITS[effectiveTier]
    const used  = await _store.getMonthlyCount(userId, month)

    if (used >= limit) {
      res.status(429).json({
        error: `Monthly upload limit reached. Your ${effectiveTier} account allows ${limit} track${limit === 1 ? '' : 's'} per month. You have uploaded ${used} this month. Limits reset on the 1st of each month.`,
        code: 'MONTHLY_LIMIT_REACHED',
        limit,
        used,
        month,
        resetsAt: new Date(
          Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth() + 1,
            1
          )
        ).toISOString(),
      })
      return
    }

    // Attach to locals so the route handler can increment after successful upload
    res.locals.mhc = {
      ...res.locals.mhc,
      monthlyUpload: { userId, month, used, limit, effectiveTier },
    }

    next()
  } catch (err) {
    console.error('[MHC MONTHLY LIMIT] Error checking upload count:', err)
    // Fail open on DB error — don't block uploads if the count check fails
    next()
  }
}

/**
 * Call this AFTER a track is successfully saved to the DB.
 * Increments the monthly count for this user.
 */
export async function recordUploadCounted(userId: string): Promise<void> {
  const month = currentMonth()
  // In production with Prisma, the track.create() call itself is the record —
  // just query count from the Track table in getMonthlyCount().
  // With in-memory store, increment explicitly:
  if (_store instanceof InMemoryUploadCountStore) {
    (_store as InMemoryUploadCountStore).incrementCount(userId, month)
  }
}
