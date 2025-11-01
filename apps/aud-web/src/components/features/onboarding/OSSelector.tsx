'use client'

import { ThemeSelectorV2 } from '@aud-web/components/ui/ThemeSelectorV2'
import { useUserPrefs } from '@aud-web/hooks/useUserPrefs'
import type { OSTheme } from '@aud-web/hooks/useOSSelection'

interface OSSelectorProps {
  onConfirm: (theme: OSTheme) => void
}

/**
 * Phase 2: Interactive OS selection with arrow-key navigation.
 * User selects their creative environment.
 *
 * Now using ThemeSelectorV2 for cinematic premium design.
 */
export function OSSelector({ onConfirm }: OSSelectorProps) {
  const { updatePrefs } = useUserPrefs(null)

  const handleThemeSelect = async (theme: OSTheme) => {
    // Persist theme selection to user preferences
    await updatePrefs({ theme })
    onConfirm(theme)
  }

  return <ThemeSelectorV2 onSelect={handleThemeSelect} autoFocus />
}
