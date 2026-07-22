import { csvRow } from './escape'

export function csvStream<T>(
  iterable: AsyncIterable<T>,
  header: string[],
  toRow: (item: T) => unknown[],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(csvRow(header)))
      try {
        for await (const item of iterable) {
          controller.enqueue(encoder.encode(csvRow(toRow(item))))
        }
        controller.close()
      } catch (e) {
        controller.error(e)
      }
    },
  })
}
