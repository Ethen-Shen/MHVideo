import { Request, Response } from 'express';

// Controller placeholders — to be implemented

export const healthCheck = (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
};

// TODO: Implement controllers
export * from './auth.controller';
// export * from './video.controller';
// export * from './series.controller';
// export * from './category.controller';
// export * from './comment.controller';
// export * from './user.controller';
