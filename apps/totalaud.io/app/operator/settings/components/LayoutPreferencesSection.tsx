/**
 * LayoutPreferencesSection
 * Configure default layouts and persona-specific layouts
 * Phase 3 - Desktop Experience Layer
 */

'use client'

import { useState, useEffect } from 'react'
import { listLayouts, type OperatorLayoutSummary } from '@total-audio/operator-os'
import { getAllPersonaPresets, type PersonaPreset } from '@total-audio/operator-services'
import { z } from 'zod'
import { logger } from '@total-audio/core-logger'
import type { Database } from '@total-audio/schemas-database'
import { useAuth } from '@/hooks/useAuth'

const log = logger.scope('LayoutPreferencesSection')

const operatorSettingsSchema = z.object({
  defaultLayout: z.string().optional(),
  personaDefaults: z.record(z.string()).optional(),
})

type OperatorSettings = Database['public']['Tables']['user_profiles']['Row']['operator_settings']

interface LayoutPreferencesSectionProps {
  userId: string
  workspaceId: string
}

export function LayoutPreferencesSection({ userId, workspaceId }: LayoutPreferencesSectionProps) {
  const { supabase } = useAuth()
  const [layouts, setLayouts] = useState<OperatorLayoutSummary[]>([])
  const [defaultLayout, setDefaultLayout] = useState<string>('default')
  const [personaDefaults, setPersonaDefaults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const personas = getAllPersonaPresets()

  useEffect(() => {
    loadLayoutsAndPreferences()
  }, [userId, workspaceId])

  const loadLayoutsAndPreferences = async () => {
    try {
      setLoading(true)
      const layoutList = await listLayouts(userId, workspaceId)
      setLayouts(layoutList)

      // Load saved preferences from user_profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .select('operator_settings')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        log.warn('Error loading preferences', { error })
      } else if (data?.operator_settings) {
        const result = operatorSettingsSchema.safeParse(data.operator_settings)
        if (result.success) {
          const settings = result.data
          if (settings.defaultLayout) setDefaultLayout(settings.defaultLayout)
          if (settings.personaDefaults) setPersonaDefaults(settings.personaDefaults)
        } else {
          log.error('Failed to validate operator settings', result.error)
        }
      } else {
        // Fallback to recommended layouts from presets if no saved ones
        const defaults: Record<string, string> = {}
        personas.forEach((preset: PersonaPreset) => {
          defaults[preset.persona] = preset.recommendedLayoutName
        })
        setPersonaDefaults(defaults)
      }
    } catch (error) {
      log.error('Error loading layouts', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async (newDefault: string, newPersonas: Record<string, string>) => {
    try {
      const { error } = await supabase.from('user_profiles').upsert({
        id: userId,
        operator_settings: {
          defaultLayout: newDefault,
          personaDefaults: newPersonas,
        },
      })

      if (error) log.warn('Failed to save preferences', { error })
    } catch (saveError) {
      log.warn('Failed to save preferences', { error: saveError })
    }
  }

  // Simple debounce for saving
  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      savePreferences(defaultLayout, personaDefaults)
    }, 1000)
    return () => clearTimeout(timer)
  }, [defaultLayout, personaDefaults])

  const handleDefaultLayoutChange = (layoutName: string) => {
    setDefaultLayout(layoutName)
  }

  const handlePersonaDefaultChange = (persona: string, layoutName: string) => {
    setPersonaDefaults((prev) => ({
      ...prev,
      [persona]: layoutName,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading preferences...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Default Layout on Boot */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Default Layout on Boot</h2>
        <p className="text-sm text-gray-400 mb-4">
          Choose which layout to apply when OperatorOS starts
        </p>

        <div className="max-w-md">
          <select
            value={defaultLayout}
            onChange={(e) => handleDefaultLayoutChange(e.target.value)}
            className="w-full px-4 py-2 bg-[#10141A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3AA9BE] transition-colors"
          >
            <option value="">No default (empty desktop)</option>
            {layouts.map((layout) => (
              <option key={layout.layout_name} value={layout.layout_name}>
                {layout.layout_name} ({layout.window_count} windows · {layout.theme} ·{' '}
                {layout.persona})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Per-Persona Defaults */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Per-Persona Default Layouts</h2>
        <p className="text-sm text-gray-400 mb-4">
          Set a default layout for each persona. When you switch personas, OperatorOS can suggest
          these layouts.
        </p>

        <div className="grid gap-4">
          {personas.map((preset: PersonaPreset) => (
            <div
              key={preset.persona}
              className="flex items-center gap-4 p-4 bg-[#10141A] border border-white/6 rounded-xl"
            >
              <span className="text-3xl">{preset.icon}</span>

              <div className="flex-1">
                <div className="font-medium text-white capitalize">{preset.displayName}</div>
                <div className="text-xs text-gray-400">{preset.description}</div>
              </div>

              <div className="w-64">
                <select
                  value={personaDefaults[preset.persona] || ''}
                  onChange={(e) => handlePersonaDefaultChange(preset.persona, e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#3AA9BE] transition-colors font-mono"
                >
                  <option value="">None (no suggestion)</option>
                  {layouts.map((layout) => (
                    <option key={layout.layout_name} value={layout.layout_name}>
                      {layout.layout_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Note */}
      <div className="p-4 bg-[#3AA9BE]/10 border border-[#3AA9BE]/30 rounded-xl">
        <div className="text-sm text-[#3AA9BE]">
          <span className="font-medium">Note:</span> Layout preferences are stored per-user and will
          be available across all your sessions. Use the Layout Manager (⌘L) to create and manage
          layouts.
        </div>
      </div>
    </div>
  )
}
