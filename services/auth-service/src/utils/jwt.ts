import jwt from 'jsonwebtoken';
import { JwtPayload } from '@mhc/common';

// Secrets are read lazily at call time, not at module load time.
// This avoids startup crashes when env vars are injected after module evaluation.

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable must be set');
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET environment variable must be set');
  return secret;
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, getRefreshSecret()) as JwtPayload;
}

export function generateTokens(payload: JwtPayload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
