import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import { seedDefaultAdmin, ensureSchema } from './scripts/seed.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, status: 'ok' });
  } catch (err) {
    res.status(503).json({ success: false, error: err.message });
  }
});

app.use('/api/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route introuvable' });
});

async function start() {
  try {
    await ensureSchema();
    await seedDefaultAdmin();
  } catch (err) {
    console.warn('Seed skipped:', err.message);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Popilot API listening on :${port}`);
  });
}

start();
