import { createApp } from './createApp.js';
import { seedDefaultAdmin, ensureSchema } from './scripts/seed.js';

const app = createApp();
const port = Number(process.env.PORT || 3001);

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
