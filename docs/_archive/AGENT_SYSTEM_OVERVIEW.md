# Agent System Overview

The TotalAud.io agent system provides a flexible, observable framework for orchestrating AI-powered workflows through composable skills.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                         │
│              (Command Palette, Agent Bubbles)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Agent Orchestrator                        │
│           (@total-audio/core-agent-executor)                │
│                                                             │
│  • Manages multi-step workflows                            │
│  • Tracks execution state                                  │
│  • Handles errors and retries                              │
│  • Logs to database                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Skills Engine                            │
│            (@total-audio/core-skills-engine)                │
│                                                             │
│  • Loads YAML skill definitions                            │
│  • Routes to AI providers or custom logic                  │
│  • Tracks tokens and costs                                 │
│  • Validates input/output schemas                          │
└────────────────────┬────────────────────────────────────────┘
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│  AI Providers    │  │  Custom Skills   │
│  (OpenAI/Claude) │  │  (APIs, DBs)     │
└──────────────────┘  └──────────────────┘
```

## Key Concepts

### 1. Skills

**Skills** are atomic capabilities defined in YAML files. Each skill has:

- **Name**: Unique identifier
- **Category**: research, generation, analysis, communication
- **Provider**: openai, anthropic, or custom
- **Input Schema**: Structured input requirements
- **Output Schema**: Expected output format
- **Configuration**: Model settings, parameters, etc.

Example:

```yaml
name: research-contacts
category: research
provider: custom
input:
  query: string
  type: enum[playlist, radio, journalist]
  genres: string[]
output:
  contacts: Contact[]
```

### 2. Agents

**Agents** are intelligent personas that orchestrate multiple skills to accomplish complex tasks. They:

- Have a specific domain (Scout, Coach, Tracker)
- Access a curated set of skills
- Maintain conversation context
- Learn from user interactions
- Provide personality and guidance

Example agent workflow:

```typescript
const result = await runAgentWorkflow(
  "scout-agent",
  userId,
  [
    {
      skill: "research-contacts",
      description: "Find radio contacts",
      input: { query, type: "radio", genres, regions }
    },
    {
      skill: "score-contacts",
      description: "Rank by relevance",
      input: { contacts: "{{step1.contacts}}", criteria }
    },
    {
      skill: "generate-pitch",
      description: "Create personalized messages",
      input: { contacts: "{{step2.contacts}}", artistInfo }
    }
  ]
)
```

### 3. Sessions

Every agent workflow creates a **session** that:

- Tracks execution state (pending → running → completed/failed)
- Stores input, output, and intermediate results
- Calculates token usage and costs
- Enables real-time monitoring via Supabase Realtime
- Provides audit trail for debugging

### 4. Execution Trace

Each skill execution creates detailed logs:

```typescript
{
  skill_name: "research-contacts",
  input: { query: "indie radio UK", ... },
  output: { contacts: [...] },
  duration_ms: 523,
  tokens_used: 0,  // Custom skills don't use tokens
  cost_usd: 0,
  status: "success"
}
```

## Database Schema

### `skills` Table

Registry of available skills:

```sql
CREATE TABLE skills (
  name text PRIMARY KEY,
  version text NOT NULL,
  category text NOT NULL,
  description text,
  input_schema jsonb NOT NULL,
  output_schema jsonb NOT NULL,
  provider text NOT NULL,
  model text,
  config jsonb DEFAULT '{}',
  enabled boolean DEFAULT true,
  is_beta boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### `agent_sessions` Table

Workflow execution tracking:

```sql
CREATE TABLE agent_sessions (
  id uuid PRIMARY KEY,
  agent_name text NOT NULL,
  user_id uuid NOT NULL,
  initial_input jsonb NOT NULL,
  final_output jsonb,
  status text DEFAULT 'pending',
  current_step integer DEFAULT 0,
  total_steps integer,
  tokens_used integer DEFAULT 0,
  cost_usd numeric DEFAULT 0,
  duration_ms integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
```

### `agent_session_steps` Table

Individual step execution:

```sql
CREATE TABLE agent_session_steps (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES agent_sessions(id),
  step_number integer NOT NULL,
  skill_name text REFERENCES skills(name),
  description text,
  input jsonb,
  output jsonb,
  status text DEFAULT 'pending',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz
);
```

### `skill_executions` Table

Detailed execution logs:

```sql
CREATE TABLE skill_executions (
  id uuid PRIMARY KEY,
  skill_name text REFERENCES skills(name),
  input jsonb NOT NULL,
  output jsonb,
  duration_ms integer,
  tokens_used integer,
  cost_usd numeric,
  status text,
  error_message text,
  agent_session_id uuid REFERENCES agent_sessions(id),
  user_id uuid,
  started_at timestamptz DEFAULT now()
);
```

## Skill Types

### AI-Powered Skills

Use OpenAI or Anthropic models for natural language tasks:

```yaml
name: generate-pitch
category: generation
provider: anthropic
model: claude-sonnet-4-20250514
input:
  artist_name: string
  genre: string
  contact_name: string
output:
  subject: string
  body: string
  tone: string
```

### Custom Skills

Execute custom logic (API calls, database queries, etc.):

```yaml
name: research-contacts
category: research
provider: custom
# Custom implementation in:
# packages/core/skills-engine/src/custom/researchContacts.ts
```

Custom skills are implemented in TypeScript:

```typescript
export async function researchContactsCustom(input: {
  query: string
  type: string
  genres: string[]
  regions: string[]
}): Promise<{ contacts: Contact[] }> {
  // Call external API, database, etc.
  const contacts = await audioIntelAPI.search(input)
  return { contacts }
}
```

## Agent Personas

### Scout Agent 🔍

**Purpose**: Research and discovery

**Skills**:
- `research-contacts` - Find press, radio, playlists
- `discover-opportunities` - Identify submission targets
- `analyze-competition` - Research similar artists
- `track-trends` - Monitor genre/region trends

**Use Case**: "Find me UK indie radio DJs who like synthpop"

### Coach Agent 💬

**Purpose**: Content generation and strategy

**Skills**:
- `generate-pitch` - Personalized outreach messages
- `write-press-release` - Professional press materials
- `create-campaign-plan` - Marketing strategy
- `suggest-hashtags` - Social media optimization

**Use Case**: "Write a pitch for my new single to BBC Radio 6"

### Tracker Agent 📊

**Purpose**: Monitoring and analytics

**Skills**:
- `track-campaign` - Monitor outreach performance
- `analyze-responses` - Response rate analytics
- `predict-success` - ML-based outcome prediction
- `generate-report` - Comprehensive insights

**Use Case**: "How is my campaign performing this week?"

### Insight Agent 💡

**Purpose**: Pattern recognition and recommendations

**Skills**:
- `identify-patterns` - Discover success factors
- `recommend-next-steps` - Actionable guidance
- `benchmark-performance` - Compare to similar artists
- `optimize-timing` - Best times to reach out

**Use Case**: "What's working best for artists like me?"

## Cost Tracking

All AI usage is automatically tracked:

```typescript
// Skills engine automatically logs:
{
  tokens_used: 1247,        // Total input + output tokens
  cost_usd: 0.0156,         // Calculated based on model pricing
  model: "gpt-4o",          // Model used
  provider: "openai"        // Provider
}

// Aggregated at session level:
{
  session_id: "uuid",
  total_tokens: 4521,
  total_cost_usd: 0.0623,
  duration_ms: 2340
}
```

## Observability

### Real-time Updates

Agent sessions support real-time subscriptions:

```typescript
const subscription = supabase
  .channel('agent-session')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'agent_sessions',
    filter: `id=eq.${sessionId}`
  }, (payload) => {
    console.log('Session updated:', payload.new)
  })
  .subscribe()
```

### Execution Timeline

View step-by-step execution:

```typescript
const session = await getAgentSession(sessionId)
// Returns:
{
  id: "uuid",
  status: "completed",
  steps: [
    { step_number: 1, skill: "research-contacts", status: "completed", duration: 523 },
    { step_number: 2, skill: "score-contacts", status: "completed", duration: 234 },
    { step_number: 3, skill: "generate-pitch", status: "completed", duration: 1820 }
  ],
  total_duration: 2577,
  total_cost: 0.0234
}
```

## Error Handling

The agent system provides comprehensive error handling:

### Skill-Level Errors

```typescript
try {
  await executeSkill("research-contacts", input, userId)
} catch (error) {
  // Logged to skill_executions with:
  // - status: "error"
  // - error_message: error.message
  // - partial results if available
}
```

### Workflow-Level Errors

```typescript
try {
  await runAgentWorkflow(agentName, userId, steps)
} catch (error) {
  // Session marked as "failed"
  // Failed step identified
  // Previous steps preserved
  // Retry capability maintained
}
```

## Future Enhancements

### Phase 2: AI Agent Intelligence

Transform agents from step executors into intelligent assistants:

- **Natural Language Planning**: "Find me radio contacts" → Auto-generate workflow
- **Context Awareness**: Remember previous sessions and preferences
- **Adaptive Workflows**: Adjust strategy based on results
- **Proactive Suggestions**: "You might also want to..."

### Phase 3: Multi-Agent Collaboration

Enable agents to work together:

- **Scout** finds contacts → **Coach** generates pitches → **Tracker** monitors results
- Cross-agent learning and optimization
- Coordinated campaigns across multiple channels

### Phase 4: User Personas

Customize agent behavior per user:

- Industry role (artist, PR, label)
- Experience level (beginner, expert)
- Communication preferences (brief, detailed)
- Risk tolerance (conservative, experimental)

## API Reference

### Execute Single Skill

```typescript
import { executeSkill } from '@total-audio/core-skills-engine'

const result = await executeSkill(
  "research-contacts",
  { query, type, genres, regions },
  userId,
  sessionId // optional
)
```

### Run Agent Workflow

```typescript
import { runAgentWorkflow } from '@total-audio/core-agent-executor'

const { sessionId, outputs } = await runAgentWorkflow(
  "scout-agent",
  userId,
  [
    { skill: "research-contacts", description: "...", input: {...} },
    { skill: "score-contacts", description: "...", input: {...} }
  ]
)
```

### Get Session Details

```typescript
import { getAgentSession } from '@total-audio/core-agent-executor'

const session = await getAgentSession(sessionId)
```

## Best Practices

### Skill Design

1. **Single Responsibility**: Each skill does one thing well
2. **Clear Schemas**: Well-defined input/output contracts
3. **Idempotency**: Same input → same output
4. **Fast Execution**: < 5s for custom skills, < 30s for AI skills

### Workflow Design

1. **Progressive Enhancement**: Start simple, add complexity
2. **Early Validation**: Fail fast on invalid input
3. **Checkpoint Progress**: Save intermediate results
4. **Graceful Degradation**: Partial results better than nothing

### Cost Management

1. **Cache Aggressively**: Store and reuse results
2. **Lazy Execution**: Only run necessary skills
3. **Budget Limits**: Set per-user/per-session caps
4. **Model Selection**: Use the smallest capable model

## Conclusion

The TotalAud.io agent system provides a powerful, observable, and cost-effective foundation for AI-powered music marketing workflows. By separating concerns (skills, agents, orchestration) and maintaining comprehensive logging, we enable rapid iteration while maintaining reliability and transparency.

---

For implementation details, see:
- [UI Next Phase](./UI_NEXT_PHASE.md)
- [Skills Engine README](../packages/core/skills-engine/README.md)
- [Agent Executor README](../packages/core/agent-executor/README.md)

