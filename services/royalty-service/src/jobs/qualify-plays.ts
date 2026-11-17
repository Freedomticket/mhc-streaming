/**
 * Qualify Plays Job
 *
 * Runs nightly (00:30 UTC). Processes all unprocessed PlayEvents,
 * applies deduplication and fraud rules, marks clean plays as
 * processedAt so they're included in the next royalty calc.
 *
 * Rules (in order):
 *   1. Skip already-processed events
 *   2. Flag: same user × same ISRC > 3 times in 1hr window
 *   3. Flag: same IP hash × same ISRC > 5 times in 1hr window
 *   4. Flag: completion < 5% (skipped — not a real listen)
 *   5. Mark survivors as processedAt = now (ready for aggregation)
 *
 * This job is idempotent — safe to re-run if it crashes mid-way.
 */

import { prisma } from '@mhc/database';

const BATCH_SIZE = 500;

interface QualifyResult {
  processed: number;
  flagged: number;
  clean: number;
  errors: number;
  durationMs: number;
}

export async function qualifyPlays(
  targetDate?: Date  // defaults to yesterday; pass a date for backfill
): Promise<QualifyResult> {
  const start = Date.now();

  // Work on events from yesterday (let today accumulate)
  const refDate = targetDate || new Date();
  const windowStart = new Date(refDate);
  windowStart.setDate(windowStart.getDate() - 1);
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = new Date(windowStart);
  windowEnd.setDate(windowEnd.getDate() + 1);

  console.log(`[qualify] Processing plays from ${windowStart.toISOString()} to ${windowEnd.toISOString()}`);

  let cursor: string | undefined;
  let processed = 0;
  let flagged = 0;
  let clean = 0;
  let errors = 0;

  // Build fraud map: userId:isrc → count in rolling 1hr windows
  // We'll use the DB to do this per batch for memory efficiency

  while (true) {
    const batch = await prisma.playEvent.findMany({
      where: {
        processedAt: null,
        playedAt: { gte: windowStart, lt: windowEnd },
      },
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        isrc: true,
        userId: true,
        ipHash: true,
        completionPct: true,
        fraudScore: true,
        flagged: true,
        playedAt: true,
      },
    });

    if (batch.length === 0) break;
    cursor = batch[batch.length - 1].id;

    const toFlag: string[] = [];
    const toClean: string[] = [];

    for (const event of batch) {
      try {
        // Rule 4: Skip-plays (< 5% completion) are not fraud, just not qualified
        // They were already written with qualified=false if duration < 30s
        // but double-check completion
        if (event.completionPct !== null && event.completionPct < 0.05) {
          toFlag.push(event.id);
          continue;
        }

        // If already flagged by ingest quick-check, check if the score holds
        if (event.flagged) {
          toFlag.push(event.id);
          continue;
        }

        // Rule 2: same user × same ISRC > 3 in 1hr
        if (event.userId) {
          const hourStart = new Date(event.playedAt.getTime() - 60 * 60 * 1000);
          const userHourCount = await prisma.playEvent.count({
            where: {
              userId: event.userId,
              isrc: event.isrc,
              playedAt: { gte: hourStart, lte: event.playedAt },
            },
          });
          if (userHourCount > 3) {
            toFlag.push(event.id);
            continue;
          }
        }

        // Rule 3: same IP × same ISRC > 5 in 1hr
        if (event.ipHash) {
          const hourStart = new Date(event.playedAt.getTime() - 60 * 60 * 1000);
          const ipHourCount = await prisma.playEvent.count({
            where: {
              ipHash: event.ipHash,
              isrc: event.isrc,
              playedAt: { gte: hourStart, lte: event.playedAt },
            },
          });
          if (ipHourCount > 5) {
            toFlag.push(event.id);
            continue;
          }
        }

        toClean.push(event.id);
      } catch (err) {
        errors++;
        console.error(`[qualify] Error processing event ${event.id}:`, err);
      }
    }

    // Batch update — flag suspicious
    if (toFlag.length > 0) {
      await prisma.playEvent.updateMany({
        where: { id: { in: toFlag } },
        data: { flagged: true, processedAt: new Date() },
      });
      flagged += toFlag.length;
    }

    // Batch update — mark clean as processed
    if (toClean.length > 0) {
      await prisma.playEvent.updateMany({
        where: { id: { in: toClean } },
        data: { processedAt: new Date() },
      });
      clean += toClean.length;
    }

    processed += batch.length;
    console.log(`[qualify] Batch done: ${processed} processed, ${flagged} flagged, ${clean} clean`);
  }

  const durationMs = Date.now() - start;
  console.log(`[qualify] Complete in ${durationMs}ms: ${processed} total, ${flagged} flagged, ${clean} clean, ${errors} errors`);

  return { processed, flagged, clean, errors, durationMs };
}
