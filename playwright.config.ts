import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4011',
    browserName: 'chromium',
    viewport: { width: 1440, height: 1080 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tests/start-server.cjs',
    url: 'http://127.0.0.1:4011/api/health',
    reuseExistingServer: false,
    timeout: 20000,
  },
});
