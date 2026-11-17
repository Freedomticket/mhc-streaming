/**
 * DDEX Report Management Routes
 *
 * GET  /api/reports              — List all generated reports
 * POST /api/reports/generate     — Generate report for a period (admin)
 * GET  /api/reports/:id          — Get report details + download XML
 * GET  /api/reports/:id/xml      — Download the raw DDEX XML
 * GET  /api/reports/:id/csv      — Download the SoundExchange CSV
 * POST /api/reports/:id/deliver  — Mark as delivered (admin)
 */

import { Router, Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { prisma } from '@mhc/database';
import { generateDdexReport, generateMonthlyReport } from '../ddex/generate-ern';

const router = Router();

// ── GET /api/reports ──────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status, limit = '20' } = req.query;

    const reports = await prisma.ddexReport.findMany({
      where: {
        ...(type ? { reportType: type as string } : {}),
        ...(status ? { status: status as string } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit as string, 10) || 20, 100),
      select: {
        id: true,
        reportType: true,
        formatVersion: true,
        messageId: true,
        periodStart: true,
        periodEnd: true,
        totalPlays: true,
        qualifiedPlays: true,
        uniqueIsrcs: true,
        uniqueArtists: true,
        status: true,
        deliveredAt: true,
        recipient: true,
        createdAt: true,
        fileSize: true,
      },
    });

    res.json({ success: true, reports, count: reports.length });
  } catch (error) {
    console.error('[reports] list error:', error);
    res.status(500).json({ error: 'Failed to list reports', code: 'SERVER_ERROR' });
  }
});

// ── POST /api/reports/generate ────────────────────────────────────────────────

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { year, month, periodStart, periodEnd } = req.body;

    let start: Date;
    let end: Date;

    if (year && month) {
      // Generate for a specific calendar month
      start = new Date(year, month - 1, 1, 0, 0, 0, 0);
      end = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (periodStart && periodEnd) {
      start = new Date(periodStart);
      end = new Date(periodEnd);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid period dates', code: 'INVALID_DATES' });
      }
    } else {
      // Default: last calendar month
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    console.log(`[reports] Generating DDEX report: ${start.toISOString()} → ${end.toISOString()}`);

    const result = await generateDdexReport({ periodStart: start, periodEnd: end });

    res.status(201).json({
      success: true,
      messageId: result.messageId,
      stats: result.stats,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    });
  } catch (error: any) {
    console.error('[reports] generate error:', error);
    res.status(500).json({ error: 'Failed to generate report', code: 'SERVER_ERROR', detail: error.message });
  }
});

// ── GET /api/reports/:id ──────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const report = await prisma.ddexReport.findUnique({
      where: { id: req.params.id },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found', code: 'NOT_FOUND' });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report', code: 'SERVER_ERROR' });
  }
});

// ── GET /api/reports/:id/xml ──────────────────────────────────────────────────

router.get('/:id/xml', async (req: Request, res: Response) => {
  try {
    const report = await prisma.ddexReport.findUnique({
      where: { id: req.params.id },
      select: { filePath: true, messageId: true, periodStart: true, periodEnd: true },
    });

    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (!report.filePath) return res.status(404).json({ error: 'Report file not found on disk' });

    const xml = await readFile(report.filePath, 'utf8');
    const filename = `ddex_ern_${report.messageId}.xml`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(xml);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Report file not found on disk', code: 'FILE_NOT_FOUND' });
    }
    res.status(500).json({ error: 'Failed to read report file', code: 'SERVER_ERROR' });
  }
});

// ── GET /api/reports/:id/csv ──────────────────────────────────────────────────

router.get('/:id/csv', async (req: Request, res: Response) => {
  try {
    const report = await prisma.ddexReport.findUnique({
      where: { id: req.params.id },
      select: { metadata: true, messageId: true, periodStart: true },
    });

    if (!report) return res.status(404).json({ error: 'Report not found' });

    const csvPath = (report.metadata as any)?.csvPath;
    if (!csvPath) return res.status(404).json({ error: 'CSV not available for this report' });

    const csv = await readFile(csvPath, 'utf8');
    const month = new Date(report.periodStart).toISOString().slice(0, 7);
    const filename = `soundexchange_${month}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'CSV file not found on disk', code: 'FILE_NOT_FOUND' });
    }
    res.status(500).json({ error: 'Failed to read CSV file', code: 'SERVER_ERROR' });
  }
});

// ── POST /api/reports/:id/deliver ─────────────────────────────────────────────

router.post('/:id/deliver', async (req: Request, res: Response) => {
  try {
    const { recipient } = req.body;

    const report = await prisma.ddexReport.update({
      where: { id: req.params.id },
      data: {
        status: 'delivered',
        deliveredAt: new Date(),
        recipient: recipient || null,
      },
    });

    res.json({ success: true, report });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Report not found' });
    res.status(500).json({ error: 'Failed to update delivery status', code: 'SERVER_ERROR' });
  }
});

export default router;
