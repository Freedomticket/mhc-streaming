/**
 * DDEX ERN (Electronic Release Notification) Generator
 * Version: ERN 4.1 — the current standard accepted by all major PROs,
 * distributors, and SoundExchange.
 *
 * What this generates:
 *   A DDEX UsageReport XML file covering one calendar month of plays.
 *   Each <SoundRecording> in the report maps to one ISRC with:
 *     - Total qualified plays (called "Usages" in DDEX)
 *     - Country breakdown
 *     - Subscription tier breakdown (for weighted royalty calc)
 *
 * Who uses this file:
 *   - Distributors (DistroKid, TuneCore, CD Baby) — they forward to labels
 *   - PROs (ASCAP, BMI) — they pay composition royalties to songwriters
 *   - SoundExchange — they pay master + performer royalties for digital perf
 *
 * DDEX spec: https://ddex.net/intellectual-property/standards/
 * ERN 4.1 message schema is public — this implementation covers the
 * UsageReport subset, not the full Release notification.
 */

import { createHash } from 'crypto';
import { prisma } from '@mhc/database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const MHC_PARTY_ID = process.env.DDEX_PARTY_ID || 'PADPIDA2024999999O'; // Replace with real DDEX party ID
const MHC_PARTY_NAME = 'Most High Creation Streaming';
const SCHEMA_VERSION = 'ERN/4.1';

// ── Types ─────────────────────────────────────────────────────────────────────

interface IsrcUsage {
  isrc: string;
  trackTitle: string | null;
  artistName: string | null;
  totalPlays: number;
  qualifiedPlays: number;
  uniqueListeners: number;
  byCountry: Record<string, number>;
  byTier: Record<string, number>;
}

interface DdexReportInput {
  periodStart: Date;
  periodEnd: Date;
  reportId?: string;
}

interface DdexReportOutput {
  xml: string;
  messageId: string;
  stats: {
    totalPlays: number;
    qualifiedPlays: number;
    uniqueIsrcs: number;
    uniqueArtists: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function xmlEscape(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isoDateTime(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Generate a globally unique DDEX message ID */
function generateMessageId(periodStart: Date, periodEnd: Date): string {
  const ts = Date.now().toString(36).toUpperCase();
  const hash = createHash('sha256')
    .update(`${MHC_PARTY_ID}-${isoDate(periodStart)}-${isoDate(periodEnd)}-${ts}`)
    .digest('hex')
    .slice(0, 12)
    .toUpperCase();
  return `${MHC_PARTY_ID}-${isoDate(periodStart).replace(/-/g, '')}-${hash}`;
}

// ── Data collection ───────────────────────────────────────────────────────────

async function collectUsageData(periodStart: Date, periodEnd: Date): Promise<IsrcUsage[]> {
  // Aggregate clean, qualified plays by ISRC for the period
  const rawAgg = await prisma.playEvent.groupBy({
    by: ['isrc'],
    where: {
      qualified: true,
      flagged: false,
      processedAt: { not: null },
      playedAt: { gte: periodStart, lt: periodEnd },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  if (rawAgg.length === 0) return [];

  const isrcs = rawAgg.map((r: { isrc: string; _count: { id: number } }) => r.isrc);

  // Pull total (including flagged) for the total vs qualified split
  const totalAgg = await prisma.playEvent.groupBy({
    by: ['isrc'],
    where: { isrc: { in: isrcs }, playedAt: { gte: periodStart, lt: periodEnd } },
    _count: { id: true },
  });
  const totalMap: Record<string, number> = {};
  for (const r of totalAgg) totalMap[r.isrc] = (r._count as any).id;

  // Country breakdown per ISRC
  const countryAgg = await prisma.playEvent.groupBy({
    by: ['isrc', 'country'],
    where: {
      isrc: { in: isrcs },
      qualified: true,
      flagged: false,
      country: { not: null },
      playedAt: { gte: periodStart, lt: periodEnd },
    },
    _count: { id: true },
  });

  // Tier breakdown per ISRC
  const tierAgg = await prisma.playEvent.groupBy({
    by: ['isrc', 'subscriptionTier'],
    where: {
      isrc: { in: isrcs },
      qualified: true,
      flagged: false,
      playedAt: { gte: periodStart, lt: periodEnd },
    },
    _count: { id: true },
  });

  // Unique listener count per ISRC
  const listenerAgg = await prisma.playEvent.groupBy({
    by: ['isrc', 'userId'],
    where: {
      isrc: { in: isrcs },
      qualified: true,
      flagged: false,
      userId: { not: null },
      playedAt: { gte: periodStart, lt: periodEnd },
    },
    _count: { id: true },
  });
  const listenerCountMap: Record<string, Set<string>> = {};
  for (const r of listenerAgg as Array<{ isrc: string; userId: string | null; _count: { id: number } }>) {
    if (!listenerCountMap[r.isrc]) listenerCountMap[r.isrc] = new Set();
    if (r.userId) listenerCountMap[r.isrc].add(r.userId);
  }

  // Look up Track/Artist metadata for each ISRC
  const trackMeta = await prisma.track.findMany({
    where: { isrc: { in: isrcs } },
    select: { isrc: true, title: true, userId: true },
  });
  const trackMap: Record<string, { title: string; userId: string }> = {};
  for (const t of trackMeta) {
    if (t.isrc) trackMap[t.isrc] = { title: t.title, userId: t.userId };
  }

  // Look up Artist names
  const artistMeta = await prisma.artist.findMany({
    where: { isrc: { in: isrcs } },
    select: { isrc: true, name: true },
  });
  const artistMap: Record<string, string> = {};
  for (const a of artistMeta) {
    if (a.isrc) artistMap[a.isrc] = a.name;
  }

  // Assemble
  const usages: IsrcUsage[] = rawAgg.map((r: { isrc: string; _count: { id: number } }) => {
    const byCountry: Record<string, number> = {};
    for (const c of countryAgg.filter((x: { isrc: string }) => x.isrc === r.isrc)) {
      const cc = c as { isrc: string; country: string | null; _count: { id: number } };
      if (cc.country) byCountry[cc.country] = cc._count.id;
    }

    const byTier: Record<string, number> = {};
    for (const t of tierAgg.filter((x: { isrc: string }) => x.isrc === r.isrc)) {
      const tt = t as { isrc: string; subscriptionTier: string | null; _count: { id: number } };
      const tier = tt.subscriptionTier || 'UNKNOWN';
      byTier[tier] = tt._count.id;
    }

    return {
      isrc: r.isrc,
      trackTitle: trackMap[r.isrc]?.title || null,
      artistName: artistMap[r.isrc] || null,
      totalPlays: totalMap[r.isrc] || r._count.id,
      qualifiedPlays: r._count.id,
      uniqueListeners: listenerCountMap[r.isrc]?.size || 0,
      byCountry,
      byTier,
    };
  });

  return usages;
}

// ── XML generation ────────────────────────────────────────────────────────────

function buildUsageReportXml(
  messageId: string,
  periodStart: Date,
  periodEnd: Date,
  usages: IsrcUsage[]
): string {
  const now = new Date();

  const usageBlocks = usages.map(u => {
    // Country usage breakdown
    const countryUsages = Object.entries(u.byCountry)
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => `
        <Usage>
          <TerritoryCode>${xmlEscape(country)}</TerritoryCode>
          <UseType>NonInteractiveStream</UseType>
          <NumberOfStreams>${count}</NumberOfStreams>
        </Usage>`)
      .join('');

    // Tier breakdown as DDEX CommercialModelType
    const tierMapping: Record<string, string> = {
      FREE: 'AdSupportedModel',
      INFERNO: 'SubscriptionModel',
      PURGATORIO: 'SubscriptionModel',
      PARADISO: 'SubscriptionModel',
      UNKNOWN: 'AdSupportedModel',
    };

    const tierUsages = Object.entries(u.byTier)
      .map(([tier, count]) => `
        <Usage>
          <CommercialModelType>${tierMapping[tier] || 'SubscriptionModel'}</CommercialModelType>
          <UseType>NonInteractiveStream</UseType>
          <NumberOfStreams>${count}</NumberOfStreams>
        </Usage>`)
      .join('');

    return `
    <!-- ISRC: ${xmlEscape(u.isrc)} -->
    <SoundRecordingUsage>
      <SoundRecordingId>
        <ISRC>${xmlEscape(u.isrc)}</ISRC>
      </SoundRecordingId>
      ${u.trackTitle ? `<ReferenceTitle><TitleText>${xmlEscape(u.trackTitle)}</TitleText></ReferenceTitle>` : ''}
      ${u.artistName ? `<DisplayArtist><PartyName><FullName>${xmlEscape(u.artistName)}</FullName></PartyName></DisplayArtist>` : ''}

      <!-- Total qualified plays this period -->
      <OverallUsage>
        <UseType>NonInteractiveStream</UseType>
        <NumberOfStreams>${u.qualifiedPlays}</NumberOfStreams>
        <NumberOfListeners>${u.uniqueListeners}</NumberOfListeners>
      </OverallUsage>

      <!-- Country breakdown -->
      <TerritoryUsages>${countryUsages}
      </TerritoryUsages>

      <!-- Commercial model breakdown -->
      <CommercialModelUsages>${tierUsages}
      </CommercialModelUsages>
    </SoundRecordingUsage>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage
  xmlns:ern="http://ddex.net/xml/ern/41"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://ddex.net/xml/ern/41 http://ddex.net/xml/ern/41/release-notification.xsd"
  MessageSchemaVersionId="${SCHEMA_VERSION}"
  ReleaseProfileVersionId="UsageReport/1.0">

  <MessageHeader>
    <MessageThreadId>${xmlEscape(messageId)}</MessageThreadId>
    <MessageId>${xmlEscape(messageId)}</MessageId>
    <MessageSender>
      <PartyId>${xmlEscape(MHC_PARTY_ID)}</PartyId>
      <PartyName>
        <FullName>${xmlEscape(MHC_PARTY_NAME)}</FullName>
      </PartyName>
    </MessageSender>
    <MessageRecipient>
      <PartyId>PADPIDA_PRO_GENERIC</PartyId>
      <PartyName>
        <FullName>Recipient PRO/Distributor</FullName>
      </PartyName>
    </MessageRecipient>
    <MessageCreatedDateTime>${isoDateTime(now)}</MessageCreatedDateTime>
    <MessageControlType>LiveMessage</MessageControlType>
  </MessageHeader>

  <UsageReport>
    <ReportPeriodStartDate>${isoDate(periodStart)}</ReportPeriodStartDate>
    <ReportPeriodEndDate>${isoDate(periodEnd)}</ReportPeriodEndDate>
    <ReportGeneratedDateTime>${isoDateTime(now)}</ReportGeneratedDateTime>
    <ServiceDescription>
      <ServiceName>${xmlEscape(MHC_PARTY_NAME)}</ServiceName>
      <ServiceType>NonInteractiveStreamingService</ServiceType>
    </ServiceDescription>

    <!-- ${usages.length} unique ISRCs reported for this period -->
    <SoundRecordingUsages>
${usageBlocks}
    </SoundRecordingUsages>

  </UsageReport>

</ern:NewReleaseMessage>`;
}

// ── SoundExchange CSV format ──────────────────────────────────────────────────
// SoundExchange requires a specific CSV layout (different from DDEX)

function buildSoundExchangeCsv(
  periodStart: Date,
  periodEnd: Date,
  usages: IsrcUsage[]
): string {
  const lines: string[] = [
    // Header row (SoundExchange spec)
    'Service Name,ISRC,Title,Featured Artist,Total Plays,Unique Listeners,Period Start,Period End',
    ...usages.map(u =>
      [
        `"${MHC_PARTY_NAME}"`,
        `"${u.isrc}"`,
        `"${(u.trackTitle || '').replace(/"/g, '""')}"`,
        `"${(u.artistName || '').replace(/"/g, '""')}"`,
        u.qualifiedPlays.toString(),
        u.uniqueListeners.toString(),
        isoDate(periodStart),
        isoDate(periodEnd),
      ].join(',')
    ),
  ];
  return lines.join('\n');
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateDdexReport(input: DdexReportInput): Promise<DdexReportOutput> {
  const { periodStart, periodEnd } = input;

  console.log(`[ddex] Generating ERN report: ${isoDate(periodStart)} → ${isoDate(periodEnd)}`);

  const usages = await collectUsageData(periodStart, periodEnd);
  if (usages.length === 0) {
    console.warn('[ddex] No qualified plays found for this period');
  }

  const messageId = input.reportId || generateMessageId(periodStart, periodEnd);
  const xml = buildUsageReportXml(messageId, periodStart, periodEnd, usages);
  const csv = buildSoundExchangeCsv(periodStart, periodEnd, usages);

  // Count unique artists
  const uniqueArtists = new Set(usages.map(u => u.artistName).filter(Boolean)).size;
  const totalPlays = usages.reduce((sum, u) => sum + u.totalPlays, 0);
  const qualifiedPlays = usages.reduce((sum, u) => sum + u.qualifiedPlays, 0);

  // Write files to reports directory
  const reportsDir = process.env.REPORTS_DIR || '/tmp/mhc-reports';
  const periodLabel = `${isoDate(periodStart).replace(/-/g, '')}_${isoDate(periodEnd).replace(/-/g, '')}`;

  try {
    await mkdir(reportsDir, { recursive: true });

    const xmlPath = join(reportsDir, `ddex_ern_${periodLabel}_${messageId.slice(-8)}.xml`);
    const csvPath = join(reportsDir, `soundexchange_${periodLabel}.csv`);

    await writeFile(xmlPath, xml, 'utf8');
    await writeFile(csvPath, csv, 'utf8');

    console.log(`[ddex] Wrote XML → ${xmlPath}`);
    console.log(`[ddex] Wrote CSV → ${csvPath}`);

    // Persist report manifest to DB
    const checksum = createHash('sha256').update(xml).digest('hex');
    const fileSize = Buffer.byteLength(xml, 'utf8');

    await prisma.ddexReport.create({
      data: {
        reportType: 'DDEX_ERN',
        formatVersion: SCHEMA_VERSION,
        messageId,
        periodStart,
        periodEnd,
        totalPlays,
        qualifiedPlays,
        uniqueIsrcs: usages.length,
        uniqueArtists,
        filePath: xmlPath,
        fileSize,
        checksum,
        status: 'generated',
        recipient: null, // Set when actually delivered
        metadata: {
          csvPath,
          generatedAt: new Date().toISOString(),
          isrcCount: usages.length,
        },
      },
    });

    console.log(`[ddex] Report manifest saved to DB (messageId: ${messageId})`);
  } catch (err) {
    console.error('[ddex] Failed to write report files:', err);
    // Don't throw — still return the XML in memory
  }

  return {
    xml,
    messageId,
    stats: {
      totalPlays,
      qualifiedPlays,
      uniqueIsrcs: usages.length,
      uniqueArtists,
    },
  };
}

/** Convenience: generate report for a specific calendar month */
export async function generateMonthlyReport(year: number, month: number): Promise<DdexReportOutput> {
  const periodStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const periodEnd = new Date(year, month, 0, 23, 59, 59, 999); // last day of month
  return generateDdexReport({ periodStart, periodEnd });
}
