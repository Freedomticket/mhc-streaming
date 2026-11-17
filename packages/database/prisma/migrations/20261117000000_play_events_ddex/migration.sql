-- ============================================================
-- Migration: play_events_ddex
-- Date: 2026-11-17
-- Safe: additive only — no DROP, no ALTER TYPE, no data loss
--
-- Changes:
--   1. PlayEvent    — raw immutable play log (ISRC-keyed)
--   2. DdexReport   — generated report manifest (tracks what was filed)
--   3. Index on StreamEvent.isrc — for faster ISRC-based aggregation
-- ============================================================

-- ── 1. PlayEvent ─────────────────────────────────────────────────────────────
-- Immutable log of every qualifying play (>30s).
-- Written once per play, never updated.
-- This is the source of truth for all royalty calculations and DDEX exports.
--
-- Why separate from StreamEvent?
--   StreamEvent is tied to our internal Video/Stream models.
--   PlayEvent is ISRC-keyed — it works for any content, including
--   tracks uploaded without a Video record (audio-only, future formats).

CREATE TABLE IF NOT EXISTS "PlayEvent" (
  "id"              TEXT NOT NULL,

  -- What was played (ISRC is the global key; internal IDs are optional)
  "isrc"            TEXT NOT NULL,          -- e.g. US-S1Z-99-00001
  "trackId"         TEXT,                   -- MHC Track.id if exists
  "videoId"         TEXT,                   -- MHC Video.id if exists
  "artistId"        TEXT,                   -- MHC Artist.id if exists

  -- Who played it
  "userId"          TEXT,                   -- NULL = anonymous/guest
  "ipHash"          TEXT,                   -- SHA-256 of IP — for dedup/fraud, never raw IP
  "userAgent"       TEXT,

  -- Quality metrics
  "durationSeconds" INTEGER NOT NULL,       -- How long they actually listened
  "trackDurationSeconds" INTEGER,           -- Full track length (for % calc)
  "completionPct"   REAL,                   -- durationSeconds / trackDurationSeconds
  "qualified"       BOOLEAN NOT NULL DEFAULT true, -- Was >30s at time of write

  -- Subscription context (for pro-rata weighting)
  "subscriptionTier" TEXT,                  -- 'FREE' | 'INFERNO' | 'PURGATORIO' | 'PARADISO'

  -- Fraud detection
  "fraudScore"      REAL NOT NULL DEFAULT 0.0,  -- 0.0 = clean, 1.0 = definite fraud
  "flagged"         BOOLEAN NOT NULL DEFAULT false,

  -- Processing state
  "processedAt"     TIMESTAMP(3),           -- NULL = not yet included in a royalty calc

  -- Platform metadata
  "platform"        TEXT NOT NULL DEFAULT 'mhc',  -- 'mhc' | 'api' | future
  "country"         TEXT,                   -- ISO 3166-1 alpha-2 (from IP geolocation)

  -- Timestamps (immutable after write)
  "playedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PlayEvent_pkey" PRIMARY KEY ("id")
);

-- Lookup by ISRC (most common query path)
CREATE INDEX IF NOT EXISTS "PlayEvent_isrc_idx"           ON "PlayEvent"("isrc");
CREATE INDEX IF NOT EXISTS "PlayEvent_isrc_playedAt_idx"  ON "PlayEvent"("isrc", "playedAt");

-- Monthly aggregation queries
CREATE INDEX IF NOT EXISTS "PlayEvent_playedAt_idx"       ON "PlayEvent"("playedAt");
CREATE INDEX IF NOT EXISTS "PlayEvent_processedAt_idx"    ON "PlayEvent"("processedAt");

-- Dedup / fraud queries
CREATE INDEX IF NOT EXISTS "PlayEvent_userId_isrc_idx"    ON "PlayEvent"("userId", "isrc");
CREATE INDEX IF NOT EXISTS "PlayEvent_ipHash_isrc_idx"    ON "PlayEvent"("ipHash", "isrc");
CREATE INDEX IF NOT EXISTS "PlayEvent_flagged_idx"        ON "PlayEvent"("flagged");

-- Artist-level queries
CREATE INDEX IF NOT EXISTS "PlayEvent_artistId_idx"       ON "PlayEvent"("artistId");
CREATE INDEX IF NOT EXISTS "PlayEvent_artistId_playedAt_idx" ON "PlayEvent"("artistId", "playedAt");


-- ── 2. DdexReport ────────────────────────────────────────────────────────────
-- Manifest for every DDEX/SoundExchange report generated.
-- Stores: what period, what format, what file path, delivery status.

CREATE TABLE IF NOT EXISTS "DdexReport" (
  "id"              TEXT NOT NULL,

  -- Report identity
  "reportType"      TEXT NOT NULL,          -- 'DDEX_ERN' | 'SOUNDEXCHANGE' | 'INTERNAL'
  "formatVersion"   TEXT NOT NULL,          -- e.g. 'ERN/4.1', 'SX/2023'
  "messageId"       TEXT NOT NULL,          -- globally unique per DDEX spec

  -- Period covered
  "periodStart"     TIMESTAMP(3) NOT NULL,
  "periodEnd"       TIMESTAMP(3) NOT NULL,

  -- Counts (for audit trail)
  "totalPlays"      INTEGER NOT NULL DEFAULT 0,
  "qualifiedPlays"  INTEGER NOT NULL DEFAULT 0,
  "uniqueIsrcs"     INTEGER NOT NULL DEFAULT 0,
  "uniqueArtists"   INTEGER NOT NULL DEFAULT 0,

  -- File storage
  "filePath"        TEXT,                   -- local path or object storage key
  "fileSize"        INTEGER,                -- bytes
  "checksum"        TEXT,                   -- SHA-256 of file for integrity

  -- Delivery status
  "status"          TEXT NOT NULL DEFAULT 'generated',
  -- 'generated' | 'pending_delivery' | 'delivered' | 'acknowledged' | 'failed'
  "deliveredAt"     TIMESTAMP(3),
  "acknowledgedAt"  TIMESTAMP(3),
  "deliveryError"   TEXT,

  -- Recipient (which org received it)
  "recipient"       TEXT,                   -- 'ASCAP' | 'BMI' | 'SoundExchange' | 'internal'

  -- Metadata
  "metadata"        JSONB,                  -- Additional fields per report type

  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DdexReport_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "DdexReport_msgid_key" UNIQUE ("messageId")
);

CREATE INDEX IF NOT EXISTS "DdexReport_reportType_idx"   ON "DdexReport"("reportType");
CREATE INDEX IF NOT EXISTS "DdexReport_periodStart_idx"  ON "DdexReport"("periodStart");
CREATE INDEX IF NOT EXISTS "DdexReport_status_idx"       ON "DdexReport"("status");


-- ── 3. Additional indexes on existing tables ─────────────────────────────────
-- Speed up ISRC-based joins on StreamEvent (already has isrc via Video join,
-- but adding direct column for future use)

-- Track table: add iswc index if not already present
CREATE INDEX IF NOT EXISTS "Track_iswc_idx" ON "Track"("iswc");
