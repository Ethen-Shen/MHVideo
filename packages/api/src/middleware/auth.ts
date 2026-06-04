import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/jwt';

export interface AuthPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    _res.status(401).json({ code: 401, message: 'Authentication required' });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = verifyToken(token) as TokenPayload;
    req.user = { userId: decoded.userId, role: decoded.role ?? 'user' };
    next();
  } catch {
    _res.status(401).json({ code: 401, message: 'Invalid or expired token' });
  }
}
