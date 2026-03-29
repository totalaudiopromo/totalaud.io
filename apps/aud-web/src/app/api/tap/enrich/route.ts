import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'This endpoint has been retired' },
    { status: 410 }
  )
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'This endpoint has been retired' },
    { status: 410 }
  )
}
