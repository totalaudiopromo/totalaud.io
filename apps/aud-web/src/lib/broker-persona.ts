/**
 * Broker Agent Persona
 * 
 * The first agent users meet - a witty, British studio assistant
 * who guides them through initial setup with dry humour and genuine helpfulness.
 */

export interface BrokerPersona {
  id: string
  name: string
  emoji: string
  role: string
  tone: string
  color: string
  
  // Conversation flow
  openingLines: string[]
  questions: {
    artistName: string[]
    genre: string[]
    goals: string[]
    experience: string[]
  }
  confirmations: string[]
  transitions: string[]
}

export const brokerPersona: BrokerPersona = {
  id: "broker-agent",
  name: "Broker",
  emoji: "🎙️",
  role: "Your Audio Liaison",
  tone: "dry, witty, supportive - like a veteran music promoter who's seen it all",
  color: "#6366f1", // Indigo
  
  openingLines: [
    "Agent Broker online.",
    "Right… before we start, who am I talking to?",
    "Don't worry, I'm not going to sell you a sync deal just yet."
  ],
  
  questions: {
    artistName: [
      "Let's start simple — what's your artist or label name?",
      "And you are…?",
      "Right. Name for the database?"
    ],
    
    genre: [
      "Genre? Or should I just say 'eclectic'?",
      "What style are we working with here?",
      "If I had to find you on a festival lineup, where would you be?"
    ],
    
    goals: [
      "What's the goal? Radio? Press? World domination?",
      "What are we actually trying to do here?",
      "Realistically — what's success look like for this project?"
    ],
    
    experience: [
      "And how long have you been at this game?",
      "First rodeo, or have you done this dance before?",
      "Experience level: beginner, DIY warrior, or industry veteran?"
    ]
  },
  
  confirmations: [
    "Got it.",
    "Right, noted.",
    "Perfect. Moving on.",
    "Brilliant.",
    "Okay, we're getting somewhere."
  ],
  
  transitions: [
    "Right, let's keep this moving…",
    "One more thing, then we're done…",
    "Nearly there…",
    "Last question, I promise…",
    "Alright, final bit…"
  ]
}

/**
 * Get a random line from an array
 */
export function getRandomLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

/**
 * Broker's conversation tree
 */
export interface ConversationStep {
  id: string
  type: 'greeting' | 'question' | 'confirmation' | 'completion'
  message: string
  inputType?: 'text' | 'select' | 'buttons'
  options?: string[]
  nextStep?: string
}

export const brokerConversationFlow: ConversationStep[] = [
  {
    id: "greeting",
    type: "greeting",
    message: "Agent Broker online. Right… before we start, who am I talking to?",
    nextStep: "ask_name"
  },
  {
    id: "ask_name",
    type: "question",
    message: "Let's start simple — what's your artist or label name?",
    inputType: "text",
    nextStep: "ask_genre"
  },
  {
    id: "ask_genre",
    type: "question",
    message: "Genre? Or should I just say 'eclectic'?",
    inputType: "buttons",
    options: [
      "Electronic / Dance",
      "Indie / Rock",
      "Hip-Hop / R&B",
      "Pop",
      "Alternative / Experimental",
      "Metal / Punk",
      "Folk / Singer-Songwriter",
      "Jazz / Soul",
      "It's complicated"
    ],
    nextStep: "ask_goals"
  },
  {
    id: "ask_goals",
    type: "question",
    message: "What's the goal? Radio? Press? World domination?",
    inputType: "buttons",
    options: [
      "🎙️ Radio airplay",
      "📰 Press coverage",
      "🎵 Playlist placement",
      "🎪 Live bookings",
      "📈 All of the above"
    ],
    nextStep: "ask_experience"
  },
  {
    id: "ask_experience",
    type: "question",
    message: "Experience level: beginner, DIY warrior, or industry veteran?",
    inputType: "buttons",
    options: [
      "🌱 Just starting out",
      "🛠️ DIY for a while now",
      "🎯 Done this professionally",
      "🏆 Industry veteran"
    ],
    nextStep: "completion"
  },
  {
    id: "completion",
    type: "completion",
    message: "Brilliant. We're all set. Would you like me to build your first campaign flow?",
    inputType: "buttons",
    options: [
      "Yes, let's do it",
      "Not yet, show me around first"
    ]
  }
]

/**
 * Get next conversation step
 */
export function getNextStep(currentStepId: string): ConversationStep | null {
  const currentStep = brokerConversationFlow.find(s => s.id === currentStepId)
  if (!currentStep || !currentStep.nextStep) return null
  
  return brokerConversationFlow.find(s => s.id === currentStep.nextStep) || null
}

/**
 * Theme-specific Broker variations
 */
export const brokerThemeVariations = {
  ascii: {
    prefix: "⟩",
    style: "command-line persona",
    greeting: "agent broker online_"
  },
  xp: {
    prefix: "►",
    style: "polite assistant tone",
    greeting: "Broker.exe initialized"
  },
  aqua: {
    prefix: "•",
    style: "friendly, relaxed",
    greeting: "Hey, Broker here."
  },
  ableton: {
    prefix: "●",
    style: "focused, rhythmic",
    greeting: "BROKER: ONLINE"
  },
  punk: {
    prefix: "✦",
    style: "chaotic, funny",
    greeting: "YO. BROKER. LET'S GO."
  }
}

