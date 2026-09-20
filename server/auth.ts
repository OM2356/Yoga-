import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, UserRecord } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'flowstate_secure_sovereign_secret_key_2026';

// Brute-force rate limiting: 5 attempts per 15 min
interface AttemptRecord {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

export function checkLoginRateLimit(key: string): { allowed: boolean; remaining: number; resetMinutes: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const existing = loginAttempts.get(key);

  if (!existing || now > existing.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: 4, resetMinutes: 15 };
  }

  if (existing.count >= 5) {
    const remainingTimeMin = Math.ceil((existing.resetAt - now) / (60 * 1000));
    return { allowed: false, remaining: 0, resetMinutes: remainingTimeMin };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(0, 5 - existing.count), resetMinutes: Math.ceil((existing.resetAt - now) / 60000) };
}

export function clearLoginRateLimit(key: string) {
  loginAttempts.delete(key);
}

// Password hashing
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

// Signed token issuance (stateless HMAC token)
export function signToken(payload: { userId: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const data = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${data}`)
    .digest('base64url');

  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, data, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${data}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) return null;

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

// Express authentication middleware
export interface AuthRequest extends Request {
  user?: UserRecord;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please sign in again.' });
  }

  const user = db.findUserById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  req.user = user;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      const user = db.findUserById(payload.userId);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
}
