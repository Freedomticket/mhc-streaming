/**
 * Founders Program Routes
 *
 * POST /api/v1/founders/apply   — Public. Submit founding artist application.
 * GET  /api/v1/founders/status  — Public. Check spots remaining + applicant status by email.
 * GET  /api/v1/founders/list    — Admin only. List all applications.
 * POST /api/v1/founders/:id/approve — Admin only. Approve an application.
 * POST /api/v1/founders/:id/reject  — Admin only. Reject an application.
 *
 * Founding Artist Benefit (permanent):
 *   isFounder = true on User model → 50% off all paid plans, forever.
 *   Applied at checkout time in billing.routes.ts via Stripe coupon or price override.
 */

import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { prisma } from '@mhc/database';
import { requireAuth } from '../middleware/requireAuth';
import rateLimit from 'express-rate-limit';

const router = Router();

const FOUNDER_LIMIT = 30;

// Rate limit applications — 3 per IP per hour (prevents spam)
const applyRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many applications from this IP. Please try again later.', code: 'RATE_LIMIT_FOUNDERS' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Email transport (lazy — only created when needed) ──────────────────────
function getMailTransport() {
  const user = process.env.NOTIFY_EMAIL_USER;
  const pass = process.env.NOTIFY_EMAIL_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

async function sendFounderNotification(application: {
  firstName: string;
  lastName: string;
  artistName: string;
  email: string;
  genre: string;
  links?: string | null;
  why: string;
  realm: string;
  appliedAt: Date;
  id: string;
}) {
  const transport = getMailTransport();
  if (!transport) {
    console.warn('[founders] NOTIFY_EMAIL_USER/PASS not set — skipping notification email');
    return;
  }

  const realmEmoji = application.realm === 'inferno' ? '🔥' : '✨';
  const spotsLeft = FOUNDER_LIMIT - (await prisma.founderApplication.count({ where: { status: { not: 'rejected' } } }));

  await transport.sendMail({
    from: `"MHC Streaming" <${process.env.NOTIFY_EMAIL_USER}>`,
    to: 'sovereignsoundpublishing@gmail.com',
    subject: `${realmEmoji} New Founder Application — ${application.artistName} (${application.genre})`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #0a0a0c; padding: 24px 28px; border-radius: 6px 6px 0 0;">
          <p style="color: #c9a84c; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;">MHC Streaming · Founding Artist Program</p>
          <h1 style="color: #e8e4dc; font-size: 22px; margin: 0;">${realmEmoji} New Application</h1>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 6px 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 130px;">Artist Name</td><td style="padding: 8px 0; font-weight: 600;">${application.artistName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Full Name</td><td style="padding: 8px 0;">${application.firstName} ${application.lastName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${application.email}">${application.email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Genre</td><td style="padding: 8px 0;">${application.genre}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Realm</td><td style="padding: 8px 0;">${realmEmoji} ${application.realm.charAt(0).toUpperCase() + application.realm.slice(1)}</td></tr>
            ${application.links ? `<tr><td style="padding: 8px 0; color: #6b7280;">Links</td><td style="padding: 8px 0;"><a href="${application.links}">${application.links}</a></td></tr>` : ''}
            <tr><td style="padding: 8px 0; color: #6b7280;">Applied</td><td style="padding: 8px 0;">${new Date(application.appliedAt).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Spots Left</td><td style="padding: 8px 0; font-weight: 600;">${spotsLeft} of ${FOUNDER_LIMIT}</td></tr>
          </table>

          <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 4px; border-left: 3px solid #0a0a0c;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em;">Why they want to join</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6;">${application.why.replace(/\n/g, '<br>')}</p>
          </div>

          <div style="margin-top: 24px; display: flex; gap: 12px;">
            <a href="mailto:${application.email}?subject=Welcome to MHC Streaming — Your Founding Artist Spot&body=Hi ${application.firstName},%0D%0A%0D%0AWelcome to MHC Streaming. You're in."
               style="display: inline-block; padding: 10px 20px; background: #0a0a0c; color: #c9a84c; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 600;">
              ✓ Reply to Approve
            </a>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">Application ID: ${application.id}</p>
        </div>
      </div>
    `,
  });
}

// ── POST /api/v1/founders/apply ────────────────────────────────────────────
router.post('/apply', applyRateLimit, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, artistName, email, genre, links, why, realm } = req.body;

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !artistName?.trim() || !email?.trim() || !genre?.trim() || !why?.trim() || !realm) {
      return res.status(400).json({ error: 'All required fields must be filled in.', code: 'MISSING_FIELDS' });
    }

    // Validate realm
    if (!['inferno', 'paradiso'].includes(realm)) {
      return res.status(400).json({ error: 'Invalid realm. Must be inferno or paradiso.', code: 'INVALID_REALM' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.', code: 'INVALID_EMAIL' });
    }

    // Check spots remaining (count non-rejected applications)
    const activeCount = await prisma.founderApplication.count({
      where: { status: { not: 'rejected' } },
    });

    if (activeCount >= FOUNDER_LIMIT) {
      return res.status(409).json({
        error: 'All founding spots have been filled.',
        code: 'SPOTS_FULL',
        message: 'The founding cohort is complete. Follow MHC Streaming for future opportunities.',
      });
    }

    // Check for duplicate email
    const existing = await prisma.founderApplication.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({
        error: 'An application from this email already exists.',
        code: 'DUPLICATE_EMAIL',
        status: existing.status,
        message: existing.status === 'approved'
          ? 'Your application has been approved. Check your email for next steps.'
          : existing.status === 'pending'
          ? 'Your application is under review. We\'ll be in touch within 3 business days.'
          : 'This application was not accepted. Contact us if you believe this is an error.',
      });
    }

    // Create application
    const application = await prisma.founderApplication.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        artistName: artistName.trim(),
        email: email.toLowerCase().trim(),
        genre: genre.trim(),
        links: links?.trim() || null,
        why: why.trim(),
        realm,
      },
    });

    // Send notification email (non-blocking — don't fail the request if email fails)
    sendFounderNotification(application).catch(err => {
      console.error('[founders] notification email failed:', err.message);
    });

    res.status(201).json({
      success: true,
      message: `Application received. We'll be in touch within 3 business days.`,
      applicationId: application.id,
      realm: application.realm,
      spotsRemaining: Math.max(0, FOUNDER_LIMIT - activeCount - 1),
    });
  } catch (error) {
    console.error('[founders] apply error:', error);
    res.status(500).json({ error: 'Failed to submit application. Please try again.', code: 'SERVER_ERROR' });
  }
});

// ── GET /api/v1/founders/status ────────────────────────────────────────────
// Public — check spots and optionally look up an application by email
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    const activeCount = await prisma.founderApplication.count({
      where: { status: { not: 'rejected' } },
    });

    const spotsRemaining = Math.max(0, FOUNDER_LIMIT - activeCount);
    const isFull = spotsRemaining === 0;

    let applicationStatus = null;
    if (email && typeof email === 'string') {
      const app = await prisma.founderApplication.findUnique({
        where: { email: email.toLowerCase() },
        select: { status: true, realm: true, appliedAt: true },
      });
      if (app) applicationStatus = app;
    }

    res.json({
      success: true,
      spotsTotal: FOUNDER_LIMIT,
      spotsRemaining,
      isFull,
      applicationStatus,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status.', code: 'SERVER_ERROR' });
  }
});

// ── GET /api/v1/founders/list (admin) ──────────────────────────────────────
router.get('/list', requireAuth, async (req: Request, res: Response) => {
  try {
    // TODO: add requireAdmin middleware when admin role is fully wired
    const { status } = req.query;

    const applications = await prisma.founderApplication.findMany({
      where: status ? { status: status as string } : undefined,
      orderBy: { appliedAt: 'asc' },
    });

    const counts = await prisma.founderApplication.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    res.json({
      success: true,
      applications,
      summary: {
        total: applications.length,
        byStatus: Object.fromEntries(counts.map(c => [c.status, c._count.id])),
        spotsRemaining: Math.max(0, FOUNDER_LIMIT - applications.filter(a => a.status !== 'rejected').length),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list applications.', code: 'SERVER_ERROR' });
  }
});

// ── POST /api/v1/founders/:id/approve (admin) ──────────────────────────────
router.post('/:id/approve', requireAuth, async (req: Request, res: Response) => {
  try {
    const application = await prisma.founderApplication.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: req.userId,
      },
    });

    // If the artist already has a user account, mark them as founder immediately
    if (application.userId) {
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          isFounder: true,
          founderRealm: application.realm,
        },
      });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve application.', code: 'SERVER_ERROR' });
  }
});

// ── POST /api/v1/founders/:id/reject (admin) ───────────────────────────────
router.post('/:id/reject', requireAuth, async (req: Request, res: Response) => {
  try {
    const application = await prisma.founderApplication.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: req.userId,
      },
    });

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject application.', code: 'SERVER_ERROR' });
  }
});

export default router;
