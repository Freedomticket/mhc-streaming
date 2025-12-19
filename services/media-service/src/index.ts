import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS, randomString, sanitizeFilename } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Initialize services
const storage = new Storage();
const pubsub = new PubSub();
const transcoder = new VideoTranscoderServiceClient();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redis = createClient({
  url: process.env.REDIS_URL,
});
redis.connect().catch(console.error);

// Storage buckets
const uploadsBucket = storage.bucket(process.env.UPLOADS_BUCKET || 'mhc-streaming-uploads');
const mediaBucket = storage.bucket(process.env.MEDIA_BUCKET || 'mhc-streaming-hls-segments');

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /audio|video|image/;
    const mimeType = allowedTypes.test(file.mimetype);
    
    if (mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only audio, video, and image files are allowed'));
    }
  },
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'media-service' });
});

// Upload media file
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { artistId, title, description, type } = req.body;
    const fileId = uuidv4();
    const fileName = `${fileId}-${req.file.originalname}`;
    const file = uploadsBucket.file(fileName);

    // Upload to Cloud Storage
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          artistId,
          title,
          type,
          originalName: req.file.originalname,
        },
      },
    });

    // Create database entry
    const result = await db.query(
      `INSERT INTO ${type === 'audio' ? 'songs' : 'videos'} 
       (id, artist_id, title, description, original_file_url, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [fileId, artistId, title, description, `gs://${uploadsBucket.name}/${fileName}`]
    );

    // Publish message for processing
    await pubsub.topic('upload-events').publishMessage({
      data: Buffer.from(JSON.stringify({
        fileId,
        fileName,
        artistId,
        title,
        type,
        mimetype: req.file.mimetype,
        bucket: uploadsBucket.name,
      })),
    });

    res.json({
      id: fileId,
      status: 'uploaded',
      message: 'File uploaded successfully, processing started',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Process uploaded media (called by Pub/Sub)
app.post('/process', async (req: Request, res: Response) => {
  try {
    const { fileId, fileName, type, mimetype, bucket } = req.body;

    if (type === 'audio' || mimetype.startsWith('audio/')) {
      await processAudioFile(fileId, fileName, bucket);
    } else if (type === 'video' || mimetype.startsWith('video/')) {
      await processVideoFile(fileId, fileName, bucket);
    }

    res.json({ status: 'processing started', fileId });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Process audio files
async function processAudioFile(fileId: string, fileName: string, bucketName: string) {
  const inputFile = storage.bucket(bucketName).file(fileName);
  const tempFilePath = `/tmp/${fileName}`;
  
  // Download file
  await inputFile.download({ destination: tempFilePath });

  const outputs = {
    mp3: `${fileId}/audio.mp3`,
    aac: `${fileId}/audio.aac`,
    opus: `${fileId}/audio.opus`,
  };

  // Generate multiple formats
  for (const [format, outputPath] of Object.entries(outputs)) {
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .audioCodec(getAudioCodec(format))
        .audioBitrate('320k')
        .audioFrequency(44100)
        .audioChannels(2)
        .on('end', resolve)
        .on('error', reject)
        .save(`/tmp/${outputPath}`);
    });

    // Upload processed file
    const processedFile = mediaBucket.file(outputPath);
    await processedFile.save(require('fs').readFileSync(`/tmp/${outputPath}`), {
      metadata: {
        contentType: getContentType(format),
      },
    });

    outputs[format] = `gs://${mediaBucket.name}/${outputPath}`;
  }

  // Generate waveform thumbnail
  const waveformPath = await generateWaveform(tempFilePath, fileId);
  
  // Update database with processed URLs
  await db.query(
    `UPDATE songs 
     SET processed_file_urls = $1, cover_image_url = $2, updated_at = NOW()
     WHERE id = $3`,
    [JSON.stringify(outputs), waveformPath, fileId]
  );

  // Cleanup temp files
  require('fs').unlinkSync(tempFilePath);
}

// Process video files with Google Transcoder API
async function processVideoFile(fileId: string, fileName: string, bucketName: string) {
  const inputUri = `gs://${bucketName}/${fileName}`;
  const outputUriPrefix = `gs://${mediaBucket.name}/${fileId}/`;

  // Create transcoding job
  const request = {
    parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/us-central1`,
    job: {
      inputUri,
      outputUri: outputUriPrefix,
      templateId: 'preset/web-hd',
      config: {
        inputs: [{ key: 'input0', uri: inputUri }],
        editList: [{ key: 'atom0', inputs: ['input0'] }],
        output: {
          uri: outputUriPrefix,
        },
        elementaryStreams: [
          {
            key: 'video-stream0',
            videoStream: {
              h264: {
                heightPixels: 1080,
                widthPixels: 1920,
                bitrateBps: 5000000,
                frameRate: 30,
              },
            },
          },
          {
            key: 'video-stream1',
            videoStream: {
              h264: {
                heightPixels: 720,
                widthPixels: 1280,
                bitrateBps: 3000000,
                frameRate: 30,
              },
            },
          },
          {
            key: 'video-stream2',
            videoStream: {
              h264: {
                heightPixels: 480,
                widthPixels: 854,
                bitrateBps: 1500000,
                frameRate: 30,
              },
            },
          },
          {
            key: 'audio-stream0',
            audioStream: {
              codec: 'aac',
              bitrateBps: 128000,
            },
          },
        ],
        muxStreams: [
          {
            key: 'sd',
            container: 'mp4',
            elementaryStreams: ['video-stream2', 'audio-stream0'],
          },
          {
            key: 'hd',
            container: 'mp4',
            elementaryStreams: ['video-stream1', 'audio-stream0'],
          },
          {
            key: 'full-hd',
            container: 'mp4',
            elementaryStreams: ['video-stream0', 'audio-stream0'],
          },
        ],
        manifests: [
          {
            fileName: 'manifest.m3u8',
            type: 'HLS',
            muxStreams: ['sd', 'hd', 'full-hd'],
          },
        ],
      },
    },
  };

  const [operation] = await transcoder.createJob(request);
  const [job] = await operation.promise();

  // Update database with job info
  await db.query(
    `UPDATE videos 
     SET hls_manifest_url = $1, updated_at = NOW()
     WHERE id = $2`,
    [`${outputUriPrefix}manifest.m3u8`, fileId]
  );

  console.log(`Transcoding job created: ${job.name}`);
}

// Generate audio waveform
async function generateWaveform(audioPath: string, fileId: string): Promise<string> {
  const waveformPath = `/tmp/${fileId}-waveform.png`;
  
  await new Promise((resolve, reject) => {
    ffmpeg(audioPath)
      .complexFilter([
        '[0:a]showwavespic=s=1200x300:colors=#FFFFFF[waveform]'
      ])
      .outputOptions(['-map', '[waveform]'])
      .on('end', resolve)
      .on('error', reject)
      .save(waveformPath);
  });

  // Upload waveform
  const waveformFile = mediaBucket.file(`${fileId}/waveform.png`);
  await waveformFile.save(require('fs').readFileSync(waveformPath), {
    metadata: {
      contentType: 'image/png',
    },
  });

  require('fs').unlinkSync(waveformPath);
  return `gs://${mediaBucket.name}/${fileId}/waveform.png`;
}

// Get media file info
app.get('/info/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    const table = type === 'video' ? 'videos' : 'songs';
    const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({ error: 'Failed to get media info' });
  }
});

// Helper functions
function getAudioCodec(format: string): string {
  switch (format) {
    case 'mp3': return 'libmp3lame';
    case 'aac': return 'aac';
    case 'opus': return 'libopus';
    default: return 'aac';
  }
}

function getContentType(format: string): string {
  switch (format) {
    case 'mp3': return 'audio/mpeg';
    case 'aac': return 'audio/aac';
    case 'opus': return 'audio/opus';
    default: return 'audio/aac';
  }
}

app.listen(PORT, () => {
  console.log(`Media Service running on port ${PORT}`);
});

export default app;