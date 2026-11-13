/**
 * MHC Streaming — ISRC Duplicate Detection Middleware
 *
 * Place at: backend/src/utils/isrcDuplicateCheck.ts
 *
 * An ISRC is a permanent, unique identifier for a specific recording.
 * Submitting the same ISRC for two different tracks is either:
 *   (a) a mistake (artist reused their own code)
 *   (b) ISRC theft (artist copied someone else's real code)
 *
 * Both are fraudulent submissions. This middleware catches both.
 *
 * Required DB schema (add to your Prisma schema or SQL migration):
 *
 *   model IsrcRegistry {
 *     id          String   @id @default(cuid())
 *     isrc        String   @unique  // normalized: XX-XXX-YY-NNNNN
 *     trackId     String   @unique  // the MHC track that owns this ISRC
 *     userId      String            // the artist who registered it
 *     registeredAt DateTime @default(now())
 *   }
 *
 * Usage in your upload route:
 *
 *   import { checkISRCNotDuplicate, registerISRC } from '@/utils/isrcDuplicateCheck'
 *
 *   router.post('/tracks', async (req, res) => {
 *     // 1. Format validation
 *     const codeCheck = enforceTrackCodes(req.body)
 *     if (!codeCheck.passed) return res.status(422).json({ errors: codeCheck.errors })
 *
 *     // 2. Duplicate check
 *     const dupCheck = await checkISRCNotDuplicate(req.body.isrc, req.user.id)
 *     if (!dupCheck.ok) return res.status(409).json({ error: dupCheck.error, conflict: dupCheck.conflict })
 *
 *     // 3. Accept upload, then register
 *     const track = await createTrack(...)
 *     await registerISRC(req.body.isrc, track.id, req.user.id)
 *
 *     return res.status(201).json({ track })
 *   })
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DuplicateCheckResult {
  ok: boolean
  error?: string
  conflict?: {
    isrc: string
    existingTrackId: string
    existingUserId: string
    registeredAt: string
    sameOwner: boolean  // true if the same user owns the conflict — probably a mistake
  }
}

export interface ISRCRegistration {
  isrc: string
  trackId: string
  userId: string
  registeredAt: Date
}

// ── Normalize ─────────────────────────────────────────────────────────────────

function normalizeISRC(raw: string): string {
  const stripped = raw.replace(/[-\s.]/g, '').toUpperCase().trim()
  if (stripped.length === 12) {
    return `${stripped.slice(0,2)}-${stripped.slice(2,5)}-${stripped.slice(5,7)}-${stripped.slice(7)}`
  }
  return raw.toUpperCase().trim()
}

// ── Database adapter interface ────────────────────────────────────────────────
// Abstract so this works with Prisma, raw SQL, or any other DB layer.
// In production, inject your Prisma client or db instance.

export interface ISRCStore {
  findByISRC(isrc: string): Promise<ISRCRegistration | null>
  insert(reg: ISRCRegistration): Promise<void>
}

// ── Default implementation using an in-memory store ───────────────────────────
// REPLACE THIS with your actual DB in production.
// This is provided so the middleware works immediately without a DB migration.

class InMemoryISRCStore implements ISRCStore {
  private store = new Map<string, ISRCRegistration>()

  async findByISRC(isrc: string): Promise<ISRCRegistration | null> {
    return this.store.get(isrc) ?? null
  }

  async insert(reg: ISRCRegistration): Promise<void> {
    this.store.set(reg.isrc, reg)
  }
}

// Singleton — replace with your Prisma client adapter in production
let _store: ISRCStore = new InMemoryISRCStore()

export function setISRCStore(store: ISRCStore): void {
  _store = store
}

// ── Prisma adapter factory (use this in production) ───────────────────────────
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
//
// setISRCStore({
//   async findByISRC(isrc) {
//     return prisma.isrcRegistry.findUnique({ where: { isrc } })
//   },
//   async insert(reg) {
//     await prisma.isrcRegistry.create({ data: reg })
//   },
// })

// ── Main exports ──────────────────────────────────────────────────────────────

/**
 * Check if an ISRC has already been registered to a different track.
 * Returns ok=true if safe to proceed, ok=false with conflict details if not.
 */
export async function checkISRCNotDuplicate(
  rawISRC: string,
  submittingUserId: string
): Promise<DuplicateCheckResult> {
  const isrc = normalizeISRC(rawISRC)

  const existing = await _store.findByISRC(isrc)

  if (!existing) {
    return { ok: true }
  }

  const sameOwner = existing.userId === submittingUserId

  if (sameOwner) {
    // Same artist reusing their own ISRC — could be a re-upload, could be a mistake
    return {
      ok: false,
      error: `ISRC ${isrc} is already registered to one of your tracks (ID: ${existing.trackId}). Each recording must have its own unique ISRC. If this is a re-upload of the same recording, contact support. If it is a different recording, obtain a new ISRC from your national agency.`,
      conflict: {
        isrc,
        existingTrackId: existing.trackId,
        existingUserId: existing.userId,
        registeredAt: existing.registeredAt.toISOString(),
        sameOwner: true,
      },
    }
  }

  // Different artist using the same ISRC — high fraud signal
  return {
    ok: false,
    error: `ISRC ${isrc} is already registered to a recording on MHC. Each ISRC must uniquely identify a single recording. If you believe you are the rightful owner of this ISRC, please contact rights@mhcstreaming.com with proof of registration.`,
    conflict: {
      isrc,
      existingTrackId: existing.trackId,
      existingUserId: existing.userId,
      registeredAt: existing.registeredAt.toISOString(),
      sameOwner: false,
    },
  }
}

/**
 * Register an ISRC after a successful upload.
 * Call this AFTER the track record has been created in the DB.
 */
export async function registerISRC(
  rawISRC: string,
  trackId: string,
  userId: string
): Promise<void> {
  const isrc = normalizeISRC(rawISRC)
  await _store.insert({
    isrc,
    trackId,
    userId,
    registeredAt: new Date(),
  })
}
