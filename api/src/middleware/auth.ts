import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Demo secret. In production this comes from an environment variable / secret store.
export const JWT_SECRET = process.env.JWT_SECRET || 'SyslaFynix-demo-secret';
export const TOKEN_TTL = '2h';

export interface AuthedRequest extends Request {
  userId?: string;
  role?: string;
}

export function signToken(payload: { sub: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

/** Rejects requests without a valid Bearer token. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
    req.userId = decoded.sub;
    req.role = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
