import { executeSkill } from '@total-audio/core-skills-engine'
import { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const input = await request.json()
    
    // TODO: Replace with real auth once Supabase is configured
    // For now, use a demo user ID for testing
    const authHeader = request.headers.get('Authorization')
    const userId = authHeader === 'Bearer demo-token' 
      ? 'demo-user-id' 
      : 'anonymous'
    
    const result = await executeSkill(params.name, input, userId)
    
    return Response.json(result)
  } catch (error) {
    console.error('Skill execution error:', error)
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

