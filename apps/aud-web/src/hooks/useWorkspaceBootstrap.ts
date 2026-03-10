import { useEffect, useState } from 'react'
import { useUserProfileStore } from '@/stores/useUserProfileStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { useScoutStore } from '@/stores/useScoutStore'

// Key for local storage to ensure we only run the bootstrap sequence once per session/device
const BOOTSTRAP_KEY = 'totalaud_workspace_bootstrapped'

export function useWorkspaceBootstrap() {
  const { profile } = useUserProfileStore()
  const generateTimeline = useTimelineStore((s) => s.generateFromReleaseDate)
  const initIdeas = useIdeasStore((s) => s.initStarterIdeas)
  const loadOpportunities = useScoutStore((s) => s.fetchOpportunities)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    // Only run if we have a fully loaded profile
    if (!profile) return

    // Run this bootstrap logic only once per device/browser session to prevent
    // regenerating starter entries repeatedly if the user clears them
    const hasBootstrapped = localStorage.getItem(BOOTSTRAP_KEY) === 'true'
    
    if (hasBootstrapped) {
      setIsBootstrapping(false)
      // Even if bootstrapped, we want to fetch opportunities if needed
      loadOpportunities()
      return
    }

    // --- Bootstrapping Sequence ---
    
    // 1. Seed Timeline if we have a release date
    if (profile.releaseDate) {
      // releaseDate should be a valid string that the generator can parse
      const rDate = new Date(profile.releaseDate)
      if (!isNaN(rDate.getTime())) {
        generateTimeline(rDate)
      }
    }

    // 2. Init Starter Ideas with Onboarding Context
    initIdeas({
      goal: profile.primaryGoal, // assuming primaryGoal is the goal string or one of the goals
      genre: profile.genre,
    })

    // 3. Load Scout Opportunities
    loadOpportunities()

    // Mark as bootstrapped
    localStorage.setItem(BOOTSTRAP_KEY, 'true')
    setIsBootstrapping(false)

  }, [profile, generateTimeline, initIdeas, loadOpportunities])

  return { isBootstrapping }
}
