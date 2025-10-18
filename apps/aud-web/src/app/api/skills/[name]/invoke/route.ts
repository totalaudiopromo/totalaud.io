import { executeSkill } from '@total-audio/core-skills-engine'
import { getUserId } from '@total-audio/core-supabase'
import { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const userId = await getUserId(request)
    const input = await request.json()
    
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

