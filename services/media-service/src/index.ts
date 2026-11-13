import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
}));
app.use(express.json());

// Local upload directory (swap for S3/Backblaze in production)
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/mhc-uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer — disk storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const id = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    if (/^(audio|video|image)\//.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio, video, and image files are allowed'));
    }
  },
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'media-service', timestamp: new Date().toISOString() });
});

// ── Upload ────────────────────────────────────────────────────────────────────
app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { artistId, title, description, type } = req.body;
    const fileId = path.basename(req.file.filename, path.extname(req.file.filename));

    const record = {
      id: fileId,
      artistId: artistId || null,
      title: title || req.file.originalname,
      description: description || null,
      type: type || (req.file.mimetype.startsWith('video') ? 'video' : 'audio'),
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      status: 'uploaded',
      createdAt: new Date().toISOString(),
    };

    console.log('[media-service] upload accepted', { fileId, title, type });

    return res.status(201).json({
      id: fileId,
      status: 'uploaded',
      message: 'File uploaded successfully',
      data: record,
    });
  } catch (err) {
    console.error('[media-service] upload error', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// ── Get file info ─────────────────────────────────────────────────────────────
app.get('/info/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.startsWith(id));
  if (files.length === 0) {
    return res.status(404).json({ error: 'Media not found' });
  }
  const file = files[0];
  const stat = fs.statSync(path.join(UPLOAD_DIR, file));
  return res.json({ id, filename: file, size: stat.size, createdAt: stat.birthtime });
});

// ── Stream / serve file ───────────────────────────────────────────────────────
app.get('/stream/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.startsWith(id));
  if (files.length === 0) {
    return res.status(404).json({ error: 'Media not found' });
  }
  const filePath = path.join(UPLOAD_DIR, files[0]);
  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'application/octet-stream',
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'application/octet-stream',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`[media-service] running on port ${PORT}`);
});

export default app;
