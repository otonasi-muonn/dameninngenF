import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: list episodes
  return NextResponse.json({ items: [] })
}

export async function POST() {
  // TODO: create episode
  return NextResponse.json({ ok: true }, { status: 201 })
}
