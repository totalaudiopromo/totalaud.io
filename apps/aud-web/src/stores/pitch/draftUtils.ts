import type { SyncedPitchDraft } from '@/hooks/useSupabaseSync'
import { generateId } from '@/lib/id'
import type { PitchDraft, PitchSection, PitchType } from '@/types/pitch'
import { DEFAULT_SECTIONS } from './constants'

interface DatabasePitchDraft {
  id: string
  user_id: string
  name: string
  pitch_type: string
  sections: unknown
  created_at: string
  updated_at: string
}

export function generatePitchId(): string {
  return generateId('pitch')
}

export function toSupabaseDraft(
  draft: PitchDraft,
  userId: string
): Omit<SyncedPitchDraft, 'created_at' | 'updated_at'> {
  return {
    id: draft.id,
    user_id: userId,
    name: draft.name,
    pitch_type: draft.type,
    sections: draft.sections,
  }
}

export function fromSupabaseDraft(data: DatabasePitchDraft): PitchDraft {
  const sections = Array.isArray(data.sections)
    ? (data.sections as PitchSection[])
    : DEFAULT_SECTIONS

  return {
    id: data.id,
    name: data.name,
    type: data.pitch_type as PitchType,
    sections,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
