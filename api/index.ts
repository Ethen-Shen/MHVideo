// Vercel Serverless Function entry point
// Bridges monorepo packages/api Express app to Vercel deployment
import app from '../packages/api/src/index';

export default app;
