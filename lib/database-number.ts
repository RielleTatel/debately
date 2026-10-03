export function databaseInteger(value: bigint | number | null, label: string): number {
  const number = Number(value ?? 0)
  if (!Number.isSafeInteger(number)) throw new RangeError(`${label} exceeds the safe integer range`)
  return number
}
