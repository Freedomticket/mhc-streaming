import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const artistSlug = searchParams.get('artist')
  try {
    const where = artistSlug ? { artist: { slug: artistSlug } } : {}
    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    })
    return NextResponse.json({ ok: true, data: items })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { artistId, title, description, image, realm, order = 0 } = body
    if (!artistId || !title || !image || !realm) return NextResponse.json({ ok: false, error: 'MISSING_FIELDS' }, { status: 400 })
    const item = await prisma.galleryItem.create({ data: { artistId, title, description, image, realm, order } })
    return NextResponse.json({ ok: true, data: item }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'CREATE_FAILED' }, { status: 500 })
  }
}
