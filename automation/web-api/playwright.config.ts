import { defineConfig, devices } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const WEB_URL = process.env.WEB_URL || 'http://localhost:8081';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { trace: 'on-first-retry' },
  projects: [
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: { baseURL: API_URL },
    },
    {
      name: 'web-chromium',
      testMatch: /.*\.web\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: WEB_URL },
    },
  ],
});
