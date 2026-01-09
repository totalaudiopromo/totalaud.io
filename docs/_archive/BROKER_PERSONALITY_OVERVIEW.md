# Broker Personality System

## Overview

The Broker Personality System creates adaptive agent behavior that changes based on the user's chosen OS theme. Each theme provides a unique stage, and Broker adapts his tone, slang, animation style, and sound cues to match the performance energy of that world.

**Design Principle**: *"Marketing your music should feel like performing it."*

---

## 🎭 Personality Profiles

### ASCII Terminal Mode

**Character**: Deadpan, quick-witted sysadmin
**Visual Style**: Typewriter effect with blinking cursor, green monospace
**Sound**: Square wave bleeps, synthesized clicks

**Personality Traits**:
- Types with cursor blink animation
- Uses lowercase for all text
- Terminal-style punctuation
- Occasional tech puns

**Example Dialogue**:
```text
> agent broker online_ let's boot your promo system.
> establishing connection...
> ready to proc your campaign data
```

**Slang**: `init`, `proc`, `ping me`, `exec`, `daemon`, `grep`

**Animation**: Typewriter effect (50ms per character)
**CSS Class**: `.broker-ascii-mode`, `.broker-effect-typewriter`

---

### Windows XP Studio Mode

**Character**: Cheerful, nostalgic tech mate
**Visual Style**: Soft fade between lines, blue plastic panel
**Sound**: Major-chord synth tones

**Personality Traits**:
- Adds :) occasionally
- Soft progress beeps
- Friendly but professional
- Uses British colloquialisms

**Example Dialogue**:
```text
► Morning! Broker here. Let's spin up your studio.
► Brilliant :)
► Cheers for that.
```

**Slang**: `mate`, `cheers`, `pop that in`, `lovely`, `sorted`

**Animation**: Fade effect (300ms duration)
**CSS Class**: `.broker-xp-mode`, `.broker-effect-fade`

---

### macOS Retro (Aqua) Mode

**Character**: Calm, reflective creative coach
**Visual Style**: Long fade with glow effect, brushed silver
**Sound**: Synth bell tones

**Personality Traits**:
- Breath-like fade between lines
- Zen minimalism
- Encourages mindfulness
- Poetic phrasing

**Example Dialogue**:
```text
• Hey — take a breath. Ready to make something beautiful?
• Noted. Smooth.
• Let's move gently to the next part...
```

**Slang**: `smooth`, `compose`, `flow`, `breathe`, `space`

**Animation**: Fade effect (600ms duration)
**CSS Class**: `.broker-aqua-mode`, `.broker-effect-fade`

---

### Ableton Mode

**Character**: Efficient, groove-obsessed engineer
**Visual Style**: Rhythmic pulse (120bpm), flat grid dark mode
**Sound**: Metronome clicks, hi-hats

**Personality Traits**:
- Syncs replies to tempo pulse
- Rhythmic language patterns
- Production terminology
- Time-conscious

**Example Dialogue**:
```text
● Sync checked. Let's drop your first promo loop.
● Tracked.
● Next track...
```

**Slang**: `loop`, `clip`, `drop`, `sync`, `track`, `session`

**Animation**: Pulse effect (500ms duration, synced to 120bpm)
**CSS Class**: `.broker-ableton-mode`, `.broker-effect-pulse`

---

### Punk Zine Mode

**Character**: Sarcastic DIY scene veteran
**Visual Style**: Text jitter/skew, xerox grit texture
**Sound**: Tape hiss, record pops, white noise bursts

**Personality Traits**:
- Random caps for emphasis
- Off-beat timing
- Irreverent humor
- Anti-establishment edge

**Example Dialogue**:
```text
✦ OI. Broker here. Let's rip this thing open and make noise.
✦ Got it. PROPER.
✦ One more thing then we RIOT...
```

**Slang**: `oi`, `zine`, `gig`, `riot`, `scene`, `proper`

**Animation**: Jitter effect (200ms duration)
**CSS Class**: `.broker-punk-mode`, `.broker-effect-jitter`

---

## 🧩 Technical Architecture

### Personality Registry

Located at: `packages/core/agent-executor/src/personas/brokerPersonalityRegistry.ts`

**Core Interfaces**:
```typescript
interface BrokerPersonality {
  themeId: 'ascii' | 'xp' | 'aqua' | 'ableton' | 'punk'
  tone: string
  slang: string[]
  quirks: string[]
  opener: string
  openingLines: string[]
  confirmations: string[]
  transitions: string[]
  interactionQuirks: BrokerPersonalityQuirk
  messagePrefix?: string
}

interface BrokerPersonalityQuirk {
  visualEffect?: 'typewriter' | 'fade' | 'pulse' | 'jitter' | 'glitch'
  animationDuration?: number
  cssClass?: string
  soundEvent?: 'agentSpeak' | 'boot' | 'click' | 'ambient'
}
```

### Helper Functions

**`getBrokerPersonality(themeId: string)`**
Returns the personality configuration for a specific theme.

**`getPersonalityLine(personality, type)`**
Returns a random line from the personality's line arrays (openingLines, confirmations, transitions).

**`applyPersonalityTone(message, personality)`**
Transforms a generic message to match the personality's tone:
- **ASCII**: Converts to lowercase
- **Punk**: Applies random capitalization to emphasis words
- **All**: Adds message prefix

**`getQuirkAnimationClass(personality)`**
Returns the CSS class for the personality's visual effect.

---

## 🎨 Visual Effects

### CSS Animations

All animation effects are defined in `apps/aud-web/src/app/globals.css`:

**Typewriter Effect** (ASCII)
```css
.broker-effect-typewriter {
  border-right: 2px solid currentColor;
  animation: typewriter-blink 0.8s steps(2) infinite;
}
```

**Fade Effect** (XP, Aqua)
```css
.broker-effect-fade {
  animation: broker-fade 2s ease-in-out infinite;
}
```

**Pulse Effect** (Ableton)
```css
.broker-effect-pulse {
  animation: broker-pulse 0.5s ease-in-out infinite;
}
```

**Jitter Effect** (Punk)
```css
.broker-effect-jitter {
  animation: broker-jitter 0.2s ease-in-out infinite;
}
```

### Theme-Specific Styling

Each theme applies additional styling to Broker's messages:

- **ASCII**: JetBrains Mono font, increased letter spacing
- **XP**: Slight brightness increase
- **Aqua**: Brightness and saturation boost
- **Ableton**: Semi-bold weight, tighter letter spacing
- **Punk**: Bold weight, uppercase, wide letter spacing

---

## 🔊 Audio Integration

Broker's personality system integrates seamlessly with the Theme Engine's audio synthesis.

### Sound Mapping

| Theme    | Agent Speak Sound | Description               |
|----------|-------------------|---------------------------|
| ASCII    | `click`           | Square wave blip          |
| XP       | `click`           | Chord blip                |
| Aqua     | `click`           | Synth bell                |
| Ableton  | `click`           | Metronome click           |
| Punk     | `ambient`         | Noise burst               |

All sounds are **100% synthesized** using the Web Audio API (no copyrighted samples).

---

## 🧪 Implementation Examples

### BrokerChat Integration

```typescript
import { getBrokerPersonality, getPersonalityLine, applyPersonalityTone } from '@total-audio/core-agent-executor/src/personas/brokerPersonalityRegistry'

// Get personality for current theme
const personality = getBrokerPersonality(selectedMode)

// Use personality-specific opener
const opener = personality.opener
addBrokerMessage(opener, 500)

// Get random opening line
const openingLine = getPersonalityLine(personality, 'openingLines')
addBrokerMessage(openingLine, 1500)

// Apply tone to generic message
const styledMessage = applyPersonalityTone(firstStep.message, personality)
addBrokerMessage(styledMessage, 2000)
```

### BrokerIntro Integration

```typescript
import { getBrokerPersonality, getPersonalityLine } from '@total-audio/core-agent-executor/src/personas/brokerPersonalityRegistry'

const personality = getBrokerPersonality(selectedMode)
const themeGreeting = getPersonalityLine(personality, 'openingLines')

// Display personality-specific greeting
<div className="font-mono text-lg">
  {themeGreeting}
</div>

// Display personality opener as preview
<div className="text-sm italic">
  {personality.opener}
</div>
```

### Message Rendering with Quirks

```typescript
const animationClass = message.from === 'broker'
  ? getQuirkAnimationClass(personality)
  : ''

const quirk = personality.interactionQuirks

<motion.div
  transition={{
    duration: quirk.animationDuration ? quirk.animationDuration / 1000 : 0.3
  }}
  className={`${animationClass}`}
>
  {message.content}
</motion.div>
```

---

## 🎯 Design Philosophy

### Continuity from OS Transition

The Broker personality system creates seamless continuity from the cinematic OS boot transition:

1. **OS Selector**: User chooses their creative world (ASCII, XP, Aqua, Ableton, Punk)
2. **OS Transition**: Cinematic boot sequence with theme-specific visuals and sounds
3. **Broker Intro**: Agent spawns with personality matching the chosen world
4. **Broker Chat**: Conversation continues with consistent tone and style

### Performance Energy

Each OS mode represents a different creative energy:

- **ASCII**: Technical precision, hacker mentality
- **XP**: Nostalgic comfort, friendly collaboration
- **Aqua**: Mindful creation, aesthetic refinement
- **Ableton**: Professional production, rhythmic workflow
- **Punk**: DIY rebellion, raw energy

Broker adapts to match and amplify this energy, making onboarding feel like part of the creative experience.

---

## ♿️ Accessibility Notes

### Reduced Motion Support

For users with `prefers-reduced-motion` enabled, animation effects should be disabled:

```css
@media (prefers-reduced-motion: reduce) {
  .broker-effect-typewriter,
  .broker-effect-fade,
  .broker-effect-pulse,
  .broker-effect-jitter {
    animation: none;
  }
}
```

### Screen Reader Support

All personality variations maintain semantic HTML structure:
- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators matching theme colors

---

## 🚀 Future Enhancements

### Planned Features

1. **LLM-Based Tone Transformation**
   Use an LLM to dynamically transform messages while maintaining personality consistency.

2. **Custom Personality Builder**
   Allow users to create their own Broker personalities with custom slang, quirks, and animations.

3. **Context-Aware Responses**
   Broker adjusts responses based on user's progress, genre, and previous interactions.

4. **Multi-Language Support**
   Personality variations in multiple languages while preserving character essence.

5. **Voice Synthesis**
   Theme-specific voice synthesis matching the personality (robot voice for ASCII, British accent for XP, etc.).

---

## 📊 Testing Checklist

### Manual Testing Steps

For each theme (ASCII, XP, Aqua, Ableton, Punk):

✅ Visit OS Selector and choose theme
✅ Watch boot transition
✅ Verify BrokerIntro displays correct greeting
✅ Verify personality opener appears
✅ Confirm appropriate sound plays
✅ Check animation effect renders correctly
✅ Verify message prefix matches theme
✅ Test conversation flow with confirmations
✅ Check transitions use personality-specific phrases
✅ Verify no console errors

### Performance Testing

✅ Theme switch < 150ms
✅ Sound playback < 30ms latency
✅ Animation smooth at 60fps
✅ No memory leaks during extended conversations

---

## 🔗 Related Documentation

- [Theme Engine Overview](./THEME_ENGINE_OVERVIEW.md)
- [Theme Engine Status](./THEME_ENGINE_STATUS.md)
- [Broker Persona](../packages/core/agent-executor/src/personas/broker.ts)
- [BrokerChat Component](../apps/aud-web/src/components/BrokerChat.tsx)
- [BrokerIntro Component](../apps/aud-web/src/components/BrokerIntro.tsx)

---

## 📝 Changelog

**2026-10-19**: Initial implementation
- Created personality registry with 5 theme variations
- Integrated into BrokerChat and BrokerIntro components
- Added CSS animations for visual effects
- Connected to Theme Engine audio synthesis
- Full documentation created

---

**Package**: `@total-audio/core-agent-executor`
**Module**: `src/personas/brokerPersonalityRegistry.ts`
**Status**: ✅ Production Ready
**Maintainer**: TotalAud.io Team
