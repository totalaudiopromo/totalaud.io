// Main integration exports
export { tapClient, TAPApiError } from './client'
export { consoleApi } from './console/api'
export { audioIntelApi } from './audio-intel/api'
export { trackerApi } from './tracker/api'
export { pitchApi } from './pitch/api'
export * from './types'

// Helper to check if TAP is configured
export function isTAPConfigured(): boolean {
  return tapClient.isConfigured()
}
