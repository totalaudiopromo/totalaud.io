'use client'

/**
 * Demo Mode Selector
 * Choose between Artist Journey and Liberty Pitch demos
 */

import Link from 'next/link'
import { Sparkles, Radio, ArrowRight } from 'lucide-react'

export default function DemoSelectorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-centre justify-centre p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-centre mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            totalaud.io
            <span className="text-accent"> OS Constellation</span>
          </h1>
          <p className="text-lg text-foreground/70">
            Choose your cinematic demo experience
          </p>
        </div>

        {/* Demo cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Artist Journey Demo */}
          <Link
            href="/demo/artist"
            className="group bg-background border-2 border-border hover:border-accent rounded-lg p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-centre justify-centre group-hover:bg-accent/20 transition-colours">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="text-2xl font-bold mb-3">Artist Journey Demo</h2>
            <p className="text-foreground/70 mb-4 leading-relaxed">
              Follow Lana Glass through the complete creative workflow: from notebook sketches to
              AI-powered strategy, timeline planning, and strategic guidance.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                75 seconds
              </span>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                5 OS surfaces
              </span>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                Auto-playback
              </span>
            </div>

            <div className="text-sm text-foreground/50">
              Showcases: Analogue → ASCII → XP → LoopOS → Aqua
            </div>
          </Link>

          {/* Liberty Pitch Demo */}
          <Link
            href="/demo/liberty"
            className="group bg-background border-2 border-border hover:border-accent rounded-lg p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-centre justify-centre group-hover:bg-accent/20 transition-colours">
                <Radio className="w-7 h-7 text-accent" />
              </div>
              <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="text-2xl font-bold mb-3">Liberty Pitch Demo</h2>
            <p className="text-foreground/70 mb-4 leading-relaxed">
              Imagine preparing an EP launch with Liberty Music PR. See how a UK indie campaign
              lives inside the OS constellation, with a preview of TAP integration.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                85 seconds
              </span>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                TAP preview
              </span>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                Campaign focus
              </span>
            </div>

            <div className="text-sm text-foreground/50">
              Includes: Radio targets, press timeline, TAP export (stub)
            </div>
          </Link>
        </div>

        {/* Footer note */}
        <div className="mt-12 text-centre">
          <p className="text-sm text-foreground/50 leading-relaxed max-w-2xl mx-auto">
            Both demos feature hands-free auto-playback with Play/Pause/Skip controls. You can also
            navigate manually using the step controls. All changes respect reduced-motion
            preferences.
          </p>
        </div>
      </div>
    </div>
  )
}
