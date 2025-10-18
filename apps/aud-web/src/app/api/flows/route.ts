import { supabase } from "@total-audio/core-supabase"
import { NextRequest } from "next/server"

// GET /api/flows - List all flows for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo-user-id"
    
    const { data, error } = await supabase
      .from("agent_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return Response.json({ flows: data })
  } catch (error) {
    console.error("Failed to fetch flows:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// POST /api/flows - Create a new flow session
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo-user-id"
    const body = await req.json()

    const { data, error } = await supabase
      .from("agent_sessions")
      .insert({
        agent_name: body.agent_name || "custom-flow",
        user_id: userId,
        name: body.name,
        description: body.description,
        initial_input: body.initial_input || {},
        status: "pending"
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ flow: data })
  } catch (error) {
    console.error("Failed to create flow:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

