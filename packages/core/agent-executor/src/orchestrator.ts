import { executeSkill } from "@total-audio/core-skills-engine"
import { supabase } from "@total-audio/core-supabase"
import type { AgentStep, AgentWorkflowResult } from "./types"

export async function runAgentWorkflow(
  agentName: string,
  userId: string,
  steps: AgentStep[],
  initialInput: Record<string, any> = {}
): Promise<AgentWorkflowResult> {
  const sessionId = crypto.randomUUID()
  const start = Date.now()

  // Create session
  await supabase.from("agent_sessions").insert({
    id: sessionId,
    agent_name: agentName,
    user_id: userId,
    initial_input: initialInput,
    status: "running",
    current_step: 0,
    total_steps: steps.length,
    started_at: new Date().toISOString()
  })

  const outputs: Record<string, any>[] = []
  let totalTokens = 0
  let totalCost = 0

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      // Update current step
      await supabase
        .from("agent_sessions")
        .update({ current_step: i + 1 })
        .eq("id", sessionId)

      // Insert step record
      const stepId = crypto.randomUUID()
      await supabase.from("agent_session_steps").insert({
        id: stepId,
        session_id: sessionId,
        step_number: i + 1,
        skill_name: step.skill,
        description: step.description,
        input: step.input,
        status: "running",
        started_at: new Date().toISOString()
      })

      try {
        // Execute skill
        const result = await executeSkill(
          step.skill,
          step.input,
          userId,
          sessionId
        )

        outputs.push(result.output)
        totalTokens += result.tokens_used
        totalCost += result.cost_usd

        // Update step as completed
        await supabase
          .from("agent_session_steps")
          .update({
            status: "completed",
            output: result.output,
            completed_at: new Date().toISOString()
          })
          .eq("id", stepId)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        
        // Update step as failed
        await supabase
          .from("agent_session_steps")
          .update({
            status: "failed",
            error_message: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq("id", stepId)

        throw error
      }
    }

    const duration_ms = Date.now() - start

    // Mark session as completed
    await supabase
      .from("agent_sessions")
      .update({
        status: "completed",
        final_output: outputs,
        tokens_used: totalTokens,
        cost_usd: totalCost,
        duration_ms,
        completed_at: new Date().toISOString()
      })
      .eq("id", sessionId)

    return {
      sessionId,
      outputs,
      duration_ms,
      status: "completed"
    }

  } catch (error) {
    const duration_ms = Date.now() - start
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    // Mark session as failed
    await supabase
      .from("agent_sessions")
      .update({
        status: "failed",
        duration_ms,
        completed_at: new Date().toISOString()
      })
      .eq("id", sessionId)

    throw new Error(`Agent workflow failed: ${errorMessage}`)
  }
}

export async function getAgentSession(sessionId: string) {
  const { data: session, error: sessionError } = await supabase
    .from("agent_sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (sessionError) throw sessionError

  const { data: steps, error: stepsError } = await supabase
    .from("agent_session_steps")
    .select("*")
    .eq("session_id", sessionId)
    .order("step_number", { ascending: true })

  if (stepsError) throw stepsError

  return {
    ...session,
    steps
  }
}

