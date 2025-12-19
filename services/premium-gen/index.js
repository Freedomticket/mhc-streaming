/**
 * Premium generation microservice — Fal.ai SDXL integration
 *
 * Env:
 *  REDIS_URL, FAL_KEY, FAL_MODEL_SLUG (e.g. fal-ai/fast-sdxl),
 *  STORAGE_TYPE (gcs|s3|local), STORAGE_BUCKET, PUBLIC_BASE_URL
 */
const express = require('express');
const bodyParser = require('body-parser');
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { uploadToGCS, uploadToS3, uploadToLocal } = require('./storage-adapters');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const FAL_KEY = process.env.FAL_KEY;
const FAL_MODEL = process.env.FAL_MODEL_SLUG || 'fal-ai/fast-sdxl';
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const OUT_DIR = process.env.OUT_DIR || '/tmp/generation_results';
const PORT = process.env.PORT || 8081;

if (!FAL_KEY) {
  console.error('FAL_KEY is not set. Aborting.');
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const connection = new IORedis(REDIS_URL);
const queue = new Queue('premium-gen', { connection });

const app = express();
app.use(bodyParser.json());

function ensureArtist(req, res, next) {
  const artistId = req.headers['x-artist-id'];
  if (!artistId) return res.status(401).json({ error: 'missing artist id header' });
  req.artistId = artistId;
  next();
}

app.post('/generate', ensureArtist, async (req, res) => {
  const { prompt, negative_prompt, width = 1024, height = 1024, steps = 28, cfg_scale = 7.0 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  const job = await queue.add('generate', {
    artistId: req.artistId,
    prompt,
    negative_prompt,
    width,
    height,
    steps,
    cfg_scale
  });
  res.json({ jobId: job.id });
});

app.get('/status/:id', async (req, res) => {
  const job = await queue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'not found' });
  const state = await job.getState();
  res.json({ id: job.id, state, progress: job.progress, returnvalue: job.returnvalue });
});

const worker = new Worker('premium-gen', async job => {
  const { prompt, negative_prompt, width, height, steps, cfg_scale, artistId } = job.data;
  console.log('Processing job', job.id);

  const modelPath = `https://fal.run/${FAL_MODEL}`;
  const body = {
    prompt,
    negative_prompt: negative_prompt || '',
    width,
    height,
    steps,
    guidance_scale: cfg_scale
  };

  const resp = await fetch(modelPath, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    timeout: 120000
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error('Fal API error', resp.status, txt);
    throw new Error('Fal API error');
  }

  const contentType = resp.headers.get('content-type') || '';
  let stored = [];
  if (contentType.includes('application/json')) {
    const json = await resp.json();
    const outputs = json.output || json.outputs || json.result || [];
    for (let i = 0; i < outputs.length; i++) {
      const item = outputs[i];
      if (typeof item === 'string' && item.startsWith('http')) {
        const r = await fetch(item);
        const buf = await r.buffer();
        const filename = `gen-${job.id}-${i}.png`;
        const localPath = path.join(OUT_DIR, filename);
        fs.writeFileSync(localPath, buf);
        const url = await storeFile(localPath, filename);
        stored.push(url);
      } else if (typeof item === 'string' && item.startsWith('data:')) {
        const m = item.match(/^data:(.+);base64,(.+)$/);
        if (m) {
          const buf = Buffer.from(m[2], 'base64');
          const filename = `gen-${job.id}-${i}.png`;
          const localPath = path.join(OUT_DIR, filename);
          fs.writeFileSync(localPath, buf);
          const url = await storeFile(localPath, filename);
          stored.push(url);
        }
      }
    }
  } else {
    const buffer = await resp.buffer();
    const filename = `gen-${job.id}-0.png`;
    const localPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(localPath, buffer);
    const url = await storeFile(localPath, filename);
    stored.push(url);
  }

  const record = { jobId: job.id, artistId, prompt, stored, createdAt: new Date().toISOString() };
  console.log('Generation complete', record);
  return { stored };
}, { connection });

async function storeFile(localPath, filename) {
  if (STORAGE_TYPE === 'gcs') return uploadToGCS(localPath, filename);
  if (STORAGE_TYPE === 's3') return uploadToS3(localPath, filename);
  return uploadToLocal(localPath, filename);
}

app.listen(PORT, () => console.log('Premium service listening on', PORT));
