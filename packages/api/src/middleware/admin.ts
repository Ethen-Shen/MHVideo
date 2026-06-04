import { Request, Response, NextFunction } from 'express';
import { auth } from './auth';

export function admin(req: Request, res: Response, next: NextFunction): void {
  auth(req, res, () => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      res.status(403).json({ code: 403, message: 'Admin access required' });
      return;
    }
    next();
  });
}
