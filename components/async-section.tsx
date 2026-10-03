import type { ReactNode } from 'react'
import { logger } from '@/services/logger'

// Keep a content read failure inside its already-authorized streamed section.
export async function AsyncSection({
  label,
  load,
}: {
  label: string
  load: () => Promise<ReactNode>
}) {
  try {
    return await load()
  } catch (error) {
    logger.warn(`${label} section failed`, {
      error: error instanceof Error ? error.message : String(error),
    })
    return (
      <p role="alert" className="rounded border p-4 text-sm text-muted-foreground">
        {label} is unavailable. Reload this page to try again.
      </p>
    )
  }
}
