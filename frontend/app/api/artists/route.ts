import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, theme: true, verified: true }
    })
    return NextResponse.json({ ok: true, data: artists })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let body: any
    if (contentType.includes('application/json')) body = await req.json()
    else { const form = await req.formData(); body = Object.fromEntries(form.entries()) }

    const { name, email, slug, theme = 'PURGATORIO', bio } = body
    if (!name || !email || !slug) return NextResponse.json({ ok: false, error: 'MISSING_FIELDS' }, { status: 400 })
    const artist = await prisma.artist.create({ data: { name, email, slug, theme, bio } })
    return NextResponse.json({ ok: true, data: artist }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'CREATE_FAILED' }, { status: 500 })
  }
}
