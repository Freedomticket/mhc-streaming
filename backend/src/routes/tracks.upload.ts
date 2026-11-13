/**
 * MHC Streaming — Track Upload Route (Full Gate Stack)
 *
 * Place at: backend/src/routes/tracks.upload.ts
 *
 * This is the complete upload endpoint. Every layer is enforced in order.
 * No layer can be skipped — the client UI cannot bypass any of this.
 *
 * Gate order (all must pass to proceed):
 *   1. Rate limiting (uploadRateLimit middleware)
 *   2. ISRC/ISWC format validation (enforceTrackCodes)
 *   3. ISRC duplicate detection (checkISRCNotDuplicate)
 *   4. Human authorship declaration (humanAuthorDeclared must be true)
 *   5. File upload
 *   6. ISRC registration (after successful upload)
 *   7. Audit log entry (every outcome — pass AND fail)
 *
 * Wire this into your Express app:
 *   import tracksUploadRouter from '@/routes/tracks.upload'
 *   app.use('/api/tracks', tracksUploadRouter)
 */

import { Router } from 'express'
import { enforceTrackCodes }         from '@/utils/codeValidator.backend'
import { checkISRCNotDuplicate, registerISRC } from '@/utils/isrcDuplicateCheck'
import { logValidationEvent, hashIP } from '@/utils/auditLog'
import { uploadRateLimit }            from '@/middleware/uploadRateLimit'
import { checkMonthlyUploadLimit, recordUploadCounted } from '@/middleware/monthlyUploadLimit'

const router = Router()

// POST /api/tracks/upload
// Gate order: rate limit → monthly cap → format → duplicate → authorship → file
router.post('/upload', uploadRateLimit, checkMonthlyUploadLimit, async (req, res) => {
  const { userId, hashedIP, recordRejection } = res.locals.mhc

  const {
    isrc,
    iswc,
    humanAuthorDeclared,  // boolean from frontend AuthorshipDeclaration component
    trackTitle,
    // ... other track metadata
  } = req.body

  // ── GATE 1: Format validation ─────────────────────────────────────────────
  const codeCheck = enforceTrackCodes({ isrc, iswc })

  if (!codeCheck.passed) {
    await logValidationEvent({
      type: 'UPLOAD_REJECTED',
      result: 'REJECTED',
      userId,
      ip: hashedIP,
      isrc: isrc || '',
      iswc: iswc || '',
      reason: 'format_validation_failed',
      metadata: { errors: codeCheck.errors },
    })
    await recordRejection('format_validation_failed')
    return res.status(422).json({
      error: 'Rights code validation failed.',
      code: 'INVALID_RIGHTS_CODES',
      errors: codeCheck.errors,
    })
  }

  // ── GATE 2: Duplicate ISRC check ─────────────────────────────────────────
  const dupCheck = await checkISRCNotDuplicate(isrc, userId)

  if (!dupCheck.ok) {
    await logValidationEvent({
      type: 'ISRC_DUPLICATE',
      result: 'REJECTED',
      userId,
      ip: hashedIP,
      isrc,
      iswc: iswc || undefined,
      reason: dupCheck.conflict?.sameOwner ? 'self_duplicate_isrc' : 'isrc_already_registered',
      metadata: { conflict: dupCheck.conflict },
    })
    await recordRejection('duplicate_isrc')
    return res.status(409).json({
      error: dupCheck.error,
      code: 'ISRC_DUPLICATE',
      conflict: dupCheck.conflict,
    })
  }

  // ── GATE 3: Human authorship declaration ─────────────────────────────────
  if (!humanAuthorDeclared || humanAuthorDeclared !== true) {
    await logValidationEvent({
      type: 'UPLOAD_REJECTED',
      result: 'REJECTED',
      userId,
      ip: hashedIP,
      isrc,
      reason: 'missing_authorship_declaration',
    })
    await recordRejection('missing_authorship_declaration')
    return res.status(422).json({
      error: 'Human authorship declaration is required. You must affirm that this is an original human-created work.',
      code: 'AUTHORSHIP_DECLARATION_REQUIRED',
    })
  }

  // ── Log the declaration ───────────────────────────────────────────────────
  await logValidationEvent({
    type: 'AUTHORSHIP_DECLARED',
    result: 'PASSED',
    userId,
    ip: hashedIP,
    isrc,
    iswc: iswc || undefined,
    metadata: { trackTitle: trackTitle || 'untitled' },
  })

  // ── GATE 4: Accept the upload ─────────────────────────────────────────────
  // Replace this section with your actual file upload handler
  // (multer, busboy, direct-to-object-storage, etc.)

  let trackId: string
  try {
    // TODO: implement your file upload here
    // const upload = await handleFileUpload(req)
    // const track = await db.track.create({ data: { ...metadata, isrc, iswc, userId } })
    // trackId = track.id

    // Placeholder until file upload is wired:
    trackId = `track_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  } catch (err) {
    await logValidationEvent({
      type: 'UPLOAD_REJECTED',
      result: 'REJECTED',
      userId,
      ip: hashedIP,
      isrc,
      reason: 'file_upload_error',
      metadata: { error: String(err) },
    })
    return res.status(500).json({ error: 'File upload failed. Please try again.' })
  }

  // ── Register the ISRC now that upload succeeded ───────────────────────────
  await registerISRC(isrc, trackId, userId)

  // ── Increment monthly upload count ───────────────────────────────────────
  await recordUploadCounted(userId)

  // ── Log the success ───────────────────────────────────────────────────────
  await logValidationEvent({
    type: 'UPLOAD_ACCEPTED',
    result: 'PASSED',
    userId,
    ip: hashedIP,
    isrc,
    iswc: iswc || undefined,
    trackId,
    metadata: { trackTitle: trackTitle || 'untitled' },
  })

  return res.status(201).json({
    message: 'Track uploaded successfully.',
    trackId,
    isrc,
    iswc: iswc || null,
  })
})

export default router
