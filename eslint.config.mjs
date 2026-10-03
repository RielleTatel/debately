import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'node:module'

// Next.js 15's resolver patch needs the CommonJS compatibility entry point.
const require = createRequire(import.meta.url)
const { FlatCompat } = require('@eslint/eslintrc')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Tests use `as any` extensively with vi.mock — relax for test files
  {
    files: ['test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]

export default config
