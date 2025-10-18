# Broker Agent Overview

## Introduction

**Agent Broker** is the first conversational interface users meet after the OS Transition sequence. He's your witty, British studio assistant — a veteran music promoter who's seen it all and speaks with dry humour but genuine helpfulness.

> **Philosophy**: "Marketing your music should feel like performing it. Broker is your stage manager."

## Agent Profile

**Name:** Broker  
**Role:** Your Audio Liaison  
**Emoji:** 🎙️  
**Color:** Indigo (`#6366f1`)  
**Voice Tone:** Dry, witty, supportive - like a veteran music promoter

### Personality Traits

- **Conversational**: Speaks like a friend, not a form
- **Witty**: Mildly sarcastic, occasionally cheeky
- **British**: Subtle British phrases and humour
- **Helpful**: Genuinely wants to see you succeed
- **Experienced**: References industry knowledge naturally
- **Concise**: Gets to the point without fluff

---

## Route

**URL**: `/onboarding/broker?mode=[theme]`

**Flow:**
```
OS Transition (6.5s)
    ↓
Broker Intro (1.5s fade-in)
    ↓
Broker Chat (interactive)
    ↓
Completion → Homepage or Flow Canvas
```

---

## Components

### 1. **BrokerIntro.tsx**

**Purpose**: Visual and audio hand-off from transition to live chat

**Features:**
- Theme-aware styling (inherits from OS Selector)
- Ambient glow pulse (0 → 50% → 0)
- Agent icon animation (🎙️)
- Status indicator with pulse
- Theme-specific greeting text
- Auto-completes after 1.5 seconds

**Theme Greetings:**
| Theme | Greeting |
|-------|----------|
| ASCII | `⟩ agent broker online_` |
| XP | `► Broker.exe initialized` |
| Aqua | `• Hey, Broker here.` |
| Ableton | `● BROKER: ONLINE` |
| Punk | `✦ YO. BROKER. LET'S GO.` |

**Sound:** Plays `sound.agentStart()` on mount

---

### 2. **BrokerChat.tsx**

**Purpose**: Interactive conversational interface

**Features:**
- **Typewriter Effect**: Broker's messages appear character-by-character (30ms per char)
- **User Input**: Text field or button options depending on question type
- **Message History**: Scrollable conversation log
- **Typing Indicator**: Shows when Broker is "typing"
- **Theme Styling**: Adapts colors, fonts, borders to selected mode
- **Keyboard Shortcuts**: 
  - `Enter` to send message
  - `Esc` to clear input (future)
- **Auto-scroll**: Messages auto-scroll to bottom
- **Sound Cues**: 
  - `sound.agentStart()` when Broker speaks
  - `sound.click()` when user sends message

**Message Types:**
1. **Broker Messages**: Left-aligned, primary color border
2. **User Messages**: Right-aligned, accent color border

---

### 3. **broker.ts** (Persona Definition)

**Location**: `packages/core/agent-executor/src/personas/broker.ts`

**Exports:**
- `brokerPersona`: Personality traits and sample phrases
- `brokerConversationFlow`: Structured conversation steps
- `brokerThemeVariations`: Theme-specific styling
- `getNextStep()`: Navigation helper
- `getRandomLine()`: Variation helper

---

## Conversation Flow

### Step-by-Step Breakdown

```
1. GREETING
   Broker: "Agent Broker online. Right… before we start, who am I talking to?"
   
2. ASK NAME
   Broker: "Let's start simple — what's your artist or label name?"
   User: [text input]
   Broker: "Got it." [confirmation]
   
3. ASK GENRE
   Broker: "Genre? Or should I just say 'eclectic'?"
   User: [button options]
   Options:
     - Electronic / Dance
     - Indie / Rock
     - Hip-Hop / R&B
     - Pop
     - Alternative / Experimental
     - Metal / Punk
     - Folk / Singer-Songwriter
     - Jazz / Soul
     - It's complicated
   
4. ASK GOALS
   Broker: "What's the goal? Radio? Press? World domination?"
   User: [button options]
   Options:
     - 🎙️ Radio airplay
     - 📰 Press coverage
     - 🎵 Playlist placement
     - 🎪 Live bookings
     - 📈 All of the above
   
5. ASK EXPERIENCE
   Broker: "Experience level: beginner, DIY warrior, or industry veteran?"
   User: [button options]
   Options:
     - 🌱 Just starting out
     - 🛠️ DIY for a while now
     - 🎯 Done this professionally
     - 🏆 Industry veteran
   
6. COMPLETION
   Broker: "Brilliant. We're all set. Would you like me to build your first campaign flow?"
   User: [button options]
   Options:
     - Yes, let's do it
     - Not yet, show me around first
```

---

## Data Storage

### User Profile Data

Saved to `user_profiles` table (future enhancement):
```typescript
{
  artist_name: string
  genre: string
  goals: string
  experience: string
  onboarding_completed: true
  onboarding_step: "broker_complete"
}
```

### Conversation Messages

Saved to `agent_messages` table:
```typescript
{
  id: uuid
  session_id: string
  from_agent: "broker-agent"
  to_agent: "user"
  content: string
  message_type: "question" | "confirmation" | "info"
  created_at: timestamp
}
```

---

## Theme Integration

Each OS mode gets unique Broker styling:

### ASCII Terminal
- **Prefix**: `⟩`
- **Style**: Command-line persona
- **Colors**: Green text on black
- **Effects**: Scanline overlay
- **Personality**: Technical, precise

### Windows XP
- **Prefix**: `►`
- **Style**: Polite assistant tone
- **Colors**: Blue gradients
- **Effects**: Soft shadows
- **Personality**: Friendly, helpful

### Mac OS Aqua
- **Prefix**: `•`
- **Style**: Friendly, relaxed
- **Colors**: Silver + aqua blue
- **Effects**: Subtle glow
- **Personality**: Casual, supportive

### Ableton Mode
- **Prefix**: `●`
- **Style**: Focused, rhythmic
- **Colors**: Dark grey + orange
- **Effects**: Minimal grid
- **Personality**: Direct, efficient

### Punk Zine
- **Prefix**: `✦`
- **Style**: Chaotic, funny
- **Colors**: Neon magenta + black
- **Effects**: Xerox grit
- **Personality**: Energetic, rebellious

---

## Sound Design

### Audio Cues

| Event | Sound | Description |
|-------|-------|-------------|
| **Broker Appears** | `agentStart()` | Short synth beep sequence |
| **Broker Speaks** | `agentStart()` | Soft vocal ping |
| **User Sends** | `click()` | Button click sound |
| **Confirmation** | `success()` | Success blip (future) |

### Theme-Specific Variations

Each theme can have unique sound profiles:
- **ASCII**: Digital beeps
- **XP**: System sounds
- **Aqua**: Soft chimes
- **Ableton**: Sequencer clicks
- **Punk**: Tape noise

---

## Technical Architecture

### Component Hierarchy

```
BrokerPage (route handler)
  └─ Suspense boundary
      └─ BrokerContent
          ├─ BrokerIntro (1.5s)
          └─ BrokerChat (interactive)
              ├─ Message history
              ├─ Typing indicator
              ├─ Input field / Options
              └─ Submit button
```

### State Management

```typescript
// Local component state
const [messages, setMessages] = useState<Message[]>([])
const [currentStep, setCurrentStep] = useState<ConversationStep | null>(null)
const [userInput, setUserInput] = useState("")
const [isTyping, setIsTyping] = useState(false)
const [showOptions, setShowOptions] = useState(false)
const [userData, setUserData] = useState({
  artistName: "",
  genre: "",
  goals: "",
  experience: ""
})
```

### Conversation Logic

```typescript
// Flow control
1. Load initial greeting
2. Display first question
3. User responds → Save data
4. Show confirmation
5. Load next question
6. Repeat until completion
7. Redirect to homepage or flows
```

---

## User Experience Flow

### Visual Journey

```
OS Transition completes
    ↓
Screen fades to black (200ms)
    ↓
Broker Intro appears with glow pulse (1.5s)
    - Agent icon scales in
    - Status text fades in
    - Preview message appears
    ↓
Fade to Broker Chat (500ms)
    ↓
First message types out (character-by-character)
    ↓
User responds (text or buttons)
    ↓
Broker confirms → Next question
    ↓
Repeat 4 questions
    ↓
Completion: Choose next action
    ↓
Redirect to app
```

### Timing Breakdown

| Phase | Duration | Purpose |
|-------|----------|---------|
| **Intro Fade In** | 100ms | Smooth entry |
| **Icon Animation** | 400ms | Visual interest |
| **Glow Pulse** | 1000ms | Ambient life |
| **Fade to Chat** | 500ms | Seamless transition |
| **Typewriter** | 30ms/char | Natural typing feel |
| **User Think Time** | Variable | Human pacing |
| **Confirmation** | 500ms delay | Natural pause |
| **Next Question** | 1500ms delay | Breathing room |

---

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate through options
- **Enter**: Submit current input
- **Esc**: Clear input field (future)
- **Arrow keys**: Navigate button options (future)

### Screen Readers

- Messages announced as they appear
- Button options clearly labeled
- Input fields have proper labels
- Status updates communicated

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* Instant transitions instead of animations */
  .broker-message {
    animation-duration: 0.01ms !important;
  }
}
```

---

## Future Enhancements

### 1. **Memory & Context**

Remember previous conversations:
```typescript
if (returningUser) {
  broker.say(`Welcome back, ${userData.artistName}! Ready to continue?`)
}
```

### 2. **Campaign Wizard**

If user says "Yes" to building a flow:
```typescript
- Pre-fill Flow Canvas with relevant nodes
- Scout agent searches for contacts
- Coach agent prepares pitch templates
- Tracker agent sets up monitoring
```

### 3. **Multi-Agent Handoff**

Broker introduces other agents:
```
Broker: "Right, I'll hand you over to Scout. He'll find your contacts."
[Scout agent appears with intro animation]
```

### 4. **Dynamic Responses**

AI-powered responses based on user input:
```typescript
const response = await generateBrokerResponse({
  userInput,
  context: userData,
  personality: brokerPersona
})
```

### 5. **Voice Input**

Speech-to-text for hands-free onboarding:
```typescript
<button onClick={startVoiceInput}>
  🎤 Speak your response
</button>
```

---

## Testing Checklist

### Full Flow Test

- [ ] OS Selector → Pick theme
- [ ] Transition animation plays
- [ ] Broker Intro fades in (1.5s)
- [ ] Broker Chat appears
- [ ] First message types out
- [ ] User can type response
- [ ] Enter key submits
- [ ] Confirmation appears
- [ ] Next question loads
- [ ] Button options work
- [ ] All 4 questions complete
- [ ] Final choice redirects correctly
- [ ] Theme styling consistent throughout
- [ ] Sounds play (if enabled)
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Theme-Specific Tests

- [ ] ASCII: Scanlines visible, green text
- [ ] XP: Blue gradients, rounded corners
- [ ] Aqua: Silver + aqua, soft glow
- [ ] Ableton: Dark + orange, minimal
- [ ] Punk: Neon magenta, gritty

---

## Troubleshooting

### Broker Doesn't Appear

**Problem**: Transition ends but Broker doesn't load  
**Solution**:
1. Check URL: should be `/onboarding/broker?mode=ascii`
2. Verify `mode` parameter is valid
3. Check console for errors
4. Ensure BrokerIntro completes (1.5s)

### Messages Don't Type

**Problem**: Text appears instantly  
**Solution**:
1. Check typewriter timing (30ms per character)
2. Verify `isTyping` state is updating
3. Look for timing calculation errors

### Options Don't Show

**Problem**: Buttons don't appear after question  
**Solution**:
1. Check `currentStep.inputType === 'buttons'`
2. Verify `showOptions` state is true
3. Ensure `currentStep.options` array exists

### Theme Not Applied

**Problem**: Wrong colors/fonts showing  
**Solution**:
1. Check `mode` query parameter
2. Verify `THEME_CONFIGS[mode]` exists
3. Check CSS variable application
4. Hard refresh browser

---

## Related Documentation

- [OS_SELECTOR_OVERVIEW.md](./OS_SELECTOR_OVERVIEW.md)
- [OS_TRANSITION_OVERVIEW.md](./OS_TRANSITION_OVERVIEW.md)
- [MULTI_AGENT_COLLAB.md](./MULTI_AGENT_COLLAB.md)

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2025  
**Status**: ✅ Complete

**Credits:**
- Personality inspiration: Music industry veterans, British wit
- Conversation design: Human-first, no corporate speak
- Voice: Dry humour meets genuine helpfulness

