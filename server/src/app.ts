import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import tasksRouter from './routes/tasks.js';
import offersRouter from './routes/offers.js';
import profileRouter from './routes/profile.js';
import adminRouter from './routes/admin.js';
import pointsRouter from './routes/points.js';
import referralRouter from './routes/referral.js';

dotenv.config();

export const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/offers', offersRouter);
app.use('/api/profile', profileRouter);
app.use('/api/admin', adminRouter);
app.use('/api/points', pointsRouter);
app.use('/api/referral', referralRouter);

// Simple error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
});
