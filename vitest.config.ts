import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/update-debug*.test.ts',
      '**/*.e2e.ts',
      '**/test/integration/**',
      '**/test/browser/site/**',
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
})
