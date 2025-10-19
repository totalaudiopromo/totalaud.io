import { supabase } from "@total-audio/core-supabase"
import { NextRequest } from "next/server"

// GET /api/flows/[id] - Get a specific flow session
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { data, error } = await supabase
      .from("agent_sessions")
      .select("*, agent_session_steps(*)")
      .eq("id", resolvedParams.id)
      .single()

    if (error) throw error

    return Response.json({ flow: data })
  } catch (error) {
    console.error("Failed to fetch flow:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// PATCH /api/flows/[id] - Update flow session
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json()
    const resolvedParams = await params

    const { data, error } = await supabase
      .from("agent_sessions")
      .update(body)
      .eq("id", resolvedParams.id)
      .select()
      .single()

    if (error) throw error

    return Response.json({ flow: data })
  } catch (error) {
    console.error("Failed to update flow:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// DELETE /api/flows/[id] - Delete a flow session
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { error } = await supabase
      .from("agent_sessions")
      .delete()
      .eq("id", resolvedParams.id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error("Failed to delete flow:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

