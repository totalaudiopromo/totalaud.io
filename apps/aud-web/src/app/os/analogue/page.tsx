'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AnalogueButton,
  AnalogueCard,
  AnalogueContainer,
  AnalogueNotebook,
  AnalogueSidebar,
  AnalogueTabs,
  AnalogueToggle,
} from '@/components/os/analogue'
import type { AnalogueTabId } from '@/components/os/analogue/AnalogueTabs'
import type { AnalogueCardData } from '@/components/os/analogue/AnalogueCard'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useOS } from '@/components/os/navigation'
import { consumeOSBridges, queueOSBridge } from '@/components/os/navigation/OSBridges'
import { useAgentKernel } from '@/components/agents/useAgentKernel'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { registerAnalogueController } from '@/components/demo/director/DirectorEngine'
import { useAgentTeams } from '@/components/agents/teams/AgentTeamOrchestrator'
import { useProjectEngine } from '@/components/projects/useProjectEngine'

/**
 * Analogue OS Surface - Creative Notebook / Desk
 * Route: /os/analogue
 */
export default function AnalogueOSPage() {
  const { registerHooks, setOS } = useOS()
  const { play } = useThemeAudio()
  const demo = useOptionalDemo()
  const isDemoMode =
    demo?.isDemoMode ||
    (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)
  const [activeTab, setActiveTab] = useState<AnalogueTabId>('Today')
  const [showCompleted, setShowCompleted] = useState(true)
  const [activityLog, setActivityLog] = useState<
    {
      id: number
      message: string
      timestamp: string
    }[]
  >([])
  const [cards, setCards] = useState<AnalogueCardData[]>(() => {
    const base: AnalogueCardData[] = [
      {
        id: 'today-1',
        section: 'Today',
        title: 'Pitch list',
        body: '3 priority playlists • 5 press targets • 2 TikTok creators',
        accent: 'yellow',
        tag: 'campaign',
      },
      {
        id: 'today-2',
        section: 'Today',
        title: 'Non-negotiables',
        body: 'Send masters, confirm upload windows, schedule first teaser.',
        accent: 'pink',
        tag: 'note',
        completed: true,
      },
      {
        id: 'ideas-1',
        section: 'Ideas',
        title: 'Campaign hook',
        body: '“Stop wasting 15 hours a week chasing cold emails” — focus on proof.',
        accent: 'blue',
        tag: 'idea',
        starred: true,
      },
      {
        id: 'campaigns-1',
        section: 'Campaigns',
        title: 'Audio Intel beta',
        body: 'Onboard 10 indie teams • capture honest feedback • refine surfaces.',
        accent: 'yellow',
        tag: 'campaign',
      },
      {
        id: 'notes-1',
        section: 'Notes',
        title: 'What matters',
        body: 'Tools that actually work, no bullshit dashboards, real results.',
        accent: 'pink',
        tag: 'note',
      },
    ]
    return base
  })
  const { spawnAgentRun } = useAgentKernel()
  const { runTeam } = useAgentTeams()
  const { currentProject } = useProjectEngine()

  const appendActivity = (message: string) => {
    const timestamp = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setActivityLog((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        message,
        timestamp,
      },
    ])
  }

  useEffect(() => {
    const unregister = registerHooks('analogue', {
      onEnter: () => {
        // Placeholder: tilt the notebook slightly when this OS becomes active
      },
      onExit: () => {},
      onFocus: () => {},
    })

    return unregister
  }, [registerHooks])

  useEffect(() => {
    if (!isDemoMode) return

    const demoCards: AnalogueCardData[] = [
      {
        id: 'lana-ideas-1',
        section: 'Ideas',
        title: 'midnight signals — concept',
        body: 'Left-field electronic pop for after-midnight listening. Neon synths, glassy textures, and radio interference.',
        accent: 'blue',
        tag: 'idea',
        starred: true,
      },
      {
        id: 'lana-ideas-2',
        section: 'Ideas',
        title: 'visual mood / colours',
        body: 'Electric blue, deep violet, and amber streetlights. VHS noise, scanner beams, underground station posters.',
        accent: 'pink',
        tag: 'note',
      },
      {
        id: 'lana-campaign-1',
        section: 'Campaigns',
        title: 'campaign idea: pirate radio signals',
        body: 'Lean into “lost broadcast” energy. Teasers as intercepted transmissions and scrambled club flyers.',
        accent: 'yellow',
        tag: 'campaign',
      },
      {
        id: 'lana-notes-1',
        section: 'Notes',
        title: 'lana glass – profile snapshot',
        body: 'South London, late-night studio sessions, ex-sound designer. Lives between club music and pop hooks.',
        accent: 'blue',
        tag: 'note',
      },
    ]

    setCards(demoCards)
  }, [isDemoMode])

  useEffect(() => {
    if (!isDemoMode) {
      registerAnalogueController(null)
      return
    }

    registerAnalogueController({
      highlightCardByTitle: (title: string) => {
        setCards((previous) =>
          previous.map((card) =>
            card.title.toLowerCase() === title.toLowerCase()
              ? {
                  ...card,
                  highlighted: true,
                }
              : card,
          ),
        )
      },
    })

    return () => {
      registerAnalogueController(null)
    }
  }, [isDemoMode])

  useEffect(() => {
    const payloads = consumeOSBridges('analogue')
    if (!payloads.length) return

    payloads.forEach((payload) => {
      if (payload.kind === 'aqua-to-analogue') {
        const id = `aqua-${Date.now().toString(36)}`
        setCards((previous) => [
          ...previous,
          {
            id,
            section: 'Ideas',
            title: payload.title,
            body: payload.body,
            accent: 'blue',
            tag: payload.tag,
          },
        ])
        appendActivity(`Imported story for "${payload.title}" from Aqua.`)
      }

      if (payload.kind === 'daw-to-analogue') {
        const id = `daw-${Date.now().toString(36)}`
        setCards((previous) => [
          ...previous,
          {
            id,
            section: 'Notes',
            title: payload.title,
            body: payload.body,
            accent: 'yellow',
            tag: payload.tag,
          },
        ])
        appendActivity(`Captured DAW clip "${payload.title}" as an Analogue card.`)
      }

      if (payload.kind === 'loopos-to-analogue') {
        const id = `loopos-${Date.now().toString(36)}`
        setCards((previous) => [
          ...previous,
          {
            id,
            section: 'Campaigns',
            title: payload.title,
            body: payload.body,
            accent: 'blue',
            tag: payload.tag ?? 'campaign',
          },
        ])
        appendActivity(`Exported LoopOS summary "${payload.title}" into Analogue.`)
      }
    })
  }, [appendActivity])

  const tabs: AnalogueTabId[] = ['Today', 'Ideas', 'Campaigns', 'Notes']

  const visibleCards = useMemo(
    () =>
      cards.filter((card) => {
        if (card.section !== activeTab) return false
        if (!showCompleted && card.completed) return false
        return true
      }),
    [cards, activeTab, showCompleted],
  )

  const handleTabChange = (tab: AnalogueTabId) => {
    setActiveTab(tab)
  }

  const handleAddCard = () => {
    const id = `${activeTab.toLowerCase()}-${Date.now().toString(36)}`
    const accentCycle: AnalogueCardData['accent'][] = ['yellow', 'blue', 'pink']
    const existingForTab = cards.filter((c) => c.section === activeTab).length
    const accent = accentCycle[existingForTab % accentCycle.length]

    const newCard: AnalogueCardData = {
      id,
      section: activeTab,
      title: `${activeTab} sketch`,
      body: 'Drop a quick idea, headline, or campaign note here.',
      accent,
      tag: activeTab === 'Ideas' ? 'idea' : activeTab === 'Campaigns' ? 'campaign' : 'note',
    }

    setCards((prev) => [...prev, newCard])
    play('success')
  }

  const toggleHighlight = (id: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? {
              ...card,
              highlighted: !card.highlighted,
            }
          : card,
      ),
    )
  }

  const toggleStar = (id: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? {
              ...card,
              starred: !card.starred,
            }
          : card,
      ),
    )
  }

  const updateCardSentTo = (card: AnalogueCardData, target: 'aqua' | 'daw') => {
    const current = card.sentTo
    let next: AnalogueCardData['sentTo'] = target

    if (current && current !== target) {
      next = 'both'
    }

    setCards((previous) =>
      previous.map((existing) =>
        existing.id === card.id
          ? {
              ...existing,
              sentTo: next,
            }
          : existing,
      ),
    )

    appendActivity(
      `Card "${card.title}" marked for ${target === 'aqua' ? 'Aqua' : 'DAW'}${
        next === 'both' ? ' (and the other surface)' : ''
      }.`,
    )
  }

  const sendCardToAqua = (card: AnalogueCardData) => {
    updateCardSentTo(card, 'aqua')

    queueOSBridge('aqua', {
      kind: 'analogue-to-aqua',
      artistName: card.title,
      story: card.body,
      note: `Imported from Analogue: ${card.title}`,
    })

    setOS('aqua')
  }

  const mapAnalogueTagToDawLane = (tag: AnalogueCardData['tag']): 'creative' | 'promo' | 'analysis' => {
    if (tag === 'campaign') return 'promo'
    if (tag === 'note') return 'analysis'
    return 'creative'
  }

  const sendCardToDaw = (card: AnalogueCardData) => {
    updateCardSentTo(card, 'daw')

    const lane = mapAnalogueTagToDawLane(card.tag)

    queueOSBridge('daw', {
      kind: 'analogue-to-daw',
      lane,
      name: card.title,
      type: lane,
      notes: card.body,
    })

    setOS('daw')
  }

  const sendCardToXp = (card: AnalogueCardData) => {
    appendActivity(`Sent body of "${card.title}" to XP clipboard.`)

    queueOSBridge('xp', {
      kind: 'analogue-to-xp',
      clipboardText: card.body,
    })

    setOS('xp')
  }

  const sendCardToAscii = (card: AnalogueCardData) => {
    appendActivity(`Logged "${card.title}" to ASCII console.`)

    queueOSBridge('ascii', {
      kind: 'analogue-to-ascii',
      message: `Imported card "${card.title}" from Analogue`,
    })

    setOS('ascii')
  }

  const askScoutForIdeas = (card: AnalogueCardData) => {
    const prompt = [
      'This Analogue card describes part of a campaign. Suggest 3 concrete, actionable ideas.',
      '',
      `Title: ${card.title}`,
      `Body: ${card.body}`,
    ].join('\n')

    spawnAgentRun({
      role: 'scout',
      originOS: 'analogue',
      input: prompt,
    })

    appendActivity(`Asked Scout for ideas on "${card.title}".`)
  }

  const askCreativeTeam = (card: AnalogueCardData) => {
    const promptLines = [
      'You are the Creative Team working across this Analogue notebook card.',
      '',
      `Title: ${card.title}`,
      `Body: ${card.body}`,
      '',
      'Move in sequence: Scout suggests raw ideas, Coach sharpens phrasing, Insight zooms out.',
      'Keep it grounded in independent music campaigns and tools that actually work.',
    ]

    runTeam({
      teamId: 'creative_team',
      originOS: 'analogue',
      instruction: promptLines.join('\n'),
    })

    appendActivity(`Asked Creative Team to collaborate on "${card.title}".`)
  }

  const handleToggleShowCompleted = (value: boolean) => {
    setShowCompleted(value)
  }

  return (
    <AnalogueContainer>
      <AnalogueNotebook>
        <div className="flex flex-col gap-4">
          <header className="space-y-1">
            <div className="text-[11px] uppercase tracking-[0.26em] text-[#b1844f]">
              analogue os
            </div>
            <h1 className="text-xl font-semibold tracking-[0.14em] uppercase text-[#3a2718]">
              session journal
            </h1>
            {currentProject && (
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b5a32]">
                project: <span className="font-semibold">{currentProject.name}</span>
              </p>
            )}
          </header>

          <AnalogueTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

          <main className="mt-2 space-y-3">
            {visibleCards.map((card) => (
              <AnalogueCard
                key={card.id}
                card={card}
                onToggleHighlight={() => toggleHighlight(card.id)}
                onToggleStar={() => toggleStar(card.id)}
                onSendToAqua={() => sendCardToAqua(card)}
                onSendToDaw={() => sendCardToDaw(card)}
                onSendToXp={() => sendCardToXp(card)}
                onSendToAscii={() => sendCardToAscii(card)}
                onAskScout={() => askScoutForIdeas(card)}
                onAskCreativeTeam={() => askCreativeTeam(card)}
              />
            ))}
            {visibleCards.length === 0 && (
              <div className="mt-6 rounded-[14px] border border-dashed border-[#d1b89b] bg-[#f5e8d7]/70 px-4 py-3 text-[12px] text-[#7b5a3a]">
                Nothing on this page yet. Drop a quick card to park an idea and get it out of
                your head.
              </div>
            )}
          </main>

          <footer className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-[#e2d3c0] pt-4 text-[11px] text-[#7b5a3a] sm:flex-row sm:items-center">
            <AnalogueButton onClick={handleAddCard}>add card</AnalogueButton>
            <div className="flex flex-wrap items-center gap-4">
              <AnalogueToggle
                label="show completed"
                checked={showCompleted}
                onChange={handleToggleShowCompleted}
              />
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#b1844f]">
                {visibleCards.length} card{visibleCards.length === 1 ? '' : 's'} in view
              </span>
            </div>
          </footer>

          <section className="mt-4 space-y-1 border-t border-dashed border-[#e2d3c0] pt-3 text-[10px] text-[#7b5a3a]">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-[0.18em] text-[#b1844f]">activity log</span>
              <span className="text-[9px] text-[#b1844f]/80">
                {activityLog.length === 0
                  ? 'No bridges fired yet.'
                  : `${activityLog.length} entr${activityLog.length === 1 ? 'y' : 'ies'}`}
              </span>
            </div>
            <div className="mt-1 max-h-28 space-y-1 overflow-y-auto pr-1">
              {activityLog.length === 0 ? (
                <p className="text-[10px] text-[#9a7450]">
                  When you mark cards for Aqua or DAW, those moves will show up here. For now it&apos;s
                  just a local journal of what you&apos;re planning to send downstream.
                </p>
              ) : (
                activityLog.map((entry) => (
                  <div key={entry.id} className="flex gap-2">
                    <span className="shrink-0 text-[#b1844f]/80">[{entry.timestamp}]</span>
                    <span>{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </AnalogueNotebook>

      <AnalogueSidebar />
    </AnalogueContainer>
  )
}


