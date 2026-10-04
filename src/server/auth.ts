import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { User } from '../types.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.cookies && req.cookies.rg_session) {
    return req.cookies.rg_session;
  }
  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const user = db.getSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ error: 'Your account has been deactivated by an administrator.' });
  }

  req.user = user;
  req.token = token;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access denied. Insufficient privileges.' });
    }
    next();
  });
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const user = db.getSession(token);
    if (user && user.status !== 'disabled') {
      req.user = user;
      req.token = token;
    }
  }
  next();
}
