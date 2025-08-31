import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { router } from './routes.js';
import cron from 'node-cron';
import { retryQueuedLeads } from './dispatcher.js';

const app = express();

app.use(express.json());
app.use(cors({ origin: (origin, cb) => {
  if (!origin) return cb(null, true);
  if (env.ALLOWED_ORIGINS.length === 0 || env.ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
  return cb(new Error('Not allowed by CORS'));
}}));

app.use('/api', router);

// retry queue every 2 minutes (idempotent)
cron.schedule('*/2 * * * *', async () => {
  try { await retryQueuedLeads(); } catch (e) { console.error('retry err', e); }
});

app.listen(env.PORT, () => console.log(`MangoLeads server listening on :${env.PORT}`));
