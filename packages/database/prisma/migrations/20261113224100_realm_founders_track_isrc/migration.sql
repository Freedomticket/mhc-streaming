-- ============================================================
-- Migration: realm_founders_track_isrc
-- Date: 2026-11-13
-- Safe: additive only — no DROP, no ALTER TYPE, no data loss
--
-- Changes:
--   1. User table — add realm, isFounder (both nullable/defaulted)
--   2. User table — add labelManagedBy, isLabelAccount
--   3. New table: IsrcRegistry
--   4. New table: Track
--   5. New table: FounderApplication
-- ============================================================

-- ── 1. User: realm + founder fields ─────────────────────────────────────────
-- All columns are nullable or have defaults so existing rows are unaffected.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "realm"        TEXT,
  ADD COLUMN IF NOT EXISTS "isFounder"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "labelManagedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "isLabelAccount" BOOLEAN NOT NULL DEFAULT false;

-- ── 2. IsrcRegistry ──────────────────────────────────────────────────────────
-- Each ISRC is permanently locked to one track. Prevents ISRC theft/reuse.

CREATE TABLE IF NOT EXISTS "IsrcRegistry" (
  "id"           TEXT NOT NULL,
  "isrc"         TEXT NOT NULL,
  "trackId"      TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "IsrcRegistry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IsrcRegistry_isrc_key"    ON "IsrcRegistry"("isrc");
CREATE UNIQUE INDEX IF NOT EXISTS "IsrcRegistry_trackId_key" ON "IsrcRegistry"("trackId");
CREATE        INDEX IF NOT EXISTS "IsrcRegistry_userId_idx"  ON "IsrcRegistry"("userId");

-- ── 3. Track ─────────────────────────────────────────────────────────────────
-- Core track record. Used for monthly upload count queries.

CREATE TABLE IF NOT EXISTS "Track" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "isrc"      TEXT,
  "iswc"      TEXT,
  "fileId"    TEXT,
  "status"    TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Track_isrc_key"             ON "Track"("isrc");
CREATE        INDEX IF NOT EXISTS "Track_userId_idx"           ON "Track"("userId");
CREATE        INDEX IF NOT EXISTS "Track_userId_createdAt_idx" ON "Track"("userId", "createdAt");
CREATE        INDEX IF NOT EXISTS "Track_status_idx"           ON "Track"("status");

-- ── 4. FounderApplication ────────────────────────────────────────────────────
-- 30 founding artist slots. Approved founders get permanent 50% discount.

CREATE TABLE IF NOT EXISTS "FounderApplication" (
  "id"          TEXT NOT NULL,
  "firstName"   TEXT NOT NULL,
  "lastName"    TEXT NOT NULL,
  "artistName"  TEXT NOT NULL,
  "email"       TEXT NOT NULL,
  "genre"       TEXT NOT NULL,
  "links"       TEXT,
  "why"         TEXT NOT NULL,
  "realm"       TEXT NOT NULL,
  "status"      TEXT NOT NULL DEFAULT 'pending',
  "reviewedAt"  TIMESTAMP(3),
  "reviewedBy"  TEXT,
  "userId"      TEXT,
  "appliedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FounderApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FounderApplication_email_key"  ON "FounderApplication"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "FounderApplication_userId_key" ON "FounderApplication"("userId");
CREATE        INDEX IF NOT EXISTS "FounderApplication_status_idx" ON "FounderApplication"("status");
CREATE        INDEX IF NOT EXISTS "FounderApplication_realm_idx"  ON "FounderApplication"("realm");
CREATE        INDEX IF NOT EXISTS "FounderApplication_appliedAt_idx" ON "FounderApplication"("appliedAt");
