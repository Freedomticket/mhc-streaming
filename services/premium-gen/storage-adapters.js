const path = require('path');
const { Storage } = require('@google-cloud/storage');
const AWS = require('aws-sdk');
const fs = require('fs');

const BUCKET = process.env.STORAGE_BUCKET || 'inferno-generated';

async function uploadToLocal(localPath, filename) {
  const outDir = process.env.LOCAL_OUT_DIR || path.join(__dirname, 'public_gen');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const dest = path.join(outDir, filename);
  fs.copyFileSync(localPath, dest);
  return `${process.env.PUBLIC_BASE_URL || 'https://example.com'}/gen/${filename}`;
}

async function uploadToGCS(localPath, filename) {
  const storage = new Storage();
  const bucket = storage.bucket(BUCKET);
  await bucket.upload(localPath, { destination: filename, public: true });
  return `https://storage.googleapis.com/${BUCKET}/${filename}`;
}

async function uploadToS3(localPath, filename) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  const fileContent = fs.readFileSync(localPath);
  await s3.putObject({
    Bucket: BUCKET,
    Key: filename,
    Body: fileContent,
    ACL: 'public-read',
    ContentType: 'image/png'
  }).promise();
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
}

module.exports = { uploadToGCS, uploadToS3, uploadToLocal };
