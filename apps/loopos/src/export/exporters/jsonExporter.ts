import type { CampaignData, EPKData, BriefData } from '../types'

/**
 * JSON Exporter
 *
 * Exports structured data as JSON.
 */

export function exportCampaignToJSON(data: CampaignData): string {
  return JSON.stringify(data, null, 2)
}

export function exportEPKToJSON(data: EPKData): string {
  return JSON.stringify(data, null, 2)
}

export function exportBriefToJSON(data: BriefData): string {
  return JSON.stringify(data, null, 2)
}
