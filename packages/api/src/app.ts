import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';

export const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.CORS_ORIGIN ?? '*',
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { code: 429, message: 'Too many requests, please try again later.' },
  }),
);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);
