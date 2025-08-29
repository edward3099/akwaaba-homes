import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      message: 'Test API working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Test API failed' },
      { status: 500 }
    )
  }
}
