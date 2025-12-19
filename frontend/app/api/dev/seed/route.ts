import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'DISABLED_IN_PROD' }, { status: 403 })
  }
  try {
    const slug = 'dante'
    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.create({ data: { name: 'Dante Gallery', slug, email: 'dante@example.com', theme: 'PURGATORIO', bio: 'Canonical Dante realms demo' } })
    }
    const base = '/Dantes_Divine_Comedy_Gallery'
    const items = [
      { title: 'Gate of Hell', image: `${base}/inferno/01_gate_of_hell.png`, realm: 'INFERNO' },
      { title: 'Limbo', image: `${base}/inferno/02_limbo.png`, realm: 'INFERNO' },
      { title: 'The Shore', image: `${base}/purgatorio/01_shore.png`, realm: 'PURGATORIO' },
      { title: 'Moon', image: `${base}/paradiso/01_moon.png`, realm: 'PARADISO' }
    ] as const

    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      await prisma.galleryItem.upsert({
        where: { artistId_title: { artistId: artist.id, title: it.title } as any },
        update: {},
        create: { artistId: artist.id, title: it.title, image: it.image, realm: it.realm as any, order: i }
      } as any)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'SEED_FAILED' }, { status: 500 })
  }
}
