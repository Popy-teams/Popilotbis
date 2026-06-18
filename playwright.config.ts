import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;
const API_PORT = 3001;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['html', { open: 'on-failure' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'node server/src/index.js',
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        PORT: String(API_PORT),
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://popilot:popilot@localhost:5432/popilot',
        JWT_SECRET: 'e2e-test-jwt-secret',
        SMTP_HOST: 'localhost',
        SMTP_PORT: '1025',
        SMTP_FROM: 'noreply@popilot.local',
        FRONTEND_URL: `http://localhost:${PORT}`,
      },
    },
    {
      command: 'pnpm exec vite preview --host 0.0.0.0 --port 5173',
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_API_PROXY: `http://localhost:${API_PORT}`,
      },
    },
  ],
});
