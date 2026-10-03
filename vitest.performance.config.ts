import { defineConfig } from 'vitest/config'
import path from 'node:path'
const source = path.resolve(process.env.PERFORMANCE_SOURCE_ROOT ?? '.')
export default defineConfig({
  resolve: {
    alias: [
      { find: '@/lib/prisma', replacement: path.resolve('test/performance/prisma.ts') },
      { find: '@', replacement: source },
    ],
  },
  test: {
    environment: 'node',
    include: ['test/performance/**/*.bench.ts'],
    setupFiles: ['./test/integration/setup.ts'],
    globalSetup: './test/browser/global-setup.ts',
    maxWorkers: 1,
    testTimeout: 300000,
  },
})
