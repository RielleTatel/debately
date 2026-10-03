import path from 'node:path'
import type { NextConfig } from 'next'
const root = path.resolve(__dirname, '../../..')
const config: NextConfig = {
  experimental: { externalDir: true },
  outputFileTracingRoot: root,
  eslint: { ignoreDuringBuilds: true },
  webpack(config) {
    config.cache = false
    config.module.rules.push({
      test: /announcement-form\.tsx$/,
      enforce: 'pre',
      use: path.join(root, 'test/browser/fixtures/render-count-loader.cjs'),
    })
    config.resolve.alias = {
      '@/lib/supabase/admin': path.join(root, 'test/browser/fixtures/supabase-admin.ts'),
      [path.join(root, 'lib/supabase/admin.ts')]: path.join(
        root,
        'test/browser/fixtures/supabase-admin.ts',
      ),
      '@/lib/supabase/server': path.join(root, 'test/browser/fixtures/supabase.ts'),
      '@/lib/prisma': path.join(root, 'test/browser/fixtures/prisma.ts'),
      [path.join(root, 'lib/supabase/server.ts')]: path.join(
        root,
        'test/browser/fixtures/supabase.ts',
      ),
      [path.join(root, 'lib/prisma.ts')]: path.join(root, 'test/browser/fixtures/prisma.ts'),
      '@': root,
      ...config.resolve.alias,
    }
    return config
  },
}
export default config
