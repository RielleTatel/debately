const BATCH_SIZE = 500

export async function readBatches<T extends { id: string }>(
  read: (cursor: string | undefined, take: number) => Promise<T[]>,
): Promise<T[]> {
  const result: T[] = []
  let cursor: string | undefined
  while (true) {
    const batch = await read(cursor, BATCH_SIZE)
    result.push(...batch)
    if (batch.length < BATCH_SIZE) return result
    cursor = batch[batch.length - 1].id
  }
}

export async function writeBatches<T>(values: T[], write: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < values.length; i += BATCH_SIZE) await write(values.slice(i, i + BATCH_SIZE))
}
