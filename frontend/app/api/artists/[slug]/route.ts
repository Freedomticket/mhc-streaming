import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const artist = await prisma.artist.findUnique({ where: { slug: params.slug } })
    if (!artist) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ ok: true, data: artist })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  try {
    let body: any
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData()
      body = Object.fromEntries(form.entries())
    } else {
      body = await req.json().catch(() => ({}))
    }
    const { name, bio, theme } = body
    const artist = await prisma.artist.update({ where: { slug: params.slug }, data: { name, bio, theme } })
    return NextResponse.json({ ok: true, data: artist })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'UPDATE_FAILED' }, { status: 500 })
  }
}
