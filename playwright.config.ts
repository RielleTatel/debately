import { defineConfig } from '@playwright/test'
import { browserEnvironment } from './test/browser/environment'

export default defineConfig({
  testDir: './test/browser',
  testMatch: '**/*.e2e.ts',
  workers: 1,
  globalSetup: './test/browser/global-setup.ts',
  use: { baseURL: browserEnvironment.NEXT_PUBLIC_APP_URL, trace: 'retain-on-failure' },
  webServer: {
    command:
      'node node_modules/next/dist/bin/next build test/browser/site && node node_modules/next/dist/bin/next start test/browser/site -p 3100',
    url: browserEnvironment.NEXT_PUBLIC_APP_URL,
    timeout: 180000,
    env: browserEnvironment,
  },
})
