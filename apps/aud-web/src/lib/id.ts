export function generateId(prefix: string): string {
  return `${prefix}-${globalThis.crypto.randomUUID()}`
}
